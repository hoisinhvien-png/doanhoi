// Sao lưu toàn bộ dữ liệu cơ sở dữ liệu (Aiven PostgreSQL) ra 1 file .sql
// Chạy: npm run backup
//
// - Không cần cài thêm gì (dùng thư viện pg có sẵn và Node).
// - Tự đọc DATABASE_URL + DATABASE_CA trong .env, kết nối SSL có xác minh.
// - Xuất DỮ LIỆU của mọi bảng (đúng thứ tự khoá ngoại) ra:
//       backup/doanhoi_YYYYMMDD_HHMMSS.sql
// - File chỉ chứa DỮ LIỆU; CẤU TRÚC bảng do Prisma migrations giữ.
//   Khôi phục: tạo CSDL rỗng -> `npx prisma migrate deploy` -> nạp file .sql này.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client, types } = pg;

// Lấy ngày/giờ ở dạng chuỗi gốc của PostgreSQL (tránh lệch múi giờ khi round-trip)
types.setTypeParser(1082, (v) => v); // date
types.setTypeParser(1114, (v) => v); // timestamp
types.setTypeParser(1184, (v) => v); // timestamptz

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// --- Đọc .env (hỗ trợ giá trị nhiều dòng trong ngoặc kép, vd chứng chỉ CA) ---
function loadEnv(file) {
  const txt = fs.readFileSync(file, "utf8");
  const env = {};
  const re = /^([A-Za-z_][A-Za-z0-9_]*)=(?:"([\s\S]*?)"|'([\s\S]*?)'|(.*))$/gm;
  let m;
  while ((m = re.exec(txt)) !== null) {
    env[m[1]] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return env;
}

// --- Biến một giá trị JS thành literal SQL an toàn ---
function lit(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "bigint") return v.toString();
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

function two(n) {
  return String(n).padStart(2, "0");
}

async function main() {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) {
    console.error("Không tìm thấy .env ở", envPath);
    process.exit(1);
  }
  const env = loadEnv(envPath);
  if (!env.DATABASE_URL) {
    console.error("Thiếu DATABASE_URL trong .env");
    process.exit(1);
  }

  const url = new URL(env.DATABASE_URL);
  url.searchParams.delete("sslmode");
  const client = new Client({
    connectionString: url.toString(),
    ssl: env.DATABASE_CA
      ? { ca: env.DATABASE_CA, rejectUnauthorized: true }
      : undefined,
  });

  console.log("Đang kết nối cơ sở dữ liệu…");
  await client.connect();

  // Danh sách bảng (bỏ bảng nội bộ của Prisma)
  const tablesRes = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name <> '_prisma_migrations'
  `);
  const allTables = tablesRes.rows.map((r) => r.table_name);

  // Quan hệ khoá ngoại: con phụ thuộc cha -> cha phải nạp trước
  const fkRes = await client.query(`
    SELECT tc.table_name AS child, ccu.table_name AS parent
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
     AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  `);
  const deps = new Map(allTables.map((t) => [t, new Set()]));
  for (const { child, parent } of fkRes.rows) {
    if (child !== parent && deps.has(child) && allTables.includes(parent)) {
      deps.get(child).add(parent);
    }
  }
  // Sắp xếp tô-pô (cha trước con)
  const ordered = [];
  const seen = new Set();
  const visit = (t, stack = new Set()) => {
    if (seen.has(t) || stack.has(t)) return;
    stack.add(t);
    for (const p of deps.get(t)) visit(p, stack);
    stack.delete(t);
    seen.add(t);
    ordered.push(t);
  };
  for (const t of allTables) visit(t);

  // Dựng nội dung file
  const now = new Date();
  const stamp =
    `${now.getFullYear()}${two(now.getMonth() + 1)}${two(now.getDate())}_` +
    `${two(now.getHours())}${two(now.getMinutes())}${two(now.getSeconds())}`;
  const human =
    `${two(now.getDate())}/${two(now.getMonth() + 1)}/${now.getFullYear()} ` +
    `${two(now.getHours())}:${two(now.getMinutes())}`;

  const out = [];
  out.push(`-- Sao lưu dữ liệu phần mềm Đoàn - Hội HTU`);
  out.push(`-- Thời điểm: ${human}`);
  out.push(`-- Nguồn: ${url.hostname}/${url.pathname.slice(1)}`);
  out.push(`-- LƯU Ý: file này chỉ chứa DỮ LIỆU. Cấu trúc bảng do Prisma migrations tạo.`);
  out.push(`--   Khôi phục vào CSDL rỗng: chạy 'npx prisma migrate deploy' rồi nạp file này.`);
  out.push(`SET standard_conforming_strings = on;`);
  out.push(`SET client_encoding = 'UTF8';`);
  out.push(`BEGIN;`);
  out.push("");

  const counts = {};
  for (const table of ordered) {
    const res = await client.query(`SELECT * FROM "${table}"`);
    counts[table] = res.rowCount;
    out.push(`-- Bảng "${table}" (${res.rowCount} dòng)`);
    if (res.rowCount === 0) {
      out.push("");
      continue;
    }
    const cols = res.fields.map((f) => f.name);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    for (const row of res.rows) {
      const vals = cols.map((c) => lit(row[c])).join(", ");
      out.push(`INSERT INTO "${table}" (${colList}) VALUES (${vals});`);
    }
    out.push("");
  }
  out.push(`COMMIT;`);
  out.push("");

  await client.end();

  // Ghi file
  const dir = path.join(projectRoot, "backup");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `doanhoi_${stamp}.sql`);
  fs.writeFileSync(file, out.join("\n"), "utf8");

  const kb = (fs.statSync(file).size / 1024).toFixed(1);
  console.log("");
  console.log("✓ Sao lưu xong:");
  for (const t of ordered) console.log(`   - ${t}: ${counts[t]} dòng`);
  console.log("");
  console.log(`   File: ${file}`);
  console.log(`   Dung lượng: ${kb} KB`);
}

main().catch((err) => {
  console.error("LỖI khi sao lưu:", err.message);
  process.exit(1);
});
