import type { Metadata } from "next";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Recuperar senha" description="Receba instruções para voltar à sua conta.">
      <AuthForm mode="forgot" />
    </AuthLayout>
  );
}
