import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 text-primary"
      >
        <path d="M12 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 12C10.5 9.5 9 6 7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 12C13.5 9.5 15 6 17 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="text-xl font-semibold font-headline tracking-tight">
        Working on Grass
      </span>
    </Link>
  );
}
