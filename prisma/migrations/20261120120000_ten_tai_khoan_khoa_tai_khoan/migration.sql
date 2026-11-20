-- Bổ sung 20/11/2026: tên tài khoản sinh viên và khoá tài khoản.
-- Chỉ THÊM cột, không sửa/xoá dữ liệu cũ; bản đang chạy vẫn hoạt động bình thường.
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
