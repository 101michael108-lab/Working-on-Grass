import Link from "next/link";
import { Leaf } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <Leaf className="h-6 w-6 text-primary" />
      <span className="text-xl font-semibold font-headline tracking-tight">Working on Grass</span>
    </Link>
  );
}
