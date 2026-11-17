import { requireRole } from "@/lib/dal";
import { readReportParams } from "@/lib/report";
import { ReportPage } from "@/components/report-page";

export default async function AdminReportPage({ searchParams }: PageProps<"/quan-tri/bao-cao">) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const params = readReportParams((k) => (typeof sp[k] === "string" ? (sp[k] as string) : ""));
  return <ReportPage basePath="/quan-tri/bao-cao" params={params} />;
}
