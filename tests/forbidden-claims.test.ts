import { describe, expect, it } from "vitest";
import { readAllAppSource } from "./helpers/site-source";

/**
 * Guards against re-introducing unsupported compliance, certification,
 * uptime, migration, deployment-speed, customer, pilot, or outcome claims
 * (see issue #3's full sweep scope). Every pattern here is either a specific
 * phrase this codebase has actually shipped and had to walk back, or a
 * closely-related variant in the same category — not a speculative ban.
 *
 * Patterns that ban a phrase issue #3 also recommends as the *fix* (e.g.
 * "designed to support X", "designed to be Y") carry a negative lookbehind
 * exemption so the hedged/recommended wording itself never fails this test —
 * only the bare, unhedged claim does.
 */
const FORBIDDEN_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "bare ISO 17025 'ready' claim", pattern: /\bISO[\s-]?17025\s+ready\b/i },
  { name: "bare ISO 15189 compliance claim", pattern: /\bISO[\s-]?15189\b[^.\n]{0,30}\b(compliant|certified)\b/i },
  { name: "21 CFR Part 11 'compliant' claim", pattern: /(?<!designed to be )\b21\s?CFR\s?Part\s?11[\s-]*compliant\b/i },
  { name: "21 CFR Part 11 'compatible' claim", pattern: /(?<!designed to be )\b21\s?CFR\s?Part\s?11[\s-]*compatible\b/i },
  { name: "flat 'compliance built in' claim", pattern: /\bcompliance\s+built\s+in\b/i },
  { name: "unqualified certification claim", pattern: /\bcertified\b/i },
  { name: "SOC 2 claim", pattern: /\bSOC\s?2\b/i },
  { name: "uptime/availability percentage claim", pattern: /\d{2,3}(\.\d+)?%\s*(uptime|availability)\b/i },
  { name: "bare guarantee claim (not a disclaimed non-guarantee)", pattern: /(?<!not )(?<!n't )(?<!no )\bguarantee(d|s)?\b/i },
  { name: "'up and running within a X' claim", pattern: /(?<!(?:designed|built) to be )\bup and running within\b/i },
  { name: "'labs often go live in N days' claim", pattern: /(?<!(?:designed|built) to )(?<!can we )\bgo live in\b/i },
  { name: "unqualified bare setup-speed claim ('Set up in days, not months')", pattern: /(?<!(?:designed|built) to )\bset up in days,? not months\b/i },
  { name: "unqualified bare deploy-speed claim ('Deploy(s) in minutes')", pattern: /(?<!(?:designed|built) to )\bdeploys? in minutes\b/i },
  { name: "unqualified bare deploy-speed claim ('Deploy(s) in days, not months')", pattern: /(?<!(?:designed|built) to )\bdeploys? in days,? not months\b/i },
  { name: "unattributed 'trusted/used/relied on by labs' customer-base claim", pattern: /\b(trusted|used|relied on) by\b/i },
  { name: "bare 'immutable' record claim (not hedged as a design goal)", pattern: /(?<!designed to be )\bimmutable\b/i },
  { name: "bare 'satisfies regulatory requirements' claim", pattern: /(?<!designed to )\bsatisf(?:y|ies) regulatory requirements\b/i },
  { name: "absolute zero-error/zero-defect outcome claim ('Zero X. Zero Y.')", pattern: /\bzero [a-z ]+\.\s*zero [a-z]+/i },
  { name: "absolute 100%-accuracy / never-fails outcome claim", pattern: /\b(100%\s*(accurate|accuracy|error-free)|never fails?|always works?)\b/i },
  { name: "third-party 'validated/validates our architecture' endorsement claim", pattern: /\bvalidat(?:ed|es|ing)\b[^.\n-]{0,60}\b(architecture|approach|stack)\b/i },
  { name: "unsupported inbound customer/pilot-pipeline claim", pattern: /\b(applications?|inquiries|leads|signups)\s+(?:are\s+|have been\s+)?(coming|pouring|flooding) in\b/i },
  { name: "unhedged one-click/seamless migration claim", pattern: /\b(seamlessly migrates?|one[- ]click migration)\b/i },
];

describe("forbidden unsupported claims", () => {
  const sources = readAllAppSource();

  it("scanned at least the known public pages", () => {
    // sanity check that the scan isn't accidentally empty
    expect(sources.length).toBeGreaterThan(5);
  });

  for (const { name, pattern } of FORBIDDEN_PATTERNS) {
    it(`does not contain: ${name}`, () => {
      const hits = sources
        .filter(({ content }) => pattern.test(content))
        .map(({ relFile, content }) => {
          const match = content.match(pattern);
          return `${relFile}: ${JSON.stringify(match?.[0])}`;
        });

      expect(hits, `Forbidden claim "${name}" found in:\n${hits.join("\n")}`).toEqual([]);
    });
  }

  it("does not reject the issue's own recommended hedged phrasing (no false positives)", () => {
    const hedgedExamples = [
      "Electronic signatures designed to be 21 CFR Part 11 compliant.",
      "Records designed to be 21 CFR Part 11 compatible with your audit workflow.",
      "Labs are designed to be up and running within a single afternoon.",
      "We do not guarantee specific implementation timelines; results vary by lab.",
      "The audit trail is designed to be immutable.",
      "Electronic signatures designed to satisfy regulatory requirements.",
    ];

    const falsePositives = hedgedExamples.filter((example) =>
      FORBIDDEN_PATTERNS.some(({ pattern }) => pattern.test(example))
    );

    expect(falsePositives).toEqual([]);
  });
});
