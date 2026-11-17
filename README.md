# Hệ thống theo dõi hoạt động Đoàn – Hội · Trường Đại học Hà Tĩnh

Web app quản lý sự kiện, đăng ký tham gia, duyệt và đánh giá xếp loại đoàn viên.
Ba vai trò: **Đoàn trường** (quản trị), **Liên chi Đoàn khoa**, **Sinh viên**.

## Công nghệ

Next.js 16 (App Router, TypeScript) · PostgreSQL trên Aiven · Prisma 7 · Tailwind CSS + shadcn/ui ·
Recharts · ExcelJS · đăng nhập bằng cookie ký `jose` + mật khẩu băm `bcrypt` · triển khai trên Vercel.

## Chạy trên máy

```bash
npm install            # cài thư viện, tự sinh Prisma Client
cp .env.example .env   # rồi điền giá trị thật
npm run dev            # mở http://localhost:3000
```

## Lệnh hay dùng

| Lệnh | Việc |
|---|---|
| `npx prisma migrate dev --name <ten>` | Đổi cấu trúc CSDL sau khi sửa `prisma/schema.prisma` |
| `npx prisma db seed` | Tạo tài khoản Đoàn trường đầu tiên và ngưỡng xếp loại |
| `npm run studio` | Xem dữ liệu ở http://localhost:5555 (nhớ tắt khi xong: chiếm kết nối CSDL) |
| `npm run seed:demo` | Tạo tài khoản THỬ (`@demo.local`, `DEMO001`, `DEMO002`) |
| `npm run cleanup:demo` | Xoá toàn bộ dữ liệu thử |
| `npm run build` | Kiểm tra bản build như trên Vercel |

## Cấu trúc chính

```
prisma/schema.prisma      sơ đồ CSDL (User, Event, EventParticipation, GradingRule)
src/proxy.ts              chặn trang theo vai trò
src/lib/                  phiên đăng nhập, kiểm tra quyền, xếp loại, đọc/ghi Excel, số liệu
src/app/quan-tri/         trang Đoàn trường
src/app/lien-chi/         trang Liên chi Đoàn
src/app/sinh-vien/        trang Sinh viên
src/app/api/excel/        tải file Excel
```

## Quy tắc nghiệp vụ

- Điểm xếp loại = số sự kiện được duyệt ÷ số sự kiện sinh viên được tham gia (toàn trường + khoa mình)
  trong khoảng thời gian × 10. Ngưỡng mặc định: Tốt ≥ 8, Khá ≥ 6.5, Trung bình ≥ 5, còn lại Yếu
  (Đoàn trường sửa được trên web).
- Sinh viên nhập từ Excel có mật khẩu ban đầu là ngày sinh `ddMMyyyy`, bắt đổi ở lần đăng nhập đầu.
- LCĐ chỉ xem, duyệt, xuất dữ liệu sinh viên thuộc khoa được gán.
