# evidence-bundle-readme-generator-action

[![CI](https://github.com/mizcausevic-dev/evidence-bundle-readme-generator-action/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/evidence-bundle-readme-generator-action/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE)

GitHub Action that **renders a human-readable Markdown README from an evidence-bundle manifest JSON**. Wraps [`evidence-bundle-readme-generator`](https://github.com/mizcausevic-dev/evidence-bundle-readme-generator). Posts as PR comment AND/OR writes to a target file path.

**Fourth in the per-protocol readme-generator Action quintet** (closes the quartet — `otel-genai-readme-generator` does not exist as a library).

Part of the [Kinetic Gain Suite](https://suite.kineticgain.com/).

---

## Usage

```yaml
- uses: mizcausevic-dev/evidence-bundle-readme-generator-action@v0.1-shipped
  with:
    manifest-path: bundles/case-001/manifest.json
    output-path: docs/case-001.md   # optional auto-sync
```

## Inputs

| input            | required | default | description |
|---|---|---|---|
| `manifest-path`  | ✓        | —       | Path to the evidence-bundle manifest JSON file. |
| `output-path`    |          | —       | Optional file destination for the rendered Markdown. |
| `comment-on-pr`  |          | `auto`  | `auto` posts only on `pull_request` events. |
| `hide-badges`    |          | `false` | Suppress the trailing badges line. |
| `anchor-prefix`  |          | `item-` | Anchor prefix for item-row anchors in the items table. |
| `github-token`   |          | `${{ github.token }}` | Token for posting the PR comment. |

## Outputs

| output            | description |
|---|---|
| `markdown-length` | Length (in characters) of the rendered Markdown. |
| `output-written`  | `true` iff `output-path` was specified and successfully written. |

## Composes with

- [`evidence-bundle-diff-action`](https://github.com/mizcausevic-dev/evidence-bundle-diff-action) — diff catches breaking changes, this Action keeps the rendered docs in lockstep.
- Siblings: [`agent-card-readme-generator-action`](https://github.com/mizcausevic-dev/agent-card-readme-generator-action) · [`mcp-tool-card-readme-generator-action`](https://github.com/mizcausevic-dev/mcp-tool-card-readme-generator-action) · [`prompt-provenance-readme-generator-action`](https://github.com/mizcausevic-dev/prompt-provenance-readme-generator-action).

## License

[AGPL-3.0-or-later](LICENSE)
