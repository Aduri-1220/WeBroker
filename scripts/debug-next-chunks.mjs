#!/usr/bin/env node
/**
 * Standalone chunk sanity check (not bundled by Next).
 * Run: node scripts/debug-next-chunks.mjs
 *     node scripts/debug-next-chunks.mjs --repair   # delete .next if graph is inconsistent
 * Writes NDJSON to .cursor/debug-5e0ba9.log and POSTs to debug ingest.
 */
import { appendFile, readFile, readdir, access, mkdir, rm } from "fs/promises";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOG = path.join(ROOT, ".cursor", "debug-5e0ba9.log");
const SESSION = "5e0ba9";
const INGEST =
  "http://127.0.0.1:7706/ingest/81472dc8-adc0-4015-87dd-323ec4fb6250";
const repair = process.argv.includes("--repair");

function shellUlimitN() {
  try {
    return execSync("sh -c 'ulimit -n'", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function emit(entry) {
  const payload = { sessionId: SESSION, timestamp: Date.now(), ...entry };
  const line = JSON.stringify(payload) + "\n";
  await mkdir(path.dirname(LOG), { recursive: true }).catch(() => {});
  await appendFile(LOG, line).catch(() => {});
  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

const server = path.join(ROOT, ".next", "server");
const docPath = path.join(server, "pages", "_document.js");
const wrPath = path.join(server, "webpack-runtime.js");
const chunksDir = path.join(server, "chunks");

await emit({
  hypothesisId: "H4",
  location: "scripts/debug-next-chunks.mjs",
  message: "host limits (EMFILE context)",
  data: {
    platform: process.platform,
    ulimitN: shellUlimitN(),
    repair,
  },
});

let doc = "";
try {
  doc = await readFile(docPath, "utf8");
} catch {
  await emit({
    hypothesisId: "H3",
    location: "scripts/debug-next-chunks.mjs",
    message: "pages/_document.js missing",
    data: { docPath, repair },
  });
  process.exit(repair ? 0 : 1);
}

const chunkMatch = doc.match(/r\.X\(0,\[([^\]]*?)\]/);
const chunkIds =
  chunkMatch?.[1]
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

let chunkFiles = [];
try {
  chunkFiles = await readdir(chunksDir);
} catch {
  chunkFiles = [];
}

const presence = {};
for (const id of chunkIds) {
  const inChunks = chunkFiles.includes(`${id}.js`);
  let atRoot = false;
  try {
    await access(path.join(server, `${id}.js`));
    atRoot = true;
  } catch {
    atRoot = false;
  }
  presence[id] = { inChunksDir: inChunks, atServerRoot: atRoot };
}

let wr = "";
try {
  wr = await readFile(wrPath, "utf8");
} catch {
  wr = "";
}

const usesChunksPrefix = wr.includes('./chunks/"');
const legacyRootRequire =
  wr.includes('require("./"+') || wr.includes('require("./"+t.u');
const anyMissing = chunkIds.some((id) => !presence[id]?.inChunksDir);

const needsPurge = anyMissing || legacyRootRequire;

await emit({
  hypothesisId: "H1",
  location: "scripts/debug-next-chunks.mjs",
  message: "chunk graph vs disk (_document)",
  data: {
    chunkIds,
    presence,
    anyMissing,
    chunkFileCount: chunkFiles.length,
    usesChunksPrefix,
    legacyRootRequire,
    ulimitN: shellUlimitN(),
  },
});

if (repair && needsPurge) {
  await emit({
    hypothesisId: "H5",
    location: "scripts/debug-next-chunks.mjs",
    message: "auto-repair: removing .next",
    data: { anyMissing, legacyRootRequire, chunkIds },
  });
  await rm(path.join(ROOT, ".next"), { recursive: true, force: true });
  console.error(
    "[webroker] Removed .next (stale server chunks or legacy webpack runtime). The dev server will do a full rebuild.",
  );
  process.exit(0);
}

if (!repair) {
  console.log(
    anyMissing
      ? "PROBLEM: missing chunk files for ids"
      : "OK: chunk files present",
  );
  console.log(
    JSON.stringify(
      { chunkIds, anyMissing, usesChunksPrefix, legacyRootRequire },
      null,
      2,
    ),
  );
}

process.exit(anyMissing ? 2 : 0);
