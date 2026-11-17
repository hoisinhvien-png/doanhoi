// Kiểm tra quyền cho các đường dẫn tải file (/api/...), vì proxy.ts không chặn /api.
import "server-only";
import { getCurrentUser, type CurrentUser } from "./dal";
import type { RoleName } from "./roles";

export async function apiUser(roles: RoleName[]): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user || user.mustChangePassword || !roles.includes(user.role)) return null;
  return user;
}

export function forbidden() {
  return new Response("Bạn không có quyền tải file này. Hãy đăng nhập lại.", {
    status: 403,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Trả file .xlsx về trình duyệt, tên file có dấu tiếng Việt */
export function xlsxResponse(buffer: ArrayBuffer | Buffer, filename: string) {
  const ascii = filename.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^\w.-]+/g, "_");
  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
