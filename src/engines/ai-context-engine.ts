import type { AcademicEvent } from "@/types/academic";

const MAX_MATERIAL_CHARS = 20000;

export type AIFileContext = {
  id: string;
  name: string;
  extractedText?: string;
};

export interface AIContextInput {
  events: Array<Pick<AcademicEvent, "id" | "title" | "subjectName" | "startsAt" | "sourceFileId">>;
  files: AIFileContext[];
  question?: string;
  materialText?: string;
}

export function buildAIContext(input: AIContextInput) {
  return {
    question: input.question ?? null,
    extractedInformation: {
      events: input.events.map((event) => ({
        id: event.id,
        title: event.title,
        subjectName: event.subjectName,
        startsAt: event.startsAt,
        sourceFileId: event.sourceFileId,
      })),
      files: input.files.map((file) => ({
        id: file.id,
        name: file.name,
        extractedText: file.extractedText?.slice(0, MAX_MATERIAL_CHARS) ?? null,
      })),
      materialText: input.materialText?.slice(0, MAX_MATERIAL_CHARS) ?? null,
    },
    instructions: [
      "Não inventar datas, pesos, notas, professores ou prazos.",
      "Separar informação extraída, inferência e recomendação.",
      "Citar arquivo quando usar conteúdo extraído.",
    ],
  };
}

export function serializeAIContext(context: ReturnType<typeof buildAIContext>) {
  return JSON.stringify(context);
}

export function validateAIReferences<
  T extends {
    sourceFileIds?: string[];
    extractedInformation?: Array<{ sourceFileId: string | null }>;
  },
>(response: T, context: ReturnType<typeof buildAIContext>) {
  const knownIds = new Set(context.extractedInformation.files.map((file) => file.id));
  const references = [
    ...(response.sourceFileIds ?? []),
    ...(response.extractedInformation ?? []).flatMap((item) =>
      item.sourceFileId ? [item.sourceFileId] : [],
    ),
  ];
  const unknownReference = references.find((reference) => !knownIds.has(reference));
  if (unknownReference)
    throw new Error("A resposta da IA citou um arquivo fora do contexto autorizado.");
  return response;
}
