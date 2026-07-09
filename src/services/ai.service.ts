import type { AIProvider, StructuredAIRequest } from "@/services/ai/ai-provider";
import { MockAIProvider } from "@/services/ai/mock-ai-provider";

let provider: AIProvider = new MockAIProvider();

export function setAIProvider(nextProvider: AIProvider) {
  provider = nextProvider;
}

export const aiService = {
  runStructured: <TInput, TOutput>(request: StructuredAIRequest<TInput>) =>
    provider.runStructured<TInput, TOutput>(request),
};
