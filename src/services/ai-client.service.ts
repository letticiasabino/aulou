"use client";

import { isSupabaseConfigured } from "@/lib/supabase/client";
import { buildAIContext } from "@/engines/ai-context-engine";
import { calendarService } from "@/services/calendar.service";
import {
  aiSummarySchema,
  tutorResponseSchema,
  type AISummary,
  type TutorResponse,
} from "@/services/ai/ai-contracts";
import { MockAIProvider } from "@/services/ai/mock-ai-provider";
import { filesService } from "@/services/files.service";

type Input = {
  userId: string;
  question?: string;
  materialText?: string;
  sourceFileId?: string | null;
};

async function request<T>(path: string, input: Input, schema: { parse: (value: unknown) => T }) {
  if (isSupabaseConfigured()) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await response.json()) as { error?: string } & T;
    if (!response.ok) throw new Error(body.error ?? "Nao foi possivel consultar a IA.");
    return schema.parse(body);
  }
  const [events, files] = await Promise.all([
    calendarService.listEvents(input.userId),
    filesService.list(input.userId),
  ]);
  const context = buildAIContext({
    question: input.question,
    materialText: input.materialText,
    events,
    files: files.map((file) => ({ id: file.id, name: file.originalName })),
  });
  const task = path.includes("summary")
    ? ("summarize_material" as const)
    : ("tutor_message" as const);
  const result = await new MockAIProvider().runStructured({
    task,
    userId: input.userId,
    input: { ...context, materialText: input.materialText, question: input.question },
  });
  return schema.parse(result.output);
}

export const aiClientService = {
  summarize(input: Input): Promise<AISummary> {
    return request("/api/ai/summary", input, aiSummarySchema);
  },
  tutor(input: Input): Promise<TutorResponse> {
    return request("/api/ai/tutor", input, tutorResponseSchema);
  },
};
