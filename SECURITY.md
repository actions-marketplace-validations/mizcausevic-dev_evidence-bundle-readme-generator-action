# Security Policy

`evidence-bundle-readme-generator-action` reads an evidence-bundle manifest JSON at the workflow's checkout HEAD, renders it into Markdown, optionally writes to a target path, and optionally posts a PR comment via the GitHub API. No remote fetch beyond the GitHub API comment call, no execution of user-supplied code.

`${{ github.token }}` is scoped to the repo and never persisted. JSON parsing uses `JSON.parse` without `eval` / `Function()`. This action does **not** verify signatures or item hashes — it only renders the manifest as documentation. Verification is `evidence-bundle-diff`'s job.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

[Open a security advisory](https://github.com/mizcausevic-dev/evidence-bundle-readme-generator-action/security/advisories/new).
