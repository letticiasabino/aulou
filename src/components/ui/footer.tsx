import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            StudyPilot AI organiza cronogramas, prazos e estudos para universitários que vivem com
            muita coisa acontecendo ao mesmo tempo.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground" aria-label="Rodapé">
          <Link href="/pricing" className="hover:text-foreground">
            Planos
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacidade
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Termos
          </Link>
        </nav>
      </div>
    </footer>
  );
}
