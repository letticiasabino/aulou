# Backup and Recovery

## Production target

- Provider: Supabase managed backups, with point-in-time recovery enabled according to the selected plan.
- Frequency: daily backup minimum; point-in-time recovery preferred for the database.
- Retention: define in the Supabase production project and record the selected plan before beta.
- Storage: academic files require a separate retention and deletion policy; database backup alone is not enough.
- RPO target: 24 hours for beta; RPO under 1 hour after a paid production plan is selected.
- RTO target: 4 hours for beta.

## Recovery procedure

1. Declare incident and freeze destructive operations.
2. Identify the last known good backup and affected data range.
3. Restore into an isolated project first.
4. Run migrations, RLS tests and smoke tests.
5. Switch application credentials only after validation.
6. Record the incident, data loss and follow-up actions.

Status: `BLOQUEADO POR ACESSO EXTERNO` until the production Supabase project and backup plan are verified.
