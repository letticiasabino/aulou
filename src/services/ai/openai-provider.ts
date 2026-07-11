import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { env } from "@/config/env";
import type {
  AIProvider,
  StructuredAIRequest,
  StructuredAIResponse,
} from "@/services/ai/ai-provider";

const guardrails = [
  "Nunca invente datas, notas, pesos, professores ou prazos.",
  "Use somente os fatos presentes no contexto recebido.",
  "Quando faltar informacao, diga explicitamente que nao ha informacao suficiente.",
  "Separe informacao extraida, inferencia e recomendacao.",
  "Inclua sourceFileId quando uma informacao vier de arquivo.",
  "Retorne somente o formato estruturado solicitado.",
].join("\n");

export class OpenAIProvider implements AIProvider {
  private readonly client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async runStructured<TInput, TOutput>(
    request: StructuredAIRequest<TInput>,
  ): Promise<StructuredAIResponse<TOutput>> {
    if (!request.outputSchema) throw new Error("Schema de saida da IA nao configurado.");
    const response = await this.client.responses.parse({
      model: env.OPENAI_MODEL ?? "gpt-5-mini",
      input: [
        { role: "system", content: `${guardrails}\n${request.systemInstructions ?? ""}` },
        { role: "user", content: JSON.stringify(request.input) },
      ],
      text: { format: zodTextFormat(request.outputSchema, request.task) },
    });
    if (!response.output_parsed) throw new Error("A IA nao retornou uma resposta estruturada.");
    return {
      output: response.output_parsed as TOutput,
      provider: "openai",
      model: env.OPENAI_MODEL ?? "gpt-5-mini",
      usage: response.usage
        ? { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens }
        : undefined,
    };
  }
}
