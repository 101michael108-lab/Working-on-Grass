import React from "react";
import Link from "next/link";

/** Inline formatting: **bold** and [label](url) (internal links use next/link). */
function inline(text: string, kp: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  const pushText = (s: string, k: string) => {
    s.split(/(\*\*[^*]+\*\*)/g).forEach((p, j) => {
      if (!p) return;
      if (p.startsWith("**") && p.endsWith("**")) {
        out.push(<strong key={`${k}b${j}`} className="font-semibold text-ink">{p.slice(2, -2)}</strong>);
      } else {
        out.push(<React.Fragment key={`${k}t${j}`}>{p}</React.Fragment>);
      }
    });
  };

  while ((m = linkRe.exec(text))) {
    if (m.index > last) pushText(text.slice(last, m.index), `${kp}${i}pre`);
    const label = m[1];
    const url = m[2];
    const cls = "text-forest underline underline-offset-2 hover:opacity-80";
    if (url.startsWith("/")) {
      out.push(<Link key={`${kp}${i}l`} href={url} className={cls}>{label}</Link>);
    } else {
      out.push(<a key={`${kp}${i}l`} href={url} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>);
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) pushText(text.slice(last), `${kp}end`);
  return out;
}

export function FieldNoteBody({ body }: { body: string }) {
  const lines = (body || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let quote: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      const k = key++;
      blocks.push(<p key={k} className="mb-[18px] font-headline text-[17.5px] leading-[1.75] text-[#33382F]">{inline(para.join(" "), `p${k}`)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      const k = key++;
      blocks.push(
        <ul key={k} className="mb-[18px] flex flex-col gap-2.5">
          {list.map((li, idx) => (
            <li key={idx} className="flex gap-2.5 font-headline text-[17px] leading-[1.7] text-[#33382F]">
              <span className="mt-1 shrink-0 text-gold-deep">&#8226;</span>
              <span>{inline(li, `l${k}${idx}`)}</span>
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      const k = key++;
      blocks.push(<blockquote key={k} className="my-9 border-l-[3px] border-gold-deep pl-6 font-headline text-[clamp(20px,2.2vw,25px)] font-medium italic leading-[1.4] text-forest">{inline(quote.join(" "), `q${k}`)}</blockquote>);
      quote = [];
    }
  };
  const flushAll = () => { flushPara(); flushList(); flushQuote(); };

  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { flushAll(); continue; }
    if (t.startsWith("## ")) { flushAll(); const k = key++; blocks.push(<h2 key={k} className="mb-3.5 mt-8 font-headline text-[clamp(22px,2.4vw,27px)] font-semibold leading-[1.25] tracking-[-0.01em] text-ink">{inline(t.slice(3), `h${k}`)}</h2>); continue; }
    if (t.startsWith("### ")) { flushAll(); const k = key++; blocks.push(<h3 key={k} className="mb-2.5 mt-6 font-headline text-[19px] font-semibold text-ink">{inline(t.slice(4), `h3${k}`)}</h3>); continue; }
    if (t.startsWith("> ")) { flushPara(); flushList(); quote.push(t.slice(2)); continue; }
    if (t.startsWith("- ") || t.startsWith("* ")) { flushPara(); flushQuote(); list.push(t.slice(2)); continue; }
    flushList(); flushQuote(); para.push(t);
  }
  flushAll();
  return <div>{blocks}</div>;
}
