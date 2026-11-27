"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

export type ArticleFormState = { error?: string } | undefined;

const ADMIN_HOME = "/quan-tri/tin-tuc";

function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  const pinned = formData.get("pinned") === "on";
  const publish = formData.get("status") === "PUBLISHED";

  if (title.length < 3) return { error: "Tiêu đề cần ít nhất 3 ký tự." } as const;
  if (content.length < 1) return { error: "Vui lòng nhập nội dung bài." } as const;
  if (coverImage && !/^https?:\/\//i.test(coverImage))
    return { error: "Link ảnh bìa phải bắt đầu bằng http:// hoặc https://" } as const;

  return {
    data: {
      title,
      summary: summary || null,
      content,
      category: category || null,
      coverImage: coverImage || null,
      pinned,
      status: (publish ? "PUBLISHED" : "DRAFT") as "PUBLISHED" | "DRAFT",
    },
  } as const;
}

export async function createArticle(
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const me = await requireRole("ADMIN");
  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  await prisma.article.create({
    data: {
      ...parsed.data,
      authorId: me.id,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
    },
  });
  redirect(ADMIN_HOME);
}

export async function updateArticle(
  id: string,
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireRole("ADMIN");
  const current = await prisma.article.findUnique({
    where: { id },
    select: { publishedAt: true },
  });
  if (!current) redirect(ADMIN_HOME);
  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  await prisma.article.update({
    where: { id },
    data: {
      ...parsed.data,
      // Giữ ngày đăng lần đầu; nếu nay mới đăng lần đầu thì đặt ngày đăng.
      publishedAt:
        parsed.data.status === "PUBLISHED"
          ? current.publishedAt ?? new Date()
          : current.publishedAt,
    },
  });
  redirect(ADMIN_HOME);
}

export async function deleteArticle(id: string) {
  await requireRole("ADMIN");
  await prisma.article.delete({ where: { id } });
  redirect(ADMIN_HOME);
}

export async function togglePin(id: string) {
  await requireRole("ADMIN");
  const a = await prisma.article.findUnique({ where: { id }, select: { pinned: true } });
  if (!a) {
    refresh();
    return;
  }
  await prisma.article.update({ where: { id }, data: { pinned: !a.pinned } });
  refresh();
}

export async function togglePublish(id: string) {
  await requireRole("ADMIN");
  const a = await prisma.article.findUnique({
    where: { id },
    select: { status: true, publishedAt: true },
  });
  if (!a) {
    refresh();
    return;
  }
  const next = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.article.update({
    where: { id },
    data: {
      status: next,
      publishedAt: next === "PUBLISHED" ? a.publishedAt ?? new Date() : a.publishedAt,
    },
  });
  refresh();
}
