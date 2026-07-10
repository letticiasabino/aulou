"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authService, type AppUser } from "@/services/auth.service";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/features/auth/schemas/auth-schemas";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  signIn: (input: LoginInput) => Promise<AppUser>;
  signUp: (input: RegisterInput) => Promise<AppUser>;
  requestPasswordReset: (input: ForgotPasswordInput) => Promise<void>;
  updatePassword: (input: ResetPasswordInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (mounted) {
          setUser(currentUser);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const unsubscribe = authService.subscribeToAuthChanges((nextUser) => {
      if (mounted) {
        setUser(nextUser);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async signIn(input) {
        const nextUser = await authService.signIn(input);
        setUser(nextUser);
        return nextUser;
      },
      async signUp(input) {
        const nextUser = await authService.signUp(input);
        setUser(nextUser);
        return nextUser;
      },
      async requestPasswordReset(input) {
        await authService.requestPasswordReset(input);
      },
      async updatePassword(input) {
        await authService.updatePassword(input);
      },
      async signOut() {
        await authService.signOut();
        setUser(null);
        router.push("/login");
      },
    }),
    [loading, router, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider.");
  }

  return context;
}
