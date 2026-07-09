"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/features/auth/schemas/auth-schemas";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured } from "@/config/env";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "register" | "forgot" | "reset";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const next = searchParams.get("next") ?? "/dashboard";

  if (mode === "register") {
    return <RegisterForm onSuccess={() => router.push("/onboarding")} />;
  }

  if (mode === "forgot") {
    return <ForgotPasswordForm />;
  }

  if (mode === "reset") {
    return <ResetPasswordForm onSuccess={() => router.push("/login")} />;
  }

  return (
    <LoginForm onSuccess={() => router.push(next)} onSubmit={(values) => auth.signIn(values)} />
  );
}

function LoginForm({
  onSubmit,
  onSuccess,
}: {
  onSubmit: (values: LoginInput) => Promise<unknown>;
  onSuccess: () => void;
}) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function submit(values: LoginInput) {
    try {
      await onSubmit(values);
      toast.success("Entrada concluída.");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível entrar.");
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
      <ConfigNotice />
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.email)}>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <FieldError>{form.formState.errors.email.message}</FieldError>
          ) : null}
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.password)}>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <FieldError>{form.formState.errors.password.message}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : null}
        Entrar
        <ArrowRight data-icon="inline-end" />
      </Button>
      <div className="flex justify-between text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-foreground">
          Esqueci minha senha
        </Link>
        <Link href="/register" className="hover:text-foreground">
          Criar conta
        </Link>
      </div>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const auth = useAuth();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function submit(values: RegisterInput) {
    try {
      await auth.signUp(values);
      toast.success("Conta criada.");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a conta.");
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
      <ConfigNotice />
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.name)}>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
          {form.formState.errors.name ? (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          ) : null}
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.email)}>
          <Label htmlFor="register-email">E-mail</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <FieldError>{form.formState.errors.email.message}</FieldError>
          ) : null}
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.password)}>
          <Label htmlFor="register-password">Senha</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <FieldError>{form.formState.errors.password.message}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>
      <Button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : null}
        Criar conta
        <ArrowRight data-icon="inline-end" />
      </Button>
      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
        Já tenho conta
      </Link>
    </form>
  );
}

function ForgotPasswordForm() {
  const auth = useAuth();
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function submit(values: ForgotPasswordInput) {
    try {
      await auth.requestPasswordReset(values);
      toast.success("Se houver uma conta, enviaremos as instruções.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível enviar as instruções.",
      );
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
      <ConfigNotice />
      <Field data-invalid={Boolean(form.formState.errors.email)}>
        <Label htmlFor="forgot-email">E-mail</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <FieldError>{form.formState.errors.email.message}</FieldError>
        ) : null}
      </Field>
      <Button disabled={form.formState.isSubmitting}>Enviar instruções</Button>
      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
        Voltar para login
      </Link>
    </form>
  );
}

function ResetPasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const auth = useAuth();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  async function submit(values: ResetPasswordInput) {
    try {
      await auth.updatePassword(values);
      toast.success("Senha atualizada.");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a senha.");
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(submit)}>
      <ConfigNotice />
      <Field data-invalid={Boolean(form.formState.errors.password)}>
        <Label htmlFor="reset-password">Nova senha</Label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <FieldError>{form.formState.errors.password.message}</FieldError>
        ) : null}
      </Field>
      <Button disabled={form.formState.isSubmitting}>Atualizar senha</Button>
    </form>
  );
}

function ConfigNotice() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <FieldDescription>
      Supabase ainda não está conectado. Esta tela usa sessão local de desenvolvimento.
    </FieldDescription>
  );
}
