"use client";

import { ErrorLayout } from "@/components/layouts/error-layout";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorLayout
      title="Algo saiu do trilho."
      description={error.message || "Não conseguimos carregar esta área agora."}
      actionLabel="Tentar novamente"
      onAction={reset}
    />
  );
}
