import type {
  AIProvider,
  StructuredAIRequest,
  StructuredAIResponse,
} from "@/services/ai/ai-provider";

export class MockAIProvider implements AIProvider {
  async runStructured<TInput, TOutput>(
    request: StructuredAIRequest<TInput>,
  ): Promise<StructuredAIResponse<TOutput>> {
    const input = request.input as { question?: string; materialText?: string };
    const output =
      request.task === "summarize_material"
        ? {
            overview: input.materialText
              ? "Resumo local gerado a partir do material fornecido. A validação com IA real será usada quando configurada."
              : "Não há material suficiente para gerar um resumo.",
            extractedInformation: input.materialText
              ? [{ text: input.materialText.slice(0, 500), sourceFileId: null }]
              : [],
            keyPoints: [],
            uncertainties: input.materialText
              ? []
              : ["Nenhum material ou texto extraído foi fornecido."],
            studyRecommendations: input.materialText
              ? ["Revise os pontos principais e confirme as informações no material original."]
              : [],
            sourceFileIds: [],
          }
        : {
            answer: input.question
              ? "O modo local ainda não possui contexto suficiente para responder com segurança. Conecte a IA real ou forneça material e uma disciplina no contexto."
              : "Faça uma pergunta sobre sua rotina acadêmica.",
            extractedInformation: [],
            inferences: [],
            recommendations: [],
            missingInformation: ["Contexto acadêmico processado pelo provider real."],
            sourceFileIds: [],
          };
    return {
      output: output as TOutput,
      provider: "mock",
      model: "mock-structured-output",
    };
  }
}
