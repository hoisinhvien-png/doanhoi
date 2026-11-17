import Image from "next/image";
import { CalendarCheck, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Ba vai trò của hệ thống (theo tài liệu đặc tả)
const roles = [
  {
    icon: ShieldCheck,
    title: "Đoàn trường",
    desc: "Thống kê toàn trường, quản lý sự kiện, đánh giá xếp loại đoàn viên, xuất báo cáo Excel.",
  },
  {
    icon: Users,
    title: "Liên chi Đoàn khoa",
    desc: "Theo dõi sinh viên trong khoa, duyệt lượt đăng ký sự kiện, xuất danh sách theo lớp.",
  },
  {
    icon: CalendarCheck,
    title: "Sinh viên",
    desc: "Cập nhật hồ sơ, đăng ký sự kiện đang mở, xem lịch sử và trạng thái duyệt.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      {/* Thanh đầu trang: nền xanh để logo chữ trắng của trường hiển thị rõ */}
      <header className="bg-[#0b4f9c] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Image
            src="/logo-htu.png"
            alt="Logo Trường Đại học Hà Tĩnh"
            width={495}
            height={90}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-12">
        <section className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Hệ thống theo dõi hoạt động Đoàn – Hội
          </h1>
          <p className="max-w-2xl text-muted-foreground sm:text-lg">
            Đăng ký sự kiện, duyệt tham gia và đánh giá đoàn viên trên một nền
            tảng duy nhất.
          </p>
          <Link
            href="/dang-nhap"
            className={buttonVariants({
              size: "lg",
              className: "mt-2 h-11 px-6 text-base",
            })}
          >
            Đăng nhập
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {roles.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="mb-2 size-8 text-[#0b4f9c] dark:text-sky-400" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Đoàn Thanh niên – Hội Sinh viên Trường Đại học Hà Tĩnh
      </footer>
    </div>
  );
}
