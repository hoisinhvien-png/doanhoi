// Tổng hợp thống kê ý kiến cho Đoàn trường (cuối kỳ/cuối năm).
import "server-only";
import { prisma } from "./prisma";
import { CATEGORY_ORDER, RECIPIENT_ORDER, type FeedbackCategory, type FeedbackRecipient } from "./feedback";

export type CatRow = { category: FeedbackCategory; total: number; responded: number };
export type FacultyRow = {
  faculty: string;
  total: number;
  responded: number;
  byCat: Record<FeedbackCategory, number>;
};
export type RecipientRow = { recipient: FeedbackRecipient; total: number; responded: number };

export type FeedbackStats = {
  total: number;
  responded: number; // có ít nhất 1 lượt trả lời của cán bộ
  open: number; // chờ xử lý (Mới + Đang xử lý)
  closed: number; // đã đóng
  like: number; // SV đánh giá Hài lòng
  unlike: number; // SV đánh giá Chưa hài lòng
  unrated: number; // đã phản hồi nhưng SV chưa đánh giá
  byCategory: CatRow[];
  byFaculty: FacultyRow[];
  byRecipient: RecipientRow[];
};

function emptyCat(): Record<FeedbackCategory, number> {
  return { SUGGESTION: 0, COMPLAINT: 0, QUESTION: 0, OTHER: 0 };
}

export async function feedbackStats(from: Date, to: Date): Promise<FeedbackStats> {
  const rows = await prisma.feedback.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: {
      category: true,
      faculty: true,
      recipient: true,
      status: true,
      satisfaction: true,
      // chỉ cần biết có trả lời của cán bộ hay chưa
      replies: { where: { authorRole: { in: ["ADMIN", "LCD"] } }, take: 1, select: { id: true } },
    },
  });

  const byCategory: CatRow[] = CATEGORY_ORDER.map((c) => ({ category: c, total: 0, responded: 0 }));
  const catIndex = new Map(byCategory.map((r, i) => [r.category, i]));
  const byRecipient: RecipientRow[] = RECIPIENT_ORDER.map((r) => ({ recipient: r, total: 0, responded: 0 }));
  const recIndex = new Map(byRecipient.map((r, i) => [r.recipient, i]));
  const facultyMap = new Map<string, FacultyRow>();

  let responded = 0;
  let open = 0;
  let closed = 0;
  let like = 0;
  let unlike = 0;
  let unrated = 0;

  for (const r of rows) {
    const hasReply = r.replies.length > 0;
    if (hasReply) responded++;
    if (r.status === "CLOSED") closed++;
    else if (r.status === "NEW" || r.status === "IN_PROGRESS") open++;

    if (r.satisfaction === "LIKE") like++;
    else if (r.satisfaction === "UNLIKE") unlike++;
    else if (hasReply) unrated++;

    const ci = catIndex.get(r.category)!;
    byCategory[ci].total++;
    if (hasReply) byCategory[ci].responded++;

    const ri = recIndex.get(r.recipient)!;
    byRecipient[ri].total++;
    if (hasReply) byRecipient[ri].responded++;

    const key = r.faculty ?? "(chưa rõ khoa)";
    let f = facultyMap.get(key);
    if (!f) {
      f = { faculty: key, total: 0, responded: 0, byCat: emptyCat() };
      facultyMap.set(key, f);
    }
    f.total++;
    if (hasReply) f.responded++;
    f.byCat[r.category]++;
  }

  const byFaculty = [...facultyMap.values()].sort((a, b) => b.total - a.total || a.faculty.localeCompare(b.faculty, "vi"));

  return { total: rows.length, responded, open, closed, like, unlike, unrated, byCategory, byFaculty, byRecipient };
}
