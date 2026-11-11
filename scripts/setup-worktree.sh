#!/bin/sh
# Give a new worktree the main checkout's git-ignored env files, then install.
set -e
main=$(git worktree list --porcelain | sed -n '1s/^worktree //p')
if [ "$main" != "$(pwd -P)" ]; then
  for f in .env.local .env.production; do
    if [ -f "$main/$f" ] && [ ! -f "$f" ]; then
      cp "$main/$f" "$f" && echo "Copied $f from $main"
    fi
  done
fi
[ -f .env.production ] || echo "Warning: no .env.production, so deploys from here will stop." >&2
pnpm install --frozen-lockfile
