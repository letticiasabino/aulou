"use client";

import * as React from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type SupabaseContextValue = {
  client: SupabaseClient | null;
  configured: boolean;
};

const SupabaseContext = React.createContext<SupabaseContextValue>({
  client: null,
  configured: false,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [value] = React.useState<SupabaseContextValue>(() => {
    if (!isSupabaseConfigured()) {
      return { client: null, configured: false };
    }

    return { client: createClient(), configured: true };
  });

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  return React.useContext(SupabaseContext);
}
