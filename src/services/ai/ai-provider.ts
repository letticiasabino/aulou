import type { ZodType } from "zod";

export interface StructuredAIRequest<TInput> {
  task: "extract_events" | "summarize_material" | "generate_flashcards" | "tutor_message";
  input: TInput;
  userId: string;
  outputSchema?: ZodType;
  systemInstructions?: string;
}

export interface StructuredAIResponse<TOutput> {
  output: TOutput;
  provider: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface AIProvider {
  runStructured<TInput, TOutput>(
    request: StructuredAIRequest<TInput>,
  ): Promise<StructuredAIResponse<TOutput>>;
}
