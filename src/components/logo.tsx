import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 text-primary"
      >
        <path
          d="M14.0002 25.6667C14.0002 25.6667 4.66683 23.3334 4.66683 14.0001C4.66683 4.66675 14.0002 2.33341 14.0002 2.33341M14.0002 25.6667C14.0002 25.6667 23.3335 23.3334 23.3335 14.0001C23.3335 4.66675 14.0002 2.33341 14.0002 2.33341"
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
