import { AppShell } from "@/components/app-shell";

export const instant = false;

export default function StudentLayout({ children }: LayoutProps<"/sinh-vien">) {
  return <AppShell role="STUDENT">{children}</AppShell>;
}
