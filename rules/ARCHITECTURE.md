# Architecture Rules

- Next.js App Router remains the application boundary.
- Business logic lives in engines and services, not visual components.
- Supabase is the production persistence target; local-first is only a development fallback.
- Secrets are server-only. Client code may use only publishable Supabase values.
- External providers must be behind adapters and may not be required for local startup.
- Production changes require migration, RLS, type contract, test and documentation updates.
