import type { BundlePurpose, GenerateOptions, Manifest } from "./types.js";

const PURPOSE_BADGE: Record<BundlePurpose, string> = {
  "rag-citation-pack": "📚 RAG citation pack",
  "audit-evidence": "🧾 Audit evidence",
  "compliance-disclosure": "⚖️ Compliance disclosure",
  "incident-response": "🚨 Incident response",
  "due-diligence": "🔍 Due diligence",
  "regulatory-submission": "📋 Regulatory submission",
  other: "📦 Other"
};

function humanBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function shortHash(sha256: string): string {
  // sha256: prefix is optional in the field; show first 12 hex chars after the prefix.
  const hex = sha256.startsWith("sha256:") ? sha256.slice(7) : sha256;
  return `${hex.slice(0, 12)}…`;
}

function isExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) return false;
  const t = Date.parse(expiresAt);
  return !Number.isNaN(t) && t < Date.now();
}

function header(m: Manifest, opts: GenerateOptions): string {
  const lines: string[] = [];
  lines.push(`# ${m.bundle.subject}`);
  lines.push("");
  if (!opts.hideBadges) {
    const badges: string[] = [];
    if (m.bundle.purpose) badges.push(PURPOSE_BADGE[m.bundle.purpose] ?? m.bundle.purpose);
    badges.push(`**${m.items.length}** items`);
    badges.push(m.signature ? `🔏 signed (${m.signature.algorithm})` : "⚠ unsigned");
    if (m.bundle.expires_at) {
      badges.push(isExpired(m.bundle.expires_at) ? `⏰ **EXPIRED** (${m.bundle.expires_at})` : `expires ${m.bundle.expires_at.slice(0, 10)}`);
    }
    lines.push(badges.join("  ·  "));
    lines.push("");
  }
  lines.push(`**Bundle id:** \`${m.bundle.id}\` · **Creator:** ${m.bundle.creator}`);
  if (m.bundle.created_at) lines.push(`**Created at:** ${m.bundle.created_at}`);
  if (m.evidence_bundle_version) lines.push(`**Spec version:** \`${m.evidence_bundle_version}\``);
  return lines.join("\n");
}

function itemsBlock(m: Manifest, anchorPrefix: string): string {
  const lines: string[] = [`## Items (${m.items.length})`, ""];
  if (m.items.length === 0) {
    lines.push("_No items declared._");
    return lines.join("\n");
  }
  let totalBytes = 0;
  for (const i of m.items) totalBytes += i.size_bytes;
  lines.push(`Total size: **${humanBytes(totalBytes)}**.`);
  lines.push("");
  lines.push(`| id | path | media type | size | sha256 |`);
  lines.push(`|---|---|---|---|---|`);
  for (const i of m.items) {
    lines.push(`| <a id="${anchorPrefix}${i.id}"></a>\`${i.id}\` | \`${i.path}\` | \`${i.media_type}\` | ${humanBytes(i.size_bytes)} | \`${shortHash(i.sha256)}\` |`);
  }
  return lines.join("\n");
}

function relationshipsBlock(m: Manifest): string {
  const rels = m.relationships ?? [];
  const lines: string[] = [`## Relationships (${rels.length})`, ""];
  if (rels.length === 0) {
    lines.push("_No relationships declared._");
    return lines.join("\n");
  }
  lines.push(`| subject | predicate | object | note |`);
  lines.push(`|---|---|---|---|`);
  for (const r of rels) {
    lines.push(`| \`${r.subject}\` | **${r.predicate}** | \`${r.object}\` | ${r.note ?? ""} |`);
  }
  return lines.join("\n");
}

function provenanceBlock(m: Manifest): string {
  const p = m.provenance;
  const lines: string[] = [`## Provenance`, ""];
  if (!p || Object.keys(p).length === 0) {
    lines.push("_No provenance declared._");
    return lines.join("\n");
  }
  if (p.agent_card_uri) lines.push(`- **Agent Card:** ${p.agent_card_uri}`);
  if (p.tool_card_uri) lines.push(`- **Tool Card:** ${p.tool_card_uri}`);
  if (p.prompt_provenance_uri) lines.push(`- **Prompt Provenance:** ${p.prompt_provenance_uri}`);
  if (p.otel_trace_id) lines.push(`- **OTel trace id:** \`${p.otel_trace_id}\``);
  if (p.model) lines.push(`- **Model:** \`${p.model}\``);
  if (p.retrieval_query) lines.push(`- **Retrieval query:** ${p.retrieval_query}`);
  return lines.join("\n");
}

function signatureBlock(m: Manifest): string {
  const s = m.signature;
  const lines: string[] = [`## Signature`, ""];
  if (!s) {
    lines.push("_Bundle is unsigned._");
    return lines.join("\n");
  }
  lines.push(`- **Algorithm:** \`${s.algorithm}\``);
  lines.push(`- **Signer:** ${s.signer}`);
  if (s.signed_at) lines.push(`- **Signed at:** ${s.signed_at}`);
  lines.push(`- **Value:** \`${s.value.slice(0, 24)}…\``);
  return lines.join("\n");
}

function labelsBlock(m: Manifest): string {
  const labels = m.bundle.labels ?? {};
  const keys = Object.keys(labels);
  if (keys.length === 0) return "";
  const lines: string[] = [`## Labels`, ""];
  for (const k of keys) lines.push(`- **${k}:** \`${labels[k]}\``);
  return lines.join("\n");
}

export function generateReadme(m: Manifest, opts: GenerateOptions = {}): string {
  if (!m || !m.bundle || !Array.isArray(m.items)) {
    throw new Error("input must be a valid evidence-bundle manifest");
  }
  const anchorPrefix = opts.anchorPrefix ?? "item-";
  const sections = [
    header(m, opts),
    itemsBlock(m, anchorPrefix),
    relationshipsBlock(m),
    provenanceBlock(m),
    signatureBlock(m),
    labelsBlock(m)
  ].filter((s) => s.length > 0);
  return sections.join("\n\n").trimEnd() + "\n";
}
