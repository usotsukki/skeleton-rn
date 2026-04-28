# MCP Routing

Local repo truth first: code > local docs > targeted MCP > web. MCP usage opt-in, task-specific.

- **Expo MCP**: Expo/EAS config, build, native module, platform behavior
- **Context7 MCP**: version-sensitive library/framework docs when local context insufficient
- **Figma MCP**: when a Figma URL is referenced and design fidelity is needed. Dev Mode (`get_design_context`, `get_variable_defs`, `get_code_connect_*`) requires Org/Enterprise — Starter/Pro tiers fail with `plans-access-and-permissions`. Fallback: ask user for screenshot + token names, or use `get_screenshot` only.
- **Supabase MCP**: live DB inspection (tables, advisors, logs, migrations) when migrations on disk are insufficient.
- **Agent Device**: live mobile exploration, snapshots, short interactions while authoring features.
