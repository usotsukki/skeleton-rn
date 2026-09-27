# Git Safety

**Rule.** No git mutations without a grant. `settings.json` hard-blocks the destructive set regardless of grant: `reset`, `clean`, `restore`, `rebase`, `commit --amend`, `commit -a`/`--all`, discarding checkouts/switches, force pushes (incl. `+ref`), pushes to `main`, `branch -D`, remote branch deletion, hook bypass (`--no-verify`, `core.hooksPath`, `HUSKY=0`). The Bash guard hook also catches quoted/combined forms (`"-n"`, `-nm`) and `bash -c` wrappers.

**Grants.**

- **None (default):** edit + verify + report. A session ending with a dirty tree is normal — never commit to "wrap up".
- **Per-command:** "commit this", "stash that" → run exactly that; no chained extras.
- **Session/task:** "you have git for this task", "ship it as a PR" → branch, stage, commit, push the feature branch, open the PR. Scope = that task only.

**Style.** Match the repo's `git log`. Default: short lowercase `type(scope): subject` (commitlint enforces types, scope ≤20 chars, header ≤100), no body unless it adds a *why*, **no trailers**. Branches `feat|fix|chore|docs/<topic>`. PR: short title, empty or 1–3 line body (review bots summarize). Never `Co-Authored-By` an AI or "Generated with …" — the commit-msg hook and Bash guard reject them.

**How.**

- Before a relevant commit, complete the `review-staged` author preflight and confirm the intended commit matches the reviewed content. This is a prerequisite, not a grant to stage or commit.
- Commit a subset while other files are staged: `git commit --only -m "…" -- <paths>`. Unstaging needs `restore`/`reset` → ask the user.
- Need a branch whose `.claude/settings.json` differs? `git worktree add <dir> <branch>` (the guard blocks switching this checkout).
- Report every mutation (branch, commits, push, PR URL) at the end of the turn.

**Why.** Agents committed or pushed unasked, added attribution trailers, and swapped their own permission policy by checking out `main` mid-task.
