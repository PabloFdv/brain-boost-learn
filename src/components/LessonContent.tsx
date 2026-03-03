import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface LessonContentProps {
  content: string;
}

const LessonContent = ({ content }: LessonContentProps) => {
  // Robust math formatting cleanup
  const cleanContent = content
    // Convert LaTeX display math delimiters to $$ ... $$
    .replace(/\\\[/g, "\n$$\n")
    .replace(/\\\]/g, "\n$$\n")
    // Convert LaTeX inline math delimiters to $ ... $
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    // Fix doubled dollars that aren't display math (e.g. $$text$$ on same line without newlines)
    // Don't touch actual display math blocks
    // Remove stray # inside math contexts
    .replace(/\$([^$]*?)#([^$]*?)\$/g, "$$$1$2$$")
    // Remove stray single $ that aren't part of math (orphan dollars)
    .replace(/([^$\\])\$([^$\n])/g, (match, before, after) => {
      // If it looks like actual math content, keep it
      if (/[a-zA-Z0-9=+\-*/^{}()\\]/.test(after)) return match;
      return `${before}${after}`;
    })
    // Ensure display math blocks have newlines around them
    .replace(/([^\n])\$\$([^\n])/g, "$1\n$$\n$2")
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, "\n\n");

  return (
    <div className="lesson-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-8 mb-4 text-foreground font-display">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-6 mb-3 text-foreground font-display flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-5 mb-2 text-foreground font-display">
              {children}
            </h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent/50 bg-accent/5 rounded-r-xl p-4 my-4 not-italic">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div className="flex-1">{children}</div>
              </div>
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-primary">{children}</strong>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-border">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-primary/10 text-left p-3 text-sm font-semibold text-foreground border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-3 text-sm border-b border-border">{children}</td>
          ),
          hr: () => <hr className="my-6 border-border" />,
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} block bg-muted p-4 rounded-lg overflow-x-auto text-sm`} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

export default LessonContent;
