import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { createEvent } from "@/app/actions/events";
import { EventForm } from "@/app/quan-tri/su-kien/event-form";

/** LCĐ tạo sự kiện cho khoa mình. Phạm vi luôn là khoa của LCĐ (máy chủ tự ép). */
export default async function NewLcdEventPage() {
  const me = await requireRole("LCD");
  if (!me.faculty) {
    return <p className="text-muted-foreground">Tài khoản chưa được gán khoa. Liên hệ Đoàn trường.</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/lien-chi/su-kien"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Các sự kiện
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Thêm sự kiện của khoa</h1>
        <p className="text-muted-foreground">
          Sự kiện này chỉ dành cho sinh viên khoa <b>{me.faculty}</b>; khoa khác không thấy. Đoàn trường vẫn
          theo dõi được.
        </p>
      </div>
      <EventForm
        action={createEvent}
        faculties={[]}
        hideFaculty
        cancelHref="/lien-chi/su-kien"
        submitLabel="Tạo sự kiện"
      />
    </div>
  );
}
