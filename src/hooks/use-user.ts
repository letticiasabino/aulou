"use client";

import { useAuth } from "@/hooks/use-auth";

export function useUser() {
  return useAuth().user;
}
