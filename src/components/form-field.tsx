import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Một ô nhập có nhãn, cỡ lớn cho dễ bấm trên điện thoại */
export function FormField({
  id,
  label,
  hint,
  ...props
}: React.ComponentProps<"input"> & { id: string; label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} className="h-10" {...props} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  );
}
