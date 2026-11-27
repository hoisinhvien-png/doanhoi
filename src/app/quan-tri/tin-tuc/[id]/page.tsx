import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { deleteArticle, updateArticle } from "@/app/actions/articles";
import { ArticleForm } from "../article-form";
import { ConfirmButton } from "@/components/confirm-button";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const a = await prisma.article.findUnique({ where: { id } });
  if (!a) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Sửa tin</h1>
          <p className="text-muted-foreground">Cập nhật nội dung bài tin.</p>
        </div>
        <ConfirmButton
          action={deleteArticle.bind(null, a.id)}
          message={`Xoá tin “${a.title}”? Thao tác này không khôi phục được.`}
          variant="destructive"
          size="sm"
        >
          Xoá tin
        </ConfirmButton>
      </div>
      <ArticleForm
        action={updateArticle.bind(null, a.id)}
        submitLabel="Lưu thay đổi"
        initial={{
          title: a.title,
          summary: a.summary ?? "",
          content: a.content,
          coverImage: a.coverImage ?? "",
          pinned: a.pinned,
          status: a.status,
        }}
      />
    </div>
  );
}
