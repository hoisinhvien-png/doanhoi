import { Construction } from "lucide-react";

/** Trang tạm cho chức năng chưa làm */
export function ComingSoon({ step }: { step: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-background p-10 text-center">
      <Construction className="size-10 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Chức năng đang xây dựng</h2>
      <p className="text-sm text-muted-foreground">Sẽ hoàn thành ở {step}.</p>
    </div>
  );
}
