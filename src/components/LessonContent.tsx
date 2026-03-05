import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface LessonContentProps {
  content: string;
}

function cleanMathContent(raw: string): string {
  let text = raw;

  // Convert \[ ... \] to $$ ... $$
  text = text.replace(/\\\[/g, "\n$$\n").replace(/\\\]/g, "\n$$\n");
  // Convert \( ... \) to $ ... $
  text = text.replace(/\\\(/g, "$").replace(/\\\)/g, "$");

  // Fix unclosed single $ by finding orphan $ and removing them
  // Strategy: match pairs of $...$ and $$...$$, remove unpaired ones
  const lines = text.split("\n");
  const fixedLines = lines.map((line) => {
    // Skip display math lines
    if (line.trim() === "$$") return line;

    // Count $ signs that aren't $$ 
    let result = "";
    let i = 0;
    while (i < line.length) {
      if (line[i] === "$" && line[i + 1] === "$") {
        // Display math delimiter on this line - keep as is
        result += "$$";
        i += 2;
        continue;
      }
      if (line[i] === "$") {
        // Find closing $
        const closeIdx = line.indexOf("$", i + 1);
        if (closeIdx !== -1 && closeIdx - i > 1) {
          // Valid math span
          const mathContent = line.substring(i + 1, closeIdx);
          // Check it looks like math (has LaTeX commands or math operators)
          if (/[\\^_{}+\-*/=<>]|\\[a-z]|[0-9]/.test(mathContent)) {
            result += "$" + mathContent + "$";
            i = closeIdx + 1;
            continue;
          }
        }
        // Orphan $ or doesn't look like math - remove it
        i++;
        continue;
      }
      result += line[i];
      i++;
    }
    return result;
  });

  text = fixedLines.join("\n");

  // Remove # inside math contexts
  text = text.replace(/\$([^$]*?)#([^$]*?)\$/g, "$$$1$2$$");

  // Ensure display math blocks have newlines
  text = text.replace(/([^\n])\$\$([^\n])/g, "$1\n$$\n$2");

  // Clean up excessive newlines
  text = text.replace(/\n{3,}/g, "\n\n");

  return text;
}

const LessonContent = ({ content }: LessonContentProps) => {
  const cleanContent = cleanMathContent(content);

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
