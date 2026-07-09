import type { Metadata } from "next";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Cadastro",
};

export default function RegisterPage() {
  return (
    <AuthLayout title="Crie sua conta" description="Comece pela base: conta, perfil e onboarding.">
      <AuthForm mode="register" />
    </AuthLayout>
  );
}
