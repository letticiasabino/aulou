# Production Smoke Test

| Scenario | Expected | Current result | Status |
|---|---|---|---|
| `GET /api/health` | HTTP 200, status ok, no secrets | Validated locally | Pending public deploy |
| Signup/login | Session created and protected | Validated in local E2E | Pending production Auth |
| Onboarding | Data persists after reload | Validated local-first | Pending production Supabase |
| Upload | MIME, extension and size are enforced | Validated locally | Pending production Storage |
| RLS with two users | Complete tenant isolation | Policies inspected; two-user test not executed | Blocked by test accounts |
| Feedback | Authenticated feedback persists in Supabase | Migration applied and insert policy verified | Partial; user-flow test pending |
| Migrations | All versioned migrations applied in order | Applied to the Supabase project | Pass |
| AI | Structured response or safe error | Validated with mock/local provider | Pending production key |
| Checkout | Clearly mocked, no false paid status | Validated locally | Pending real provider |

Evidence available locally: `npm run e2e`, `npm run test`, `npm run build`.
