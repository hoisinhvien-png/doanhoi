import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

/** Hiển thị nội dung bài (Markdown) — có hỗ trợ ảnh chèn trong thân bài. */
export function ArticleBody({ content }: { content: string }) {
  return (
    <div className="flex flex-col gap-4 text-[15px] leading-relaxed sm:text-base">
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          p: ({ children }) => <p className="text-foreground">{children}</p>,
          h2: ({ children }) => <h2 className="mt-2 text-xl font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-2 text-lg font-bold">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0072bc] underline dark:text-sky-300"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={typeof src === "string" ? src : ""}
              alt={alt ?? ""}
              className="w-full rounded-xl border"
              loading="lazy"
            />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#0072bc] pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
