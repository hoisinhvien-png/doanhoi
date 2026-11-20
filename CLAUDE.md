# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Web app theo dõi hoạt động Đoàn – Hội, Trường Đại học Hà Tĩnh: quản lý sự kiện, đăng ký tham gia, xác nhận và xếp loại đoàn viên. Toàn bộ giao diện, đường dẫn, chú thích code và commit đều bằng **tiếng Việt** — giữ nguyên quy ước này.

## Stack

Next.js 16.4 (App Router, Turbopack, `cacheComponents: true`, `partialPrefetching`) · React 19 · TypeScript · Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`) · PostgreSQL trên Aiven · Tailwind 4 + shadcn/ui (style `base-nova`, dùng `@base-ui/react`) · Recharts · ExcelJS · `jose` + `bcryptjs` · Vercel (region `sin1`).

Next 16 khác nhiều so với dữ liệu huấn luyện (xem AGENTS.md): middleware giờ là `src/proxy.ts` (hàm `proxy`), làm mới dữ liệu sau server action bằng `refresh()` từ `next/cache`. Đọc `node_modules/next/dist/docs/` trước khi dùng API lạ.

## Lệnh

```bash
npm run dev                 # http://localhost:3000
npm run build               # kiểm tra như build trên Vercel (cũng là cách kiểm tra kiểu TS)
npm run lint                # eslint (next core-web-vitals + typescript)
npx prisma migrate dev --name <ten>   # sau khi sửa prisma/schema.prisma
npx prisma db seed          # tài khoản Đoàn trường đầu tiên (ADMIN_EMAIL/ADMIN_PASSWORD) + ngưỡng xếp loại
npm run studio              # Prisma Studio cổng 5555 — tắt khi xong vì chiếm kết nối CSDL
npm run seed:demo           # tài khoản thử (@demo.local, DEMO001, DEMO002; mật khẩu DEMO_PASSWORD)
npm run cleanup:demo        # xoá dữ liệu thử
npm run reset-password
```

Không có bộ test tự động. Kiểm tra bằng `npm run build`, `npm run lint` và chạy thử với tài khoản demo.

Script trong `prisma/` import code từ `src/lib/` có `import "server-only"` → chạy bằng `npx tsx --conditions=react-server prisma/<file>.ts` nếu script đụng tới những module đó (ví dụ `backfill-username.ts`, thêm `--ghi` để ghi thật).

Prisma Client được sinh vào `src/generated/prisma` (bị gitignore, tạo bởi `postinstall`); import từ `@/generated/prisma/client` hoặc `@/generated/prisma/enums`.

## Kiến trúc

**Ba vai trò, ba cây route:** `ADMIN` (Đoàn trường) → `src/app/quan-tri/`, `LCD` (Liên chi Đoàn khoa) → `src/app/lien-chi/`, `STUDENT` → `src/app/sinh-vien/`. `src/lib/roles.ts` là nguồn duy nhất cho trang chủ, nhãn và menu từng vai trò, và không đụng CSDL (để dùng được trong proxy). Mỗi cây có `[...trang]/page.tsx` bắt các mục menu chưa làm (trang "Sắp có").

**Phân quyền hai lớp:**
- `src/proxy.ts` chỉ kiểm tra nhanh từ cookie (chuyển hướng theo vai trò, ép đổi mật khẩu). Nó **không chặn `/api`**.
- Kiểm tra chính thức ở `src/lib/dal.ts`: `getCurrentUser()` (cache theo request, đọc lại user từ CSDL, coi tài khoản `locked` như đã đăng xuất) và `requireRole(role)`. Mọi page và server action phải gọi một trong hai.
- Route `/api/excel/*` dùng `apiUser([...roles])` / `forbidden()` / `xlsxResponse()` trong `src/lib/api-auth.ts`.
- Khi phiên không còn hợp lệ phải redirect qua `/dang-xuat` (xoá cookie), nếu không proxy và dal đẩy qua lại mãi.
- LCĐ luôn bị giới hạn theo `user.faculty` — mọi truy vấn của LCĐ phải lọc theo khoa.

**Phiên đăng nhập:** `src/lib/session.ts` — JWT HS256 trong cookie `dh_session` (7 ngày), payload `{ userId, role, mustChangePassword }`. Cần `SESSION_SECRET` ≥ 32 ký tự.

**Ghi dữ liệu:** server actions trong `src/app/actions/*.ts` (`"use server"`), gọi `refresh()` sau khi ghi. Form client nằm cạnh page (`*-form.tsx`, `*-panel.tsx`).

**Logic nghiệp vụ trong `src/lib/`:**
- `attendance.ts` — trạng thái tham gia và hạn xác nhận của LCĐ (`lcdWindow`: upcoming/open/locked). Không đụng CSDL, dùng được cả phía client.
- `grading.ts` — tính điểm/xếp loại; `parseDateInput`, `defaultRange`.
- `stats.ts` (dashboard, `schoolYear`), `report.ts` (truy vấn báo cáo theo query string `sk/tu/den/khoa/lop/tt`), `queries.ts` (truy vấn dùng chung).
- `excel-import.ts` / `excel-export.ts` — đọc/ghi Excel bằng ExcelJS; `username.ts` — sinh tên tài khoản.
- `format.ts` — ngày giờ theo giờ Việt Nam. Vercel chạy UTC nên **luôn** dùng các hàm ở đây (`startOfTodayVN`, `formatDate`, ...) thay vì `new Date()` trần khi so sánh theo ngày.

**CSDL:** `src/lib/prisma.ts` tạo client với chứng chỉ CA Aiven từ `DATABASE_CA` và pool nhỏ (`DB_POOL_MAX`, mặc định 3; gói Aiven miễn phí chỉ ~20 kết nối). Model: `User`, `Event`, `EventParticipation` (unique `userId_eventId`), `GradingRule`. `Event.faculty` null = sự kiện toàn trường.

## Quy tắc nghiệp vụ (từ README)

- Lượt đăng ký chỉ có 2 trạng thái hiển thị: **Tham gia** (`CONFIRMED`) / **Không tham gia** (`PENDING`, hoặc `REJECTED` là dữ liệu cũ). Đăng ký xong mặc định là `PENDING`.
- LCĐ xác nhận cho sinh viên khoa mình từ lúc sự kiện diễn ra đến hết ngày thứ 7 sau đó (giờ VN); quá hạn thì khoá, chỉ ADMIN đổi được (bất cứ lúc nào).
- Năm học: 01/08 → 31/07 năm sau.
- Điểm = số sự kiện Tham gia ÷ số sự kiện được tham gia (toàn trường + khoa mình) trong khoảng thời gian × 10. Ngưỡng mặc định: Tốt ≥ 8, Khá ≥ 6.5, Trung bình ≥ 5, còn lại Yếu (sửa được trên web qua `GradingRule`).
- Nhập sinh viên từ Excel nhận cả file từ phần mềm đào tạo (cột `MaSV, HoLotSV, TenSV, NgaySinhC, TenLop, TenKhoa`). Tên tài khoản = TÊN + chữ đầu họ đệm + 4 số cuối mã SV + `_` + viết tắt khoa (VD `DIEUTH2025_NN`; NN, KTCN, SP, KT, CTL, NNMT). Mật khẩu ban đầu = ngày sinh `ddMMyyyy`, bắt đổi ở lần đăng nhập đầu. Đăng nhập bằng tên tài khoản hoặc mã SV.
- Upload Excel qua server action tối đa 4MB (`next.config.ts`; Vercel giới hạn 4.5MB).

## Môi trường

Xem `.env.example`: `DATABASE_URL`, `DATABASE_CA`, `SESSION_SECRET`, `DB_POOL_MAX`, `ADMIN_EMAIL`/`ADMIN_PASSWORD` (chỉ cho seed), `DEMO_PASSWORD` (chỉ cho seed:demo).
