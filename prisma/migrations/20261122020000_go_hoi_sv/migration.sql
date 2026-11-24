-- Gỡ vai trò Hội sinh viên (gộp chức năng vào Đoàn thanh niên) - 22/11/2026
-- Theo quyết định của thầy: ý kiến đã gửi Hội SV chuyển về Đoàn trường;
-- tài khoản Hội SV (chỉ có tài khoản thử) xoá luôn.

-- 1. Ý kiến sinh viên đã gửi tới "Hội sinh viên" -> chuyển cho Đoàn trường xử lý
UPDATE "Feedback" SET "recipient" = 'DOAN_TRUONG' WHERE "recipient" = 'HOI_SINH_VIEN';

-- 2. Lượt phản hồi do cán bộ Hội SV viết -> ghi nhận thuộc Đoàn trường (giữ lịch sử trao đổi)
UPDATE "FeedbackReply" SET "authorRole" = 'ADMIN' WHERE "authorRole" = 'HOI';

-- 3. Xoá tài khoản vai trò Hội SV (các phản hồi đã có được giữ, chỉ mất liên kết tên người gửi)
DELETE FROM "User" WHERE "role" = 'HOI';

-- 4. Bỏ giá trị 'HOI' khỏi enum Role (Postgres không xoá trực tiếp giá trị enum nên phải tạo lại type)
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LCD', 'STUDENT');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
ALTER TABLE "FeedbackReply" ALTER COLUMN "authorRole" TYPE "Role" USING ("authorRole"::text::"Role");
DROP TYPE "Role_old";

-- 5. Bỏ giá trị 'HOI_SINH_VIEN' khỏi enum FeedbackRecipient
ALTER TYPE "FeedbackRecipient" RENAME TO "FeedbackRecipient_old";
CREATE TYPE "FeedbackRecipient" AS ENUM ('DOAN_TRUONG', 'LIEN_CHI_DOAN');
ALTER TABLE "Feedback" ALTER COLUMN "recipient" DROP DEFAULT;
ALTER TABLE "Feedback" ALTER COLUMN "recipient" TYPE "FeedbackRecipient" USING ("recipient"::text::"FeedbackRecipient");
ALTER TABLE "Feedback" ALTER COLUMN "recipient" SET DEFAULT 'LIEN_CHI_DOAN';
DROP TYPE "FeedbackRecipient_old";
