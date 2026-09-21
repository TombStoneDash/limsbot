// @vitest-environment jsdom

import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

type Rule = { keywords: string[]; file: string };
const routerWindow = window as Window & {
  LimsBotRouter: {
    rules: Rule[];
    unknown: string;
    route(query: string): Rule | null;
  };
};
const script = fs.readFileSync(
  path.resolve(process.cwd(), "public/demo/lims-bot/canned-router.js"),
  "utf8"
);

beforeEach(() => {
  new Function("window", script)(routerWindow);
});

describe("demo chat whole-word routing", () => {
  it.each([
    ["what is an ORU message", "canned/hl7_v2_overview.md"],
    ["HL7 v2 basics", "canned/hl7_v2_overview.md"],
    ["explain chain of custody", "canned/chain_of_custody.md"],
    ["QC workflow?", "canned/qc_workflow.md"],
    ["21 CFR Part 11", "canned/audit_trail.md"],
    ["E1394", "canned/astm_e1394_overview.md"],
    ["HL7", "canned/hl7_v2_overview.md"],
    ["v2", "canned/hl7_v2_overview.md"],
    ["ASTM?", "canned/astm_e1394_overview.md"],
    ["chain---of\n\tcustody!", "canned/chain_of_custody.md"],
    ["Levey-Jennings", "canned/qc_workflow.md"],
    ["HL7 and QC", "canned/qc_workflow.md"],
  ])("routes %j to %s", (query, file) => {
    expect(routerWindow.LimsBotRouter.route(query)?.file).toBe(file);
  });

  it.each([
    "Are you at the COLA forum?",
    "previous results",
    "Do you support Java2 exports",
    "dev2 exports",
    "xqc qcx",
    "xastm astmx",
    "",
    "?! \t",
  ])("returns null for %j", (query) => {
    expect(routerWindow.LimsBotRouter.route(query)).toBeNull();
  });
});
