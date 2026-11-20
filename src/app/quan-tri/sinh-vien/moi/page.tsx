import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { getFaculties } from "@/lib/queries";
import { createStudent } from "@/app/actions/students";
import { StudentForm } from "../student-form";

export default async function NewStudentPage() {
  await requireRole("ADMIN");
  const faculties = await getFaculties();
  return (
    <div className="flex flex-col gap-5">
      <Link href="/quan-tri/sinh-vien" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Danh sách sinh viên
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Đăng ký tài khoản sinh viên</h1>
        <p className="text-muted-foreground">Dùng khi cần thêm từng sinh viên; thêm nhiều thì nhập từ file Excel.</p>
      </div>
      <StudentForm action={createStudent} faculties={faculties} submitLabel="Tạo tài khoản" />
    </div>
  );
}
