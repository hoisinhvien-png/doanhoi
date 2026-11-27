import { requireRole } from "@/lib/dal";
import { createArticle } from "@/app/actions/articles";
import { ArticleForm } from "../article-form";

export default async function NewArticlePage() {
  await requireRole("ADMIN");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Thêm tin</h1>
        <p className="text-muted-foreground">Soạn một bài tin tức mới cho trang công khai.</p>
      </div>
      <ArticleForm action={createArticle} submitLabel="Lưu tin" />
    </div>
  );
}
