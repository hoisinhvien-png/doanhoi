import { requireRole } from "@/lib/dal";
import { readReportParams } from "@/lib/report";
import { ReportPage } from "@/components/report-page";

export default async function LcdReportPage({ searchParams }: PageProps<"/lien-chi/bao-cao">) {
  const me = await requireRole("LCD");
  if (!me.faculty) {
    return <p className="text-muted-foreground">Tài khoản chưa được gán khoa. Liên hệ Đoàn trường.</p>;
  }
  const sp = await searchParams;
  const params = readReportParams((k) => (typeof sp[k] === "string" ? (sp[k] as string) : ""));
  return <ReportPage basePath="/lien-chi/bao-cao" params={params} forcedFaculty={me.faculty} />;
}
