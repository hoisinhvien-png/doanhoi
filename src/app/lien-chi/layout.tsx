import { AppShell } from "@/components/app-shell";

export const instant = false;

export default function LcdLayout({ children }: LayoutProps<"/lien-chi">) {
  return <AppShell role="LCD">{children}</AppShell>;
}
