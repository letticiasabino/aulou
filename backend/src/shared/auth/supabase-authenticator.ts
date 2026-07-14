import { AppError } from "../errors/error-catalog.js";
import type { AppEnv } from "../../config/env.js";
import { createPublicClient } from "../../integrations/supabase/public-client.js";
import { toAuthenticatedUser, type AuthenticatedUser } from "../../integrations/supabase/types.js";
import type { Authenticator } from "./auth.types.js";

export function createSupabaseAuthenticator(config: AppEnv): Authenticator {
  let client: ReturnType<typeof createPublicClient> | null = null;

  return {
    createClient(accessToken: string) {
      return createPublicClient(config, accessToken);
    },
    async authenticate(accessToken: string): Promise<AuthenticatedUser> {
      try {
        client ??= createPublicClient(config);
        const result = await client.auth.getUser(accessToken);
        if (result.error || !result.data.user) {
          const providerMessage = result.error?.message.toLowerCase() ?? "";
          if (providerMessage.includes("expired")) {
            throw new AppError("EXPIRED_AUTH_TOKEN", "Token expirado.", 401);
          }
          throw new AppError("INVALID_AUTH_TOKEN", "Token invalido.", 401);
        }
        return toAuthenticatedUser(result.data.user);
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("AUTH_PROVIDER_ERROR", "Nao foi possivel validar a autenticacao.", 503);
      }
    },
  };
}
