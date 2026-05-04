(function () {
  "use strict";

  const UNKNOWN_RESPONSE = "I don't have a vetted answer for that. Please ask the lab director or QA officer.\n\nLIMS BOT only answers from a curated, source-cited reference set.";

  window.LimsBotRouter = {
    rules: [
      { keywords: ["clia", "what is clia", "clinical laboratory"], file: "canned/clia_basics.md" },
      { keywords: ["qc", "quality control", "levey-jennings"], file: "canned/qc_workflow.md" },
      { keywords: ["chain of custody", "specimen chain", "evidence chain"], file: "canned/chain_of_custody.md" },
      { keywords: ["audit trail", "21 cfr part 11"], file: "canned/audit_trail.md" },
      { keywords: ["specimen", "sample lifecycle", "accessioning"], file: "canned/specimen_lifecycle.md" },
      { keywords: ["senaite", "open source lims"], file: "canned/senaite_overview.md" },
      { keywords: ["hl7", "v2", "oru"], file: "canned/hl7_v2_overview.md" },
      { keywords: ["astm", "e1394", "instrument interface"], file: "canned/astm_e1394_overview.md" }
    ],
    unknown: UNKNOWN_RESPONSE,
    route(query) {
      const normalized = String(query || "").toLowerCase();
      return this.rules.find(rule => rule.keywords.some(keyword => normalized.includes(keyword))) || null;
    }
  };
}());
