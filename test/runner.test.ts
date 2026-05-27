import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { run, type RunnerEnv } from "../src/runner.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const MANIFEST_CONTENT = readFileSync(`${here}/../fixtures/manifest.json`, "utf8");

function makeEnv(opts: {
  manifestPath?: string;
  manifestContent?: string;
  outputPath?: string;
  isPullRequest?: boolean;
  hasToken?: boolean;
}): RunnerEnv {
  const manifestPath = opts.manifestPath ?? "bundles/case-001/manifest.json";
  const manifestContent = opts.manifestContent ?? MANIFEST_CONTENT;
  const inputs: Record<string, string | undefined> = { manifest_path: manifestPath, comment_on_pr: "false" };
  if (opts.outputPath !== undefined) inputs.output_path = opts.outputPath;
  if (opts.hasToken) inputs.github_token = "ghs_test";

  const writes: Array<{ path: string; content: string }> = [];
  const env: RunnerEnv = {
    inputs,
    readFile: (p) => (p === manifestPath ? manifestContent : "{}"),
    exists: (p) => p === manifestPath || p.endsWith("event.json"),
    writeFile: (p, c) => { writes.push({ path: p, content: c }); },
    write: () => undefined
  };
  (env as RunnerEnv & { __writes: typeof writes }).__writes = writes;

  if (opts.isPullRequest) {
    env.GITHUB_EVENT_NAME = "pull_request";
    env.GITHUB_REPOSITORY = "x/y";
    env.GITHUB_EVENT_PATH = `${here}/event.json`;
    env.readFile = (p) => {
      if (p === manifestPath) return manifestContent;
      if (p.endsWith("event.json")) return JSON.stringify({ number: 42, pull_request: { number: 42, base: { sha: "abc123" } } });
      return "{}";
    };
  }
  return env;
}

describe("runner.run", () => {
  it("generates Markdown from a valid Manifest and exits 0", async () => {
    const r = await run(makeEnv({}));
    expect(r.exitCode).toBe(0);
    expect(r.markdown.length).toBeGreaterThan(0);
  });

  it("rejects when manifest-path input is missing", async () => {
    await expect(run({ inputs: {} })).rejects.toThrow(/manifest_path/);
  });

  it("exits 1 when manifest-path doesn't exist on disk", async () => {
    const env: RunnerEnv = {
      inputs: { manifest_path: "nonexistent.json", comment_on_pr: "false" },
      readFile: () => "{}",
      exists: () => false,
      write: () => undefined
    };
    const r = await run(env);
    expect(r.exitCode).toBe(1);
    expect(r.reason).toBe("manifest-path not found");
  });

  it("exits 1 when manifest-path is malformed JSON", async () => {
    const r = await run(makeEnv({ manifestContent: "not-json {{{" }));
    expect(r.exitCode).toBe(1);
    expect(r.reason).toBe("malformed Manifest JSON");
  });

  it("writes the rendered Markdown to output-path when provided", async () => {
    const env = makeEnv({ outputPath: "docs/bundle.md" });
    const r = await run(env);
    expect(r.outputWritten).toBe(true);
    const writes = (env as RunnerEnv & { __writes: Array<{ path: string; content: string }> }).__writes;
    expect(writes[0].path).toBe("docs/bundle.md");
    expect(writes[0].content).toBe(r.markdown);
  });

  it("exits 1 when output-path write fails", async () => {
    const env = makeEnv({ outputPath: "docs/bundle.md" });
    env.writeFile = () => { throw new Error("EACCES"); };
    const r = await run(env);
    expect(r.exitCode).toBe(1);
    expect(r.reason).toBe("write failed");
  });

  it("posts a PR comment in pull_request context", async () => {
    const calls: Array<{ body: string }> = [];
    const env = makeEnv({ isPullRequest: true, hasToken: true });
    env.inputs.comment_on_pr = "auto";
    env.postComment = async (args) => { calls.push({ body: args.body }); };
    const r = await run(env);
    expect(r.commentPosted).toBe(true);
    expect(calls[0].body).toContain("Evidence Bundle README");
  });

  it("skips PR comment when token is missing", async () => {
    const env = makeEnv({ isPullRequest: true });
    env.inputs.comment_on_pr = "true";
    const r = await run(env);
    expect(r.commentPosted).toBe(false);
    expect(r.reason).toBe("no github-token provided");
  });

  it("does not comment on non-PR events with comment_on_pr=auto", async () => {
    const env: RunnerEnv = {
      inputs: { manifest_path: "x.json", comment_on_pr: "auto", github_token: "ghs" },
      GITHUB_EVENT_NAME: "push",
      readFile: () => MANIFEST_CONTENT,
      exists: (p) => p === "x.json",
      write: () => undefined
    };
    const r = await run(env);
    expect(r.commentPosted).toBe(false);
  });
});
