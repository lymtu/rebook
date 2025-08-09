import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: React.ReactNode }) {
  if (typeof children !== "string") {
    return;
  }

  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold">{children}</h2>
        ),
        h3: ({ children }) => <h3 className="text-xl font-bold">{children}</h3>,
        h4: ({ children }) => <h4 className="text-lg font-bold">{children}</h4>,
        h5: ({ children }) => (
          <h5 className="text-base font-bold">{children}</h5>
        ),
        h6: ({ children }) => <h6 className="text-sm font-bold">{children}</h6>,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {children}
    </ReactMarkdown>
  );
}
