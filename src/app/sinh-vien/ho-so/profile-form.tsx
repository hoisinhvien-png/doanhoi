"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { FormError, FormField } from "@/components/form-field";

export function ProfileForm({
  initial,
}: {
  initial: { studentId: string; faculty: string; name: string; dob: string; className: string };
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="studentId" label="Mã sinh viên" defaultValue={initial.studentId} disabled hint="Do Đoàn trường quản lý" />
        <FormField id="faculty" label="Khoa" defaultValue={initial.faculty} disabled hint="Do Đoàn trường quản lý" />
      </div>
      <FormField id="name" label="Họ và tên *" defaultValue={initial.name} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="dob" label="Ngày sinh *" type="date" defaultValue={initial.dob} required />
        <FormField id="className" label="Lớp sinh hoạt" defaultValue={initial.className} />
      </div>
      <FormError message={state?.error} />
      {state?.ok && <p className="text-sm text-emerald-700">Đã lưu hồ sơ.</p>}
      <div>
        <Button type="submit" className="h-10 px-5" disabled={pending}>
          {pending ? "Đang lưu…" : "Lưu hồ sơ"}
        </Button>
      </div>
    </form>
  );
}
