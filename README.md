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
| `npx tsx --conditions=react-server prisma/backfill-username.ts --ghi` | Tạo tên tài khoản cho sinh viên cũ chưa có (bỏ `--ghi` để xem trước) |

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

- Lượt đăng ký chỉ có 2 trạng thái: **Tham gia** / **Không tham gia** (mặc định khi đăng ký).
  LCĐ xác nhận Tham gia cho sinh viên khoa mình từ lúc sự kiện diễn ra đến hết ngày thứ 7 sau đó;
  quá hạn thì khoá, chỉ Đoàn trường đổi được (bất cứ lúc nào). Trong CSDL: CONFIRMED = Tham gia,
  PENDING/REJECTED = Không tham gia.
- Năm học tính từ 01/08 đến 31/07 năm sau.
- Điểm xếp loại = số sự kiện Tham gia ÷ số sự kiện sinh viên được tham gia (toàn trường + khoa mình)
  trong khoảng thời gian × 10. Ngưỡng mặc định: Tốt ≥ 8, Khá ≥ 6.5, Trung bình ≥ 5, còn lại Yếu
  (Đoàn trường sửa được trên web).
- Sinh viên nhập từ Excel (nhận cả file xuất từ phần mềm đào tạo: MaSV, HoLotSV, TenSV, NgaySinhC, TenLop, TenKhoa)
  có tên tài khoản = TÊN + chữ đầu họ đệm + 4 số cuối mã SV + `_` + viết tắt khoa (VD `DIEUTH2025_NN`;
  NN Ngoại ngữ, KTCN, SP, KT, CTL, NNMT Nông nghiệp và Môi trường) và mật khẩu ban đầu là ngày sinh
  `ddMMyyyy`, bắt đổi ở lần đăng nhập đầu. Đăng nhập được bằng tên tài khoản hoặc mã SV.
- Tài khoản bị khoá không đăng nhập được; đang đăng nhập cũng bị đăng xuất ở lần tải trang tiếp theo.
- LCĐ chỉ xem, duyệt, xuất dữ liệu sinh viên thuộc khoa được gán.
