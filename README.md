# Just One More Catch

A contact form and its inbox, in one capsule. The form is a mutation writing a
table — there is no separate forms product to configure.

Run locally:

```sh
sf dev
```

Deploy:

```sh
sf publish
```

The starter app includes:

- `/`: the contact form, built with the platform kit (`@spacefast/zero/kit`).
- `/submissions`: the inbox. The server returns submissions only to signed-in
  users — the client gate is just presentation.

`AGENTS.md` is the guide for coding agents working in this capsule.
