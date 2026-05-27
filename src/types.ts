// Generate a human-readable Markdown README from an evidence-bundle manifest.json.
// Reference: https://github.com/mizcausevic-dev/evidence-bundle-spec

export type BundlePurpose =
  | "rag-citation-pack"
  | "audit-evidence"
  | "compliance-disclosure"
  | "incident-response"
  | "due-diligence"
  | "regulatory-submission"
  | "other";

export type RelationshipPredicate =
  | "cites"
  | "supersedes"
  | "derived-from"
  | "contradicts"
  | "summarizes"
  | "redaction-of";

export type SignatureAlgorithm = "ed25519" | "bls12-381-aggregate";

export interface ManifestItem {
  id: string;
  path: string;
  media_type: string;
  sha256: string;
  size_bytes: number;
  source_uri?: string;
  retrieved_at?: string;
  description?: string;
  labels?: Record<string, string>;
}

export interface Relationship {
  subject: string;
  predicate: RelationshipPredicate;
  object: string;
  note?: string;
}

export interface Provenance {
  agent_card_uri?: string;
  tool_card_uri?: string;
  prompt_provenance_uri?: string;
  otel_trace_id?: string;
  model?: string;
  retrieval_query?: string;
}

export interface Signature {
  algorithm: SignatureAlgorithm;
  signer: string;
  value: string;
  signed_at?: string;
}

export interface Manifest {
  evidence_bundle_version: string;
  bundle: {
    id: string;
    subject: string;
    purpose?: BundlePurpose;
    created_at?: string;
    creator: string;
    expires_at?: string;
    labels?: Record<string, string>;
  };
  items: ManifestItem[];
  relationships?: Relationship[];
  provenance?: Provenance;
  signature?: Signature;
}

export interface GenerateOptions {
  /** Suppress the badge line under the title. */
  hideBadges?: boolean;
  /** Anchor prefix for per-item anchors. Default "item-". */
  anchorPrefix?: string;
}
