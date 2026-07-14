import type { AppEnv } from "../../config/env.js";

export type NotificationEmail = {
  to: string;
  title: string;
  message: string;
  idempotencyKey: string;
};
export type EmailIntegration = {
  configured: boolean;
  sendNotification(input: NotificationEmail): Promise<{ id: string } | null>;
};

export function createEmailIntegration(config: AppEnv): EmailIntegration {
  const configured = Boolean(config.RESEND_API_KEY && config.EMAIL_FROM);
  return {
    configured,
    async sendNotification(input) {
      if (!configured) return null;
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.RESEND_API_KEY}`,
          "content-type": "application/json",
          "idempotency-key": input.idempotencyKey,
        },
        body: JSON.stringify({
          from: config.EMAIL_FROM,
          to: [input.to],
          subject: input.title,
          text: `${input.message}\n\nAcesse o Aulou: ${config.FRONTEND_URL}/notifications`,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        throw new Error(`Resend rejected the email (${response.status}): ${detail}`);
      }
      const payload = (await response.json()) as { id?: string };
      if (!payload.id) throw new Error("Resend returned no email id.");
      return { id: payload.id };
    },
  };
}
