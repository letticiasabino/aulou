import type { Metadata } from "next";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Resetar senha",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Crie uma nova senha" description="Defina uma senha segura para continuar.">
      <AuthForm mode="reset" />
    </AuthLayout>
  );
}
