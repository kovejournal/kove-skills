#!/usr/bin/env node
// Checks this repository's structure: the skills against the Agent Skills spec, the manifests against each other
// and against the Agent Plugins 1.0 shape, the links and assets they name, and that nothing secret slipped in.
// No dependencies, Node 20 or later: `node scripts/validate.mjs`. Exits 1 and lists every problem it finds.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const fail = (where, what) => problems.push(`${where}: ${what}`);
const rel = (p) => relative(ROOT, p) || ".";

const AGENT_PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const AGENT_MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";
const AGENT_PLUGIN_KEYS = new Set(["$schema", "name", "version", "description", "author", "homepage", "repository", "license", "keywords", "extensions"]);
const PLUGIN_NAME = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SKILL_KEYS = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
// The licence is Apache 2.0 exactly as published, so GitHub and every directory read it as Apache 2.0 rather than
// "Other", and its own section 6 already says the Kove name and logo are not granted. This is the SHA-256 of
// https://www.apache.org/licenses/LICENSE-2.0.txt; a changed byte means it is no longer the licence the manifests name.
const LICENSE_ID = "Apache-2.0";
const APACHE_SHA256 = "cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30";

/** Every file in the repo, skipping git's own folder. */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === ".git" || name === "node_modules") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function readJson(path) {
  const p = join(ROOT, path);
  if (!existsSync(p)) {
    fail(path, "missing");
    return null;
  }
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    fail(path, `not valid JSON (${e.message})`);
    return null;
  }
}

/** A plugin-relative path that must exist and stay inside the plugin. */
function checkAsset(where, path) {
  if (typeof path !== "string" || !path) return fail(where, "asset path missing");
  if (path.includes("..") || path.startsWith("/")) return fail(where, `"${path}" must be relative, with no ".."`);
  if (!existsSync(join(ROOT, path))) fail(where, `"${path}" does not exist`);
}

/** The frontmatter of a SKILL.md: plain `key: value` lines and one level of nested map. */
function frontmatter(text, where) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) {
    fail(where, "no frontmatter between --- lines at the top");
    return { meta: {}, body: text };
  }
  const meta = {};
  let parent = null;
  // A value may be quoted ("…" or '…', which YAML allows), and the quotes are not part of it. A block scalar
  // (`description: >` or `|`) is valid YAML that this small parser does not read, so it says so instead of
  // checking the wrong text.
  const value = (key, v) => {
    if (/^[>|][-+]?$/.test(v)) {
      fail(where, `"${key}" is written as a YAML block (${v}); write it on one line here`);
      return "";
    }
    const q = /^(["'])(.*)\1$/.exec(v);
    return q ? q[2] : v;
  };
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const nested = /^ {2}([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    const top = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (nested && parent) meta[parent][nested[1]] = value(`${parent}.${nested[1]}`, nested[2]);
    else if (top) {
      if (top[2] === "") {
        parent = top[1];
        meta[parent] = {};
      } else {
        parent = null;
        meta[top[1]] = value(top[1], top[2]);
      }
    } else fail(where, `frontmatter line not understood: "${line}"`);
  }
  return { meta, body: text.slice(m[0].length) };
}

/** Relative links and pictures in a file must resolve: markdown links and images, and the src and srcset of an
 *  HTML <img> or <source> (the README's pictures). External links and anchors are not checked. */
function checkLinks(file, text) {
  const targets = [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
  for (const [, src] of text.matchAll(/\ssrc="([^"]+)"/g)) targets.push(src);
  for (const [, set] of text.matchAll(/\ssrcset="([^"]+)"/g)) for (const part of set.split(",")) targets.push(part.trim().split(/\s+/)[0]);
  for (const target of targets) {
    if (!target || /^(https?:|mailto:|#|data:)/.test(target)) continue;
    const path = target.split("#")[0];
    if (!path) continue;
    if (!existsSync(join(dirname(file), path))) fail(rel(file), `link to "${target}" does not resolve`);
  }
}

// ── The skills ──────────────────────────────────────────────────────────────────────────────────────────────

const skillsDir = join(ROOT, "skills");
const skills = existsSync(skillsDir) ? readdirSync(skillsDir).filter((n) => statSync(join(skillsDir, n)).isDirectory()) : [];
if (!skills.length) fail("skills", "no skills found");

for (const dir of skills) {
  const where = `skills/${dir}/SKILL.md`;
  const path = join(skillsDir, dir, "SKILL.md");
  if (!existsSync(path)) {
    fail(`skills/${dir}`, "no SKILL.md");
    continue;
  }
  const text = readFileSync(path, "utf8");
  const { meta, body } = frontmatter(text, where);
  for (const key of Object.keys(meta)) if (!SKILL_KEYS.has(key)) fail(where, `unknown frontmatter key "${key}"`);
  const name = meta.name ?? "";
  if (!SKILL_NAME.test(name) || name.length > 64) fail(where, `name "${name}" must be 1-64 lowercase letters, digits and single hyphens`);
  if (name !== dir) fail(where, `name "${name}" must equal its folder "${dir}"`);
  const desc = meta.description ?? "";
  if (!desc || desc.length > 1024) fail(where, `description must be 1-1024 characters (is ${desc.length})`);
  if (/[<>]/.test(desc)) fail(where, "description must not contain < or >");
  if (meta.compatibility && meta.compatibility.length > 500) fail(where, "compatibility must be at most 500 characters");
  if (meta.license !== LICENSE_ID) fail(where, `license must be "${LICENSE_ID}", like the repository`);
  if (meta.metadata && typeof meta.metadata !== "object") fail(where, "metadata must be a map");
  const lines = body.split("\n").length;
  if (lines > 500) fail(where, `body is ${lines} lines; keep it under 500 and move detail to references/`);
  checkLinks(path, text);

  const refs = join(skillsDir, dir, "references");
  if (existsSync(refs)) {
    for (const name of readdirSync(refs)) {
      const p = join(refs, name);
      if (statSync(p).isDirectory()) fail(rel(p), "references must be one level deep");
      else if (name.endsWith(".md")) checkLinks(p, readFileSync(p, "utf8"));
    }
  }
  if (existsSync(join(skillsDir, dir, "scripts"))) fail(`skills/${dir}`, "skills here carry no scripts: they teach, they never run");
}

// Every JSON example names the tool it calls (```json log_meal) and parses. Kove's own build also checks it against
// that tool's input.
for (const file of walk(skillsDir).filter((f) => f.endsWith(".md"))) {
  for (const [, info, body] of readFileSync(file, "utf8").matchAll(/```([^\n]*)\n([\s\S]*?)```/g)) {
    if (!info.startsWith("json")) continue;
    if (!/^json [a-z_]+$/.test(info.trim())) fail(rel(file), `a JSON example must name its tool: \`\`\`json <tool>, not \`\`\`${info}`);
    try {
      JSON.parse(body);
    } catch (e) {
      fail(rel(file), `the ${info.trim()} example is not valid JSON (${e.message})`);
    }
  }
}

// ── The manifests ───────────────────────────────────────────────────────────────────────────────────────────

const agent = readJson("plugin.json");
const claude = readJson(".claude-plugin/plugin.json");
const market = readJson(".claude-plugin/marketplace.json");
const cursor = readJson(".cursor-plugin/plugin.json");
const agentMcp = readJson("mcp.json");
const claudeMcp = readJson(".mcp.json");

if (agent) {
  if (agent.$schema !== AGENT_PLUGIN_SCHEMA) fail("plugin.json", `$schema must be ${AGENT_PLUGIN_SCHEMA}`);
  for (const key of Object.keys(agent)) if (!AGENT_PLUGIN_KEYS.has(key)) fail("plugin.json", `"${key}" is not an Agent Plugins 1.0 field`);
  if (agent.author) for (const key of Object.keys(agent.author)) if (!["name", "email", "url"].includes(key)) fail("plugin.json", `author.${key} is not allowed`);
}

const entry = market?.plugins?.[0];
if (market && market.plugins?.length !== 1) fail(".claude-plugin/marketplace.json", "must list exactly one plugin");
if (entry && entry.source !== "./") fail(".claude-plugin/marketplace.json", 'the plugin\'s source must be "./" (this repo is the plugin)');

const manifests = [
  ["plugin.json", agent],
  [".claude-plugin/plugin.json", claude],
  [".cursor-plugin/plugin.json", cursor],
  [".claude-plugin/marketplace.json plugins[0]", entry],
].filter(([, m]) => m);

for (const field of ["name", "version", "description", "repository", "license", "homepage"]) {
  const values = new Set(manifests.map(([, m]) => JSON.stringify(m[field])));
  if (values.size > 1) fail("manifests", `"${field}" differs between ${manifests.map(([w]) => w).join(", ")}`);
}
for (const [where, m] of manifests) {
  if (!PLUGIN_NAME.test(m.name ?? "")) fail(where, `name "${m.name}" is not a valid plugin name`);
  if (!SEMVER.test(m.version ?? "")) fail(where, `version "${m.version}" is not semver`);
}
if (market?.metadata?.version && market.metadata.version !== agent?.version) fail(".claude-plugin/marketplace.json", "metadata.version must equal the plugin's version");
if (claude?.icon) checkAsset(".claude-plugin/plugin.json icon", claude.icon.replace(/^\.\//, ""));
if (cursor) checkAsset(".cursor-plugin/plugin.json logo", cursor.logo);

// ── The MCP server files ────────────────────────────────────────────────────────────────────────────────────

const servers = (file, json, type) => {
  if (!json) return [];
  const list = Object.entries(json.mcpServers ?? {});
  if (list.length !== 1) fail(file, "must declare exactly one server");
  for (const [name, s] of list) {
    if (s.type !== type) fail(file, `server "${name}" must have type "${type}"`);
    if (!/^https:\/\//.test(s.url ?? "")) fail(file, `server "${name}" needs an https url`);
    for (const key of Object.keys(s)) if (!["type", "url"].includes(key)) fail(file, `server "${name}" carries "${key}": the host signs in with OAuth, nothing else belongs here`);
  }
  return list.map(([, s]) => s.url);
};
if (agentMcp && agentMcp.$schema !== AGENT_MCP_SCHEMA) fail("mcp.json", `$schema must be ${AGENT_MCP_SCHEMA}`);
const urls = new Set([...servers("mcp.json", agentMcp, "streamable-http"), ...servers(".mcp.json", claudeMcp, "http")]);
if (urls.size > 1) fail("mcp.json, .mcp.json", "the two server files point at different addresses");

// The MCP Registry's entry names the same address, or the Registry sends people somewhere the plugins do not.
// Its version is the server's own and moves only when the server changes, so it is not compared with the plugins'.
const registry = readJson("server.json");
if (registry) {
  if (!/^https:\/\/static\.modelcontextprotocol\.io\/schemas\/[^/]+\/server\.schema\.json$/.test(registry.$schema ?? ""))
    fail("server.json", "$schema must be the MCP Registry's server schema");
  if (!SEMVER.test(registry.version ?? "")) fail("server.json", `version "${registry.version}" is not semver`);
  const remotes = registry.remotes ?? [];
  if (remotes.length !== 1) fail("server.json", "must list exactly one remote");
  for (const r of remotes) {
    if (r.type !== "streamable-http") fail("server.json", 'the remote must have type "streamable-http"');
    if (!urls.has(r.url)) fail("server.json", `the remote "${r.url}" is not the address mcp.json and .mcp.json give`);
  }
}

// ── The documents at the top (the README's links and pictures) ─────────────────────────────────────────────

for (const name of readdirSync(ROOT).filter((n) => n.endsWith(".md"))) checkLinks(join(ROOT, name), readFileSync(join(ROOT, name), "utf8"));

// ── Every file ──────────────────────────────────────────────────────────────────────────────────────────────

const SECRET = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
  [/\b(?:sk|pk|rk)-[A-Za-z0-9_-]{20,}/, "an API key"],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/, "a GitHub token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "an AWS key"],
  [/\bBearer\s+[A-Za-z0-9._-]{20,}/, "a bearer token"],
];
for (const file of walk(ROOT)) {
  if (!/\.(md|json|ya?ml|mjs|svg|txt)$/.test(file) && !file.endsWith("LICENSE")) continue;
  const text = readFileSync(file, "utf8");
  if (/[\u2013\u2014]/.test(text)) fail(rel(file), "contains an en or em dash: use a comma, a colon, parentheses or a hyphen");
  for (const [re, what] of SECRET) if (re.test(text)) fail(rel(file), `looks like it holds ${what}`);
}

const license = existsSync(join(ROOT, "LICENSE")) ? readFileSync(join(ROOT, "LICENSE")) : Buffer.alloc(0);
if (createHash("sha256").update(license).digest("hex") !== APACHE_SHA256)
  fail("LICENSE", "must be the Apache License 2.0 text exactly as published at apache.org, unchanged");
for (const [where, m] of manifests) if (m.license !== LICENSE_ID) fail(where, `license must be "${LICENSE_ID}"`);
const notice = existsSync(join(ROOT, "NOTICE")) ? readFileSync(join(ROOT, "NOTICE"), "utf8") : "";
if (!/Copyright \d{4}/.test(notice)) fail("NOTICE", "missing, or names no copyright holder");
// Releases are published by a GitHub App that may change files but not workflows, so a workflow here would
// fail the release; pull requests are checked by this script where they are applied. Files count, not the
// folder: an emptied folder left behind (or a .DS_Store) publishes nothing.
const workflowsDir = join(ROOT, ".github", "workflows");
if (existsSync(workflowsDir) && walk(workflowsDir).some((f) => !f.endsWith(".DS_Store")))
  fail(".github/workflows", "a release cannot publish a workflow; this script checks pull requests where they are applied");
const changelog = existsSync(join(ROOT, "CHANGELOG.md")) ? readFileSync(join(ROOT, "CHANGELOG.md"), "utf8") : "";
const versionHeading = agent?.version && new RegExp(`^## ${agent.version.replace(/[.+-]/g, "\\$&")}\\s*$`, "m");
if (versionHeading && !versionHeading.test(changelog)) fail("CHANGELOG.md", `no entry for ${agent.version}`);

if (problems.length) {
  console.error(`kove-skills: ${problems.length} problem(s)\n` + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log(`kove-skills: ${skills.length} skills and ${manifests.length} manifests check out (${[...urls][0] ?? "no server"})`);
