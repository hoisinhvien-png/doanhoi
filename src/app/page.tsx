import Link from "next/link";
import { ArrowRight, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { BrandFooter, BrandHeader } from "@/components/brand-header";

// Ba thẻ đăng nhập theo vai trò (Bổ sung 20/11/2026)
const roles = [
  {
    key: "quan-ly",
    icon: ShieldCheck,
    title: "Quản lý",
    desc: "Đoàn trường: quản lý sự kiện, sinh viên, đánh giá xếp loại và báo cáo toàn trường.",
    accent: "from-[#0072bc] to-[#0094d9]",
  },
  {
    key: "lien-chi",
    icon: Users,
    title: "Liên chi Đoàn",
    desc: "Theo dõi sự kiện, xác nhận sinh viên tham gia và xuất danh sách của khoa.",
    accent: "from-[#0094d9] to-[#00b3c7]",
  },
  {
    key: "sinh-vien",
    icon: GraduationCap,
    title: "Sinh viên",
    desc: "Xem sự kiện trong năm học, đăng ký tham gia và theo dõi xếp loại đoàn viên.",
    accent: "from-[#00a8b5] to-[#22c08a]",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-950 dark:via-background dark:to-background">
      <BrandHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:py-16">
        <section className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-[#0072bc]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0072bc] dark:bg-sky-400/10 dark:text-sky-300">
            Trường Đại học Hà Tĩnh
          </span>
          <h1 className="max-w-4xl text-2xl font-extrabold leading-snug tracking-tight text-[#00487a] sm:text-4xl dark:text-sky-100">
            HỆ THỐNG QUẢN LÝ VÀ THEO DÕI CÁC HOẠT ĐỘNG CỦA ĐOÀN TN – HỘI SV
          </h1>
          <p className="max-w-2xl text-muted-foreground sm:text-lg">Chọn vai trò của bạn để đăng nhập.</p>
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
          {roles.map(({ key, icon: Icon, title, desc, accent }) => (
            <Link
              key={key}
              href={`/dang-nhap?vai-tro=${key}`}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0072bc]"
            >
              <div className={`flex items-center gap-3 bg-gradient-to-r ${accent} px-5 py-5 text-white`}>
                <span className="grid size-12 place-items-center rounded-xl bg-white/20">
                  <Icon className="size-7" />
                </span>
                <span className="text-xl font-bold">{title}</span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="text-sm text-muted-foreground">{desc}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#0072bc] dark:text-sky-300">
                  Đăng nhập <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </section>
      </main>

      <BrandFooter />
    </div>
  );
}
