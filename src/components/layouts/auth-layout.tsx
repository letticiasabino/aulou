import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_560px]">
      <section className="hidden border-r bg-sidebar px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div className="max-w-xl">
          <h1 className="text-5xl font-semibold leading-tight">
            Organize seu semestre antes que ele organize você.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Uma base limpa para importar cronogramas, revisar eventos e conectar a IA nas próximas
            sprints.
          </p>
        </div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Voltar para a landing
        </Link>
      </section>
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
