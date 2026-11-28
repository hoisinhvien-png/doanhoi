"use client";

import { useState } from "react";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { PublicShell } from "@/components/public-shell";

// ===== THÔNG TIN LIÊN HỆ =====
// Thầy điền các giá trị thật vào đây (em không tự bịa).
// - address: địa chỉ đầy đủ hiện dưới trang
// - phone: số điện thoại liên hệ
// - zalo: số Zalo (hoặc để link https://zalo.me/... nếu có)
// - buildingImage: link ảnh trụ sở chính (để trống thì hiện ô chờ ảnh)
// - mapQuery: cụm từ/địa chỉ để nhúng Google Map
const CONTACT = {
  address: "VP Đoàn – Hội: tầng 1, nhà Hiệu bộ, Trường Đại học Hà Tĩnh, Xã Cẩm Vịnh, Hà Tĩnh",
  phone: "0946 582 194",
  zalo: "0946 582 194", // bấm vào mở https://zalo.me/0946582194
  buildingImage: "/tru-so-htu.jpg", // ảnh trụ sở lưu trong public/ app; để trống thì hiện ô chờ ảnh
  mapQuery: "18.304326,105.937558", // toạ độ vị trí thầy chọn (có ghim trên bản đồ)
};

const PLACEHOLDER = "(đang cập nhật)";
const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapQuery)}&z=16&hl=vi&output=embed`;

function zaloHref(z: string) {
  if (!z) return undefined;
  if (z.startsWith("http")) return z;
  return `https://zalo.me/${z.replace(/[^0-9]/g, "")}`;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  noBottom,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
  noBottom?: boolean;
}) {
  const content = value || PLACEHOLDER;
  const muted = !value;
  return (
    <div className={`flex items-center gap-3.5 p-3 ${noBottom ? "" : "border-b"}`}>
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-[#0072bc] dark:bg-sky-900/30 dark:text-sky-300">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {href && value ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="font-semibold text-[#0072bc] hover:underline dark:text-sky-300"
          >
            {content}
          </a>
        ) : (
          <p className={`font-semibold ${muted ? "italic text-muted-foreground" : ""}`}>{content}</p>
        )}
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [imgError, setImgError] = useState(false);
  return (
    <PublicShell>
      {/* Tiêu đề gọn */}
      <div className="flex flex-col gap-1">
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#0072bc] dark:text-sky-300">
          Bản tin Đoàn – Hội
        </div>
        <h1 className="text-2xl font-extrabold text-[#00487a] sm:text-3xl dark:text-sky-100">
          Liên hệ
        </h1>
        <p className="text-sm text-muted-foreground sm:text-[15px]">
          Đoàn Thanh niên – Hội Sinh viên Trường Đại học Hà Tĩnh.
        </p>
      </div>

      {/* Bố cục 2 cột lấp đầy một màn hình: ảnh trụ sở (trái) · bản đồ + thông tin (phải) */}
      <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1 lg:flex-row">
        {/* Ảnh trụ sở - cột lớn bên trái */}
        <div className="relative min-h-56 overflow-hidden rounded-2xl border bg-card shadow-sm lg:w-3/5">
          {CONTACT.buildingImage && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={CONTACT.buildingImage}
              alt="Trụ sở chính Trường Đại học Hà Tĩnh"
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#0072bc] to-[#00487a] text-center text-white">
              <div className="flex flex-col items-center gap-1 px-4">
                <MapPin className="size-9 opacity-60" />
                <p className="text-sm font-semibold">Ảnh trụ sở chính</p>
                <p className="text-xs text-white/80">(thầy gửi ảnh để chèn vào đây)</p>
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: bản đồ (trên) + thông tin liên hệ (dưới) */}
        <div className="flex flex-col gap-4 lg:w-2/5">
          {/* Bản đồ Google Map */}
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm lg:min-h-0 lg:flex-1">
            <iframe
              title="Bản đồ Trường Đại học Hà Tĩnh"
              src={mapSrc}
              className="h-64 w-full border-0 lg:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          {/* Thông tin liên hệ: Địa chỉ (hàng trên) · Điện thoại + Zalo (cùng 1 hàng) */}
          <div className="shrink-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <InfoRow icon={MapPin} label="Địa chỉ" value={CONTACT.address} />
            <div className="grid grid-cols-2 divide-x">
              <InfoRow
                icon={Phone}
                label="Số điện thoại"
                value={CONTACT.phone}
                href={CONTACT.phone ? `tel:${CONTACT.phone.replace(/\s/g, "")}` : undefined}
                noBottom
              />
              <InfoRow
                icon={MessageCircle}
                label="Zalo"
                value={CONTACT.zalo}
                href={zaloHref(CONTACT.zalo)}
                noBottom
              />
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
