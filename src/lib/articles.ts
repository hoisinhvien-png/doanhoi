// Lớp dữ liệu cho Tin tức công khai (Bổ sung 27/11/2026).
// Trang công khai chỉ đọc bài đã đăng (PUBLISHED). Trang quản trị dùng truy vấn riêng.
import "server-only";
import { prisma } from "./prisma";
import { startOfTodayVN } from "./format";

/** Các cột đủ để vẽ thẻ tin (không lấy content cho nhẹ) */
const cardSelect = {
  id: true,
  title: true,
  summary: true,
  category: true,
  coverImage: true,
  pinned: true,
  publishedAt: true,
  createdAt: true,
} as const;

export type ArticleCard = {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  coverImage: string | null;
  pinned: boolean;
  publishedAt: Date | null;
  createdAt: Date;
};

/** Ngày hiển thị của bài: ưu tiên ngày đăng, chưa có thì ngày tạo */
export function articleDate(a: { publishedAt: Date | null; createdAt: Date }) {
  return a.publishedAt ?? a.createdAt;
}

/** Trang chủ: 1 tin nổi bật (ghim trước, rồi mới nhất) + tối đa 6 tin còn lại */
export async function getHomeArticles() {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: 7,
    select: cardSelect,
  });
  const [featured, ...rest] = rows;
  return { featured: featured ?? null, rest };
}

const PAGE_SIZE = 9;

/** Trang /tin-tuc: danh sách bài đã đăng, phân trang */
export async function getPublishedPage(page: number) {
  const current = Math.max(1, page);
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (current - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: cardSelect,
    }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { items, total, page: current, pageSize: PAGE_SIZE, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Một bài đã đăng (cho trang công khai). Trả null nếu không có hoặc còn là nháp. */
export async function getPublicArticle(id: string) {
  const a = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });
  if (!a || a.status !== "PUBLISHED") return null;
  return a;
}

/** Vài sự kiện TOÀN TRƯỜNG sắp diễn ra, hiện công khai ở trang chủ */
export async function getUpcomingPublicEvents(limit = 4) {
  const today = startOfTodayVN(new Date());
  return prisma.event.findMany({
    where: { faculty: null, date: { gte: today } },
    orderBy: { date: "asc" },
    take: limit,
    select: { id: true, title: true, date: true, location: true },
  });
}
