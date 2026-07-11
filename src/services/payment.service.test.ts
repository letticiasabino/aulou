import { describe, expect, it } from "vitest";
import { paymentService } from "@/services/payment.service";

describe("paymentService", () => {
  it("completa checkout mockado com período anual", async () => {
    const result = await paymentService.startCheckout("pro", "yearly", "user-1");
    expect(result.status).toBe("completed");
    expect(result.subscription?.plan).toBe("pro");
    expect(result.subscription?.provider).toBe("mock");
  });
});
