import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 text-primary"
      >
        <path
          d="M8 24C8 24 9 18 14 14C19 10 20 4 20 4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 24C14 24 13 19 9.5 16C6 13 4 8 4 8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl font-semibold font-headline tracking-tight">
        Working on Grass
      </span>
    </Link>
  );
}
