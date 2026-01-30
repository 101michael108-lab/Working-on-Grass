import Link from "next/link";
import { Leaf } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <Leaf className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold font-headline text-foreground">
        Working on Grass
      </span>
    </Link>
  );
}
