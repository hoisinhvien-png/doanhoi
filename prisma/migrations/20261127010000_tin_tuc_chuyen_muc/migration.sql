-- Bổ sung 27/11/2026: thêm cột Chuyên mục cho Tin tức (quyết định màu nhãn). Chỉ THÊM cột, không đụng dữ liệu cũ.
ALTER TABLE "Article" ADD COLUMN "category" TEXT;
