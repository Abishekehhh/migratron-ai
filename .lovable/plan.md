# LegacyPilot implementation plan

## Goal
Replace the blank home screen with a usable COBOL migration workspace: job overview, source submission, phase tracking, code comparison, and impact reporting. Store job data safely in Lovable Cloud and make the external IBM Bob / Antigravity connection boundary explicit rather than simulating a completed migration.

## Build
1. Establish a distinct developer-focused visual system and implement the responsive dashboard as the `/` page, with job filters, progress/status, and job details.
2. Add a migration submission flow for job name and COBOL source, with clear queued/unconnected states and useful demo-free empty states.
3. Create user-owned migration job, phase, impact, and session records in Lovable Cloud with grants, RLS, and update timestamps; connect the UI to authenticated reads and writes.
4. Add the app's sign-in flow required for private migration records, with email/password and Google.
5. Add route-specific metadata, document the deployment/integration boundaries, and verify the preview and database security.

## Technical details
- Keep the app on the existing TanStack Start stack and `/` entry route.
- Use Lovable Cloud tables with owner-scoped access; do not create Supabase Edge Functions.
- Do not claim IBM Bob, Antigravity, Cloud Run, live updates, or source-code conversion are operational without the required external service endpoints and credentials. Leave those integrations clearly marked as not connected.
