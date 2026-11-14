#!/bin/sh
# Give a new worktree the main checkout's git-ignored env files, then install.
set -e
main=$(git worktree list --porcelain | sed -n '1s/^worktree //p')
if [ "$main" != "$(pwd -P)" ]; then
  if [ -f "$main/.env.local" ] && [ ! -f .env.local ]; then
    cp "$main/.env.local" .env.local && echo "Copied .env.local from $main"
  fi
  # Linked, not copied, so keys added to the main checkout later reach every worktree.
  if [ -f "$main/.env.production" ] && [ ! -e .env.production ]; then
    ln -s "$main/.env.production" .env.production && echo "Linked .env.production to $main"
  fi
fi
[ -f .env.production ] || echo "Warning: no .env.production, so deploys from here will stop." >&2
pnpm install --frozen-lockfile
