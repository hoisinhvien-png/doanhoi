import type { ReactNode } from "react";

/** Khung biểu đồ: tiêu đề, mô tả, biểu đồ, và "Xem dạng bảng" cho người cần số liệu chính xác */
export function ChartCard({
  title,
  description,
  children,
  table,
  empty,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  table?: { headers: string[]; rows: (string | number)[][] };
  empty?: string; // có giá trị = không có dữ liệu, hiện câu này thay biểu đồ
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-xl border bg-background p-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {empty ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <>
          {children}
          {table && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Xem dạng bảng
              </summary>
              <div className="mt-2 max-h-72 overflow-auto rounded-lg border">
                <table className="w-full">
                  <thead className="sticky top-0 bg-muted text-left">
                    <tr>
                      {table.headers.map((h) => (
                        <th key={h} className="px-3 py-1.5 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((r, i) => (
                      <tr key={i} className="border-t">
                        {r.map((c, j) => (
                          <td key={j} className={`px-3 py-1.5 ${typeof c === "number" ? "text-right tabular-nums" : ""}`}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </>
      )}
    </section>
  );
}
