"use client";

import * as React from "react";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SupabaseProvider>
          <AuthProvider>
            <ModalProvider>
              {children}
              <ToastProvider />
            </ModalProvider>
          </AuthProvider>
        </SupabaseProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
