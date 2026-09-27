# Git Safety

Git is **read-only by default**. `settings.json` hard-blocks destructive commands: `reset`, `clean`, `restore`, `rebase`, `commit --amend`, `commit -a`/`--all`, discarding checkouts/switches (`checkout -- <path>`, `checkout -f`, `switch -f`), force pushes (incl. `+branch`), pushes to `main`, `branch -D`, and remote branch deletion.

Always allowed (read-only): `status`, `log`, `diff`, `show`, `branch` (list), `remote -v`, `blame`, `rev-parse`, `describe`, `tag` (list).

Other mutating commands (`add`, `commit`, `switch`, `stash`, `push` to a feature branch) are technically permitted but run **only** when the user explicitly grants it in the current conversation ("commit", "stage these", "push and open a PR"). Editing a file ≠ permission to stage it. Run only what was requested — do not chain extras (e.g. don't push after a commit unless asked). Report what you did.

Unstaging needs `restore`/`reset` (blocked) — ask the user. To commit a subset while other files are staged, use `git commit --only -m "…" -- <paths>`; it commits those paths and leaves the rest staged.
