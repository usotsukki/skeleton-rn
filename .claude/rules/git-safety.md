# Git Safety

Git is **read-only by default**. `settings.json` blocks all mutating commands: `add`, `stash`, `checkout`, `reset`, `clean`, `restore`, `rm`, `revert`, `cherry-pick`, `rebase`, `merge`, `push`, `commit --amend`, `commit -a`.

Allowed (read-only): `status`, `log`, `diff`, `show`, `branch` (list), `remote -v`, `blame`, `rev-parse`, `describe`, `tag` (list).

Run a mutating command **only** when the user explicitly grants it in the current conversation ("commit", "stash that", "switch branches"). Editing a file ≠ permission to stage it. Run only the specific command requested — do not chain extras (e.g. don't push after a commit unless asked). Report what you did.
