# MCP & Tool Routing

Local truth first: code + `node_modules` > local docs > targeted MCP/CLI > web. MCPs are opt-in and task-specific.

- **Expo MCP** — Expo/EAS config, native modules, platform behavior. **Context7** — version-specific library docs.
- **Supabase MCP** — live DB (tables, advisors, logs, migrations); scoped via local `.mcp.json` (gitignored; copy `.mcp.example.json` and set `project_ref`). Access is **opt-in per session**: ask once ("Supabase ok for this session"), then reads, logs and advisors are allowed until the session ends; a grant never carries over to a new session. Never apply migrations or write data without a per-action ask, even with a session grant. Test users are created by the user (dashboard → Authentication → Add user) — agents don't create accounts or sign in with passwords on the hosted project.
- **Sentry MCP** — orgs/projects/DSNs/issues. Token scopes: `sentry-cli info` (prints scopes, not the token).
- **EAS CLI** — reads env only via `npx dotenv -e .env -- eas …`. Compare EAS vs local values by match/prefix; never print values. `secret` variables can't be read or re-scoped — ask the user.
- **Figma MCP** — only with a Figma URL; Dev Mode tools need Org/Enterprise (fallback: screenshot + token names).
- **Device** — iOS simulator tool / `agent-device` skill for exploration, Maestro for durable flows; delegate runs to the `device-check` agent.
- **Browser (dashboards)** — Google Cloud, Supabase, Firebase, expo.dev: see the `new-app-setup` skill for safe console handling.
