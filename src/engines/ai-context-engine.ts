import type { AcademicEvent } from "@/types/academic";

export interface AIContextInput {
  events: AcademicEvent[];
  files: Array<{ id: string; name: string; extractedText?: string }>;
  question?: string;
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
        hasExtractedText: Boolean(file.extractedText),
      })),
    },
    instructions: [
      "Não inventar datas, pesos, notas, professores ou prazos.",
      "Separar informação extraída, inferência e recomendação.",
      "Citar arquivo quando usar conteúdo extraído.",
    ],
  };
}
