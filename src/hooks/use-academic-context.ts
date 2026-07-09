"use client";

import * as React from "react";
import { academicService } from "@/services/academic.service";
import { useUser } from "@/hooks/use-user";
import type { AcademicContext } from "@/types/academic-domain";

export function useAcademicContext() {
  const user = useUser();
  const [context, setContext] = React.useState<AcademicContext | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    void Promise.resolve().then(async () => {
      if (!mounted) {
        return;
      }

      if (!user) {
        setContext(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const nextContext = await academicService.getContext(user.id);
        if (mounted) {
          setContext(nextContext);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [user]);

  const refresh = React.useCallback(async () => {
    if (!user) {
      setContext(null);
      return null;
    }

    const nextContext = await academicService.getContext(user.id);
    setContext(nextContext);
    return nextContext;
  }, [user]);

  return {
    user,
    context,
    loading,
    refresh,
    summary: context
      ? academicService.summarize(context)
      : academicService.summarize({
          profile: null,
          course: null,
          semester: null,
          teachers: [],
          subjects: [],
        }),
  };
}
