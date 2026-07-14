import { AppError } from "../errors/error-catalog.js";

export function mapDatabaseError(
  error: { code?: string } | null | undefined,
  fallback = "Falha ao acessar os dados.",
): never {
  if (error?.code === "23505") throw new AppError("CONFLICT", "Registro duplicado.", 409);
  if (error?.code === "23503")
    throw new AppError("CONFLICT", "O registro possui relacionamentos invalidos.", 409);
  throw new AppError("INTERNAL_ERROR", fallback, 500);
}
