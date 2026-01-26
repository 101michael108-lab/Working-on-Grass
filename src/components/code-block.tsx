"use client";

// Note: This is a very simple component without syntax highlighting
// for brevity. For a real app, you'd use a library like 'react-syntax-highlighter'.

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm text-muted-foreground relative">
      <div className="absolute top-2 right-2 text-xs text-foreground/50">
        {language}
      </div>
      <code>{code}</code>
    </pre>
  );
}
