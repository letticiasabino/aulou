import { NextResponse } from "next/server";
import { z } from "zod";
import { runUserSummary } from "@/services/ai/server-ai.service";
import { checkApiRequest } from "@/lib/api-security";

const requestSchema = z.object({
  materialText: z.string().max(20000).optional().default(""),
  sourceFileId: z.string().uuid().nullable().optional(),
});

export async function POST(request: Request) {
  const securityResponse = checkApiRequest(request, "ai-summary");
  if (securityResponse) return securityResponse;
  try {
    const input = requestSchema.parse(await request.json());
    return NextResponse.json(await runUserSummary(input));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel gerar o resumo.";
    const status = message.includes("Sessao") || message.includes("usuario") ? 401 : 400;
    return NextResponse.json(
      { error: status === 401 ? "Sessao necessaria." : message },
      { status },
    );
  }
}
