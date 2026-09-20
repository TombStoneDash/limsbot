import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileFunction } from "node:vm";
import ts from "typescript";
import type { NextRequest } from "next/server";

const require = createRequire(import.meta.url);
const routePath = fileURLToPath(new URL("../src/app/api/waitlist/route.ts", import.meta.url));

// Native Node strips this test's types, but doesn't resolve Next's TS aliases.
// Use the existing TypeScript compiler to load the unchanged handler as CommonJS,
// substituting only its Supabase import. NextResponse remains the real implementation.
// The production client's lazy proxy cannot safely be monkey-patched via `.from`.
const routeCode = ts.transpileModule(readFileSync(routePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup(error: { message: string } | null = null) {
  const tables: string[] = [];
  const upserts: { row: unknown; options: unknown }[] = [];
  let selects = 0;
  const supabase = {
    from(table: string) {
      tables.push(table);
      return {
        upsert(row: unknown, options: unknown) {
          upserts.push({ row, options });
          return {
            async select() {
              selects++;
              return { data: null, error };
            },
          };
        },
      };
    },
  };
  const exports = {} as { POST: (request: NextRequest) => Promise<Response> };
  compileFunction(routeCode, ["require", "exports"], { filename: routePath })(
    (specifier: string) => {
      if (specifier === "@/lib/supabase") return { supabase };
      if (specifier === "next/server") return require(specifier);
      throw new Error(`Unexpected route import: ${specifier}`);
    },
    exports,
  );
  const { NextRequest } = require("next/server");
  return {
    tables,
    upserts,
    get selects() { return selects; },
    post: (body: unknown) => exports.POST(new NextRequest("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })),
  };
}

for (const [label, payload] of [
  ["missing name", { email: "test@example.com" }],
  ["missing email", { name: "Test User" }],
  ["empty name", { name: "", email: "test@example.com" }],
  ["empty email", { name: "Test User", email: "" }],
] as const) {
  test(`${label} returns 400 without calling Supabase`, async () => {
    const handler = setup();
    const response = await handler.post(payload);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Name and email required" });
    assert.deepEqual(handler.tables, []);
    assert.deepEqual(handler.upserts, []);
    assert.equal(handler.selects, 0);
  });
}

for (const [label, optional, expected] of [
  ["provided", { organization: "Test Lab", role: "Lab Manager" }, { organization: "Test Lab", role: "Lab Manager" }],
  ["omitted", {}, { organization: null, role: null }],
] as const) {
  test(`valid payload upserts by email with optional fields ${label}`, async (t) => {
    t.mock.method(console, "log", () => {});
    const handler = setup();
    const payload = { name: "Test User", email: "test@example.com", ...optional };
    const response = await handler.post(payload);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.deepEqual(handler.tables, ["limsbox_waitlist"]);
    assert.deepEqual(handler.upserts, [{
      row: { name: payload.name, email: payload.email, ...expected, source: "lims.bot" },
      options: { onConflict: "email" },
    }]);
    assert.equal(handler.selects, 1);
  });
}

test("Supabase errors are logged but still return success to the caller", async (t) => {
  t.mock.method(console, "log", () => {});
  const logged = t.mock.method(console, "error", () => {});
  const error = { message: "Simulated database failure" };
  const handler = setup(error);
  const response = await handler.post({ name: "Test User", email: "test@example.com" });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.deepEqual(handler.tables, ["limsbox_waitlist"]);
  assert.equal(handler.upserts.length, 1);
  assert.equal(handler.selects, 1);
  assert.equal(logged.mock.callCount(), 1);
  assert.deepEqual(logged.mock.calls[0].arguments, ["Supabase error:", error]);
});
