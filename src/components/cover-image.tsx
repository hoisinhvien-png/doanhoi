"use client";

import { useState } from "react";

/**
 * Ảnh bìa có chống vỡ: nếu link ảnh tải lỗi (sai link, bị chặn, không phải ảnh)
 * thì tự rơi về `fallback` (nền gradient + icon chuyên mục) thay vì hiện icon ảnh vỡ.
 */
export function CoverImage({
  src,
  alt,
  category,
  fallback,
}: {
  src: string;
  alt: string;
  category?: string | null;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
      {category && (
        <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {category}
        </span>
      )}
    </>
  );
}
