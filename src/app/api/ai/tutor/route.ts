import { NextResponse } from "next/server";
import { z } from "zod";
import { runUserTutor } from "@/services/ai/server-ai.service";
import { checkApiRequest } from "@/lib/api-security";

const requestSchema = z.object({
  question: z.string().trim().min(2).max(4000),
  materialText: z.string().max(20000).optional().default(""),
  sourceFileId: z.string().uuid().nullable().optional(),
});

export async function POST(request: Request) {
  const securityResponse = checkApiRequest(request, "ai-tutor");
  if (securityResponse) return securityResponse;
  try {
    const input = requestSchema.parse(await request.json());
    return NextResponse.json(await runUserTutor(input));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel responder.";
    const status = message.includes("Sessao") || message.includes("usuario") ? 401 : 400;
    return NextResponse.json(
      { error: status === 401 ? "Sessao necessaria." : message },
      { status },
    );
  }
}
