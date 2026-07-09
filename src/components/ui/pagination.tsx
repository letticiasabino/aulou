import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  previousHref,
  nextHref,
}: {
  previousHref?: string;
  nextHref?: string;
}) {
  return (
    <nav className="flex items-center justify-between" aria-label="Paginação">
      <Button variant="outline" asChild disabled={!previousHref}>
        <Link href={previousHref ?? "#"}>
          <ChevronLeft data-icon="inline-start" />
          Anterior
        </Link>
      </Button>
      <Button variant="outline" asChild disabled={!nextHref}>
        <Link href={nextHref ?? "#"}>
          Próxima
          <ChevronRight data-icon="inline-end" />
        </Link>
      </Button>
    </nav>
  );
}
