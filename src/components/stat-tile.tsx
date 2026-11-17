import Link from "next/link";
import type { ReactNode } from "react";

/** Ô số liệu: nhãn, con số, dòng phụ. Có href thì bấm được. */
export function StatTile({
  label,
  value,
  hint,
  href,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: ReactNode;
  href?: string;
  icon?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
  const cls = "rounded-xl border bg-background p-4";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:border-primary/40 hover:bg-primary/5`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
