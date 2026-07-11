# Production Sprint - Deploy, Supabase, Monitoring and Real Beta

## Real status

- Local build: previously passed at commit `11af2f2`; current rerun is blocked by a damaged local `node_modules` installation.
- Public deploy: `BLOCKED BY EXTERNAL ACCESS`; no Aulou project or remote Git repository is connected to a hosting provider.
- Supabase: active project confirmed and migrations applied, including `feedback` and production hardening.
- Feedback: backend migration, RLS and authenticated insert path are implemented and applied remotely.
- Health check: available at `/api/health`, returning status, service and environment without secrets.
- RLS: policies and advisor checks verified; two-user isolation test still requires two authenticated test accounts.

## External actions still required

1. Create or connect the Aulou project in Netlify and configure production environment variables.
2. Publish the application, set `NEXT_PUBLIC_SITE_URL`, and configure Auth redirects.
3. Run the two-user RLS test and complete `rules/SMOKE-TEST.md`.
4. Configure uptime monitoring every 5 minutes for `/api/health`.
5. Rotate the Supabase secret/API database credentials that were exposed during setup before commercial beta.

## Local validation note

`npm ci` is currently blocked by Windows file-lock/EPERM errors while replacing native dependencies. The lockfile was not changed. No production test result is claimed for the uncommitted changes until dependencies are restored.
