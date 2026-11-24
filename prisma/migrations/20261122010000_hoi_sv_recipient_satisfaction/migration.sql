-- Bổ sung 22/11/2026: vai trò Hội sinh viên; nơi SV gửi ý kiến; đánh giá hài lòng sau phản hồi.
-- Chỉ THÊM giá trị enum và cột mới, KHÔNG đụng dữ liệu cũ.

-- AlterEnum: thêm vai trò Hội sinh viên
ALTER TYPE "Role" ADD VALUE 'HOI';

-- CreateEnum
CREATE TYPE "FeedbackRecipient" AS ENUM ('DOAN_TRUONG', 'LIEN_CHI_DOAN', 'HOI_SINH_VIEN');

-- CreateEnum
CREATE TYPE "FeedbackSatisfaction" AS ENUM ('LIKE', 'UNLIKE');

-- AlterTable: ý kiến cũ mặc định gửi Liên chi Đoàn (đúng với luồng trước đây)
ALTER TABLE "Feedback" ADD COLUMN "recipient" "FeedbackRecipient" NOT NULL DEFAULT 'LIEN_CHI_DOAN';
ALTER TABLE "Feedback" ADD COLUMN "satisfaction" "FeedbackSatisfaction";
