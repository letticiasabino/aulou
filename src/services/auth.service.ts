import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/config/env";
import { createClient } from "@/lib/supabase/client";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/features/auth/schemas/auth-schemas";

export type AppUser = {
  id: string;
  email: string;
  name?: string;
  mode: "supabase" | "demo";
};

const demoStorageKey = "studypilot.demo.user";

function mapSupabaseUser(user: User): AppUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name:
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : user.email?.split("@")[0],
    mode: "supabase",
  };
}

function readDemoUser(): AppUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(demoStorageKey);
  return value ? (JSON.parse(value) as AppUser) : null;
}

function writeDemoUser(user: AppUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(demoStorageKey);
    return;
  }

  window.localStorage.setItem(demoStorageKey, JSON.stringify(user));
}

export const authService = {
  async getCurrentUser(): Promise<AppUser | null> {
    if (!isSupabaseConfigured()) {
      return readDemoUser();
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return mapSupabaseUser(data.user);
  },

  async signIn(input: LoginInput): Promise<AppUser> {
    if (!isSupabaseConfigured()) {
      const user = {
        id: "demo-user",
        email: input.email,
        name: input.email.split("@")[0],
        mode: "demo" as const,
      };
      writeDemoUser(user);
      return user;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(input);

    if (error || !data.user) {
      throw new Error(error?.message ?? "Não foi possível entrar.");
    }

    return mapSupabaseUser(data.user);
  },

  async signUp(input: RegisterInput): Promise<AppUser> {
    if (!isSupabaseConfigured()) {
      const user = {
        id: "demo-user",
        email: input.email,
        name: input.name,
        mode: "demo" as const,
      };
      writeDemoUser(user);
      return user;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          name: input.name,
        },
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Não foi possível criar sua conta.");
    }

    return mapSupabaseUser(data.user);
  },

  async requestPasswordReset(input: ForgotPasswordInput) {
    if (!isSupabaseConfigured()) {
      return { demo: true };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { demo: false };
  },

  async updatePassword(input: ResetPasswordInput) {
    if (!isSupabaseConfigured()) {
      return { demo: true };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: input.password });

    if (error) {
      throw new Error(error.message);
    }

    return { demo: false };
  },

  async signOut() {
    if (!isSupabaseConfigured()) {
      writeDemoUser(null);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },
};
