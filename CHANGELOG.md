# Changelog

## v0.1.0 — 2026-05-27

- Initial release: GitHub Action wrapping `evidence-bundle-readme-generator`.
- Inputs: `manifest-path` (required), `output-path`, `comment-on-pr`, `hide-badges`, `anchor-prefix`, `github-token`.
- Outputs: `markdown-length`, `output-written`.
- Dual-mode: post as PR comment AND/OR write to target file path.
- 9 hermetic tests with injected `readFile`/`writeFile`.
- **Fourth in the per-protocol readme-generator Action quintet** — closes the quartet (otel-genai has no readme-generator lib).
- Node 20/22 CI, AGPL-3.0-or-later, Dependabot.
