import type { Metadata } from "next";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <AuthLayout title="Entre na sua conta" description="Acesse sua área acadêmica organizada.">
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
