"use server";

import { put } from "@vercel/blob";
import { requireRole } from "@/lib/dal";

export type UploadResult = { url?: string; error?: string };

/** Tải một ảnh từ máy lên kho Vercel Blob (public), trả về URL. Chỉ Đoàn trường. */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireRole("ADMIN");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Chưa chọn ảnh." };
  if (!file.type.startsWith("image/")) return { error: "Chỉ nhận tệp ảnh (jpg, png, webp…)." };
  if (file.size > 4 * 1024 * 1024) return { error: "Ảnh tối đa 4MB. Vui lòng chọn ảnh nhỏ hơn." };

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `tin-tuc/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "png"}`;

  try {
    const blob = await put(key, file, { access: "public" });
    return { url: blob.url };
  } catch {
    return { error: "Tải ảnh lên thất bại. Thử lại giúp em." };
  }
}
