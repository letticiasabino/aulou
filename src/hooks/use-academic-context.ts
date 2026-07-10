"use client";

import * as React from "react";
import { academicService } from "@/services/academic.service";
import { useUser } from "@/hooks/use-user";
import type { AcademicContext } from "@/types/academic-domain";

export function useAcademicContext() {
  const user = useUser();
  const [context, setContext] = React.useState<AcademicContext | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    void Promise.resolve().then(async () => {
      if (!mounted) {
        return;
      }

      if (!user) {
        setContext(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const nextContext = await academicService.getContext(user.id);
        if (mounted) {
          setContext(nextContext);
        }
      } catch (unknownError) {
        if (mounted) {
          setError(
            unknownError instanceof Error
              ? unknownError.message
              : "Não foi possível carregar seus dados acadêmicos.",
          );
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
      setError(null);
      return null;
    }

    try {
      setError(null);
      const nextContext = await academicService.getContext(user.id);
      setContext(nextContext);
      return nextContext;
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Não foi possível atualizar seus dados acadêmicos.",
      );
      return null;
    }
  }, [user]);

  return {
    user,
    context,
    loading,
    error,
    refresh,
    summary: context
      ? academicService.summarize(context)
      : academicService.summarize({
          profile: null,
          institution: null,
          course: null,
          semester: null,
          teachers: [],
          subjects: [],
        }),
  };
}
