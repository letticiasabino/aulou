import "server-only";

import { env, isSupabaseConfigured } from "@/config/env";
import { buildAIContext, validateAIReferences } from "@/engines/ai-context-engine";
import { createClient } from "@/lib/supabase/server";
import {
  aiSummarySchema,
  tutorResponseSchema,
  type AISummary,
  type TutorResponse,
} from "@/services/ai/ai-contracts";
import { OpenAIProvider } from "@/services/ai/openai-provider";
import { MockAIProvider } from "@/services/ai/mock-ai-provider";
import type { AIProvider } from "@/services/ai/ai-provider";

type AIRequestContext = { question?: string; materialText?: string; sourceFileId?: string | null };

function provider(): AIProvider {
  return env.OPENAI_API_KEY ? new OpenAIProvider() : new MockAIProvider();
}

export async function runUserSummary(input: AIRequestContext): Promise<AISummary> {
  const context = await buildUserContext(input);
  const result = await provider().runStructured({
    task: "summarize_material",
    userId: context.userId,
    input: context.payload,
    outputSchema: aiSummarySchema,
    systemInstructions:
      "Resuma somente o material e fatos presentes no contexto. Se nao houver material suficiente, declare isso.",
  });
  return validateAIReferences(aiSummarySchema.parse(result.output), context.payload);
}

export async function runUserTutor(input: AIRequestContext): Promise<TutorResponse> {
  const context = await buildUserContext(input);
  const result = await provider().runStructured({
    task: "tutor_message",
    userId: context.userId,
    input: context.payload,
    outputSchema: tutorResponseSchema,
    systemInstructions:
      "Responda a pergunta usando somente o contexto. Nao transforme recomendacoes em fatos.",
  });
  return validateAIReferences(tutorResponseSchema.parse(result.output), context.payload);
}

async function buildUserContext(input: AIRequestContext) {
  if (!isSupabaseConfigured()) throw new Error("Contexto autenticado indisponivel.");
  const supabase = await createClient();
  const userResult = await supabase.auth.getUser();
  if (userResult.error || !userResult.data.user) throw new Error("Sessao expirada.");
  const userId = userResult.data.user.id;
  const [eventsResult, filesResult] = await Promise.all([
    supabase
      .from("academic_events")
      .select("id,title,subject_name,starts_at,source_file_id")
      .eq("user_id", userId)
      .eq("review_status", "confirmed")
      .order("starts_at", { ascending: true, nullsFirst: false })
      .limit(100),
    supabase
      .from("files")
      .select("id,original_name")
      .eq("user_id", userId)
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  if (eventsResult.error || filesResult.error)
    throw new Error("Nao foi possivel montar o contexto academico.");
  const selectedFile = input.sourceFileId
    ? (filesResult.data ?? []).find((file) => file.id === input.sourceFileId)
    : null;
  if (input.sourceFileId && !selectedFile)
    throw new Error("Arquivo nao pertence ao usuario autenticado.");
  let extractedText: string | undefined;
  if (selectedFile) {
    const extractionResult = await supabase
      .from("file_extractions")
      .select("raw_text")
      .eq("user_id", userId)
      .eq("file_id", selectedFile.id)
      .maybeSingle();
    if (extractionResult.error) throw new Error("Nao foi possivel carregar o texto do arquivo.");
    extractedText = extractionResult.data?.raw_text ?? undefined;
  }
  const payload = buildAIContext({
    question: input.question,
    materialText: input.materialText,
    events: (eventsResult.data ?? []).map((event) => ({
      id: event.id,
      title: event.title,
      subjectName: event.subject_name,
      startsAt: event.starts_at,
      sourceFileId: event.source_file_id ?? "",
    })),
    files: (filesResult.data ?? []).map((file) => ({
      id: file.id,
      name: file.original_name,
      extractedText: file.id === input.sourceFileId ? extractedText : undefined,
    })),
  });
  return { userId, payload };
}
