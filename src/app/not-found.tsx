import Link from "next/link";
import { ErrorLayout } from "@/components/layouts/error-layout";

export default function NotFound() {
  return (
    <ErrorLayout
      title="Página não encontrada"
      description="Essa rota ainda não existe ou foi movida."
      action={
        <Link href="/" className="text-sm font-medium text-primary hover:text-primary/80">
          Voltar para o início
        </Link>
      }
    />
  );
}
