export const publicRoutes = [
  "/",
  "/pricing",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
] as const;

export const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"] as const;

export const privateRoutes = [
  "/dashboard",
  "/calendar",
  "/files",
  "/subjects",
  "/teachers",
  "/planner",
  "/flashcards",
  "/quizzes",
  "/ai",
  "/settings",
  "/profile",
  "/notifications",
  "/progress",
  "/subscription",
  "/onboarding",
] as const;

export function isPrivateRoute(pathname: string) {
  return privateRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
