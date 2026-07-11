import { checkRateLimit } from "@/lib/rate-limit";

const MAX_JSON_BYTES = 24_000;

export function checkApiRequest(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const result = checkRateLimit(`${scope}:${address}`, 20, 60_000);
  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: "Muitas solicitações. Tente novamente em instantes." }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_JSON_BYTES)
    return new Response(JSON.stringify({ error: "Payload excede o limite permitido." }), {
      status: 413,
      headers: { "content-type": "application/json" },
    });
  return null;
}
