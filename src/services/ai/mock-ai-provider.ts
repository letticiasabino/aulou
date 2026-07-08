import type { AIProvider, StructuredAIRequest, StructuredAIResponse } from "@/services/ai/ai-provider";

export class MockAIProvider implements AIProvider {
  async runStructured<TInput, TOutput>(
    request: StructuredAIRequest<TInput>,
  ): Promise<StructuredAIResponse<TOutput>> {
    return {
      output: request.input as unknown as TOutput,
      provider: "mock",
      model: "mock-structured-output",
    };
  }
}
