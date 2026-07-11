# Testing Rules

- Every release must pass format check, typecheck, lint, unit tests and production build.
- E2E must cover public routes, authentication/onboarding, health check and security headers.
- Migrations require tests that verify RLS, grants and ownership predicates.
- Production smoke tests must record expected result, observed result, evidence and correction.
- Tests must not depend on production credentials or real user data.
