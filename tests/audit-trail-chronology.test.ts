// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildAuditTrail, type AuditTrailData } from "../src/lib/audit-trail";

describe("buildAuditTrail chronology", () => {
  it.each([
    {
      name: "mixed UTC and offset timestamps",
      drafts: [
        ["UTC-OLDER", "2026-05-06T14:00:00Z"],
        ["OFFSET-NEWER", "2026-05-06T08:00:00-07:00"],
        ["POSITIVE-OFFSET-OLDEST", "2026-05-06T16:00:00+03:00"],
      ],
      expected: ["OFFSET-NEWER", "UTC-OLDER", "POSITIVE-OFFSET-OLDEST"],
    },
    {
      name: "timestamps crossing a UTC date boundary",
      drafts: [
        ["LOCAL-MAY-07", "2026-05-07T00:30:00+02:00"],
        ["UTC-MAY-06", "2026-05-06T23:00:00Z"],
        ["LOCAL-MAY-06", "2026-05-06T23:30:00-02:00"],
      ],
      expected: ["LOCAL-MAY-06", "UTC-MAY-06", "LOCAL-MAY-07"],
    },
    {
      name: "equal instants retain insertion order across identical and different offsets",
      drafts: [
        ["TIE-FIRST", "2026-05-06T08:00:00-07:00"],
        ["OLDER", "2026-05-06T14:00:00Z"],
        ["TIE-SECOND", "2026-05-06T15:00:00Z"],
        ["NEWER", "2026-05-06T16:00:00Z"],
        ["TIE-THIRD", "2026-05-06T08:00:00-07:00"],
        ["TIE-FOURTH", "2026-05-06T17:00:00+02:00"],
      ],
      expected: ["NEWER", "TIE-FIRST", "TIE-SECOND", "TIE-THIRD", "TIE-FOURTH", "OLDER"],
    },
    {
      name: "ordinary same-offset timestamps",
      drafts: [
        ["MIDDLE", "2026-05-06T08:00:00-07:00"],
        ["OLDEST", "2026-05-05T09:00:00-07:00"],
        ["NEWEST", "2026-05-06T09:00:00-07:00"],
      ],
      expected: ["NEWEST", "MIDDLE", "OLDEST"],
    },
  ])("sorts $name newest first without changing data or event fields", ({ drafts, expected }) => {
    const data: AuditTrailData = {
      scan_events: [],
      service_events: [],
      reports: [],
      non_compliance_items: [],
      pending_limsbot_drafts: drafts.map(([draft_id, drafted_at]) => ({
        draft_id,
        drafted_at,
        subject: `Subject for ${draft_id}`,
        draft_text: `Text for ${draft_id}`,
        drafted_by: "limsbot-local",
        approval_required: true,
      })),
    };
    const original = structuredClone(data);

    const events = buildAuditTrail(data);

    expect(events.map((event) => event.ref)).toEqual(expected);
    expect(data).toEqual(original);
    for (const draft of original.pending_limsbot_drafts) {
      expect(events.find((event) => event.ref === draft.draft_id)).toEqual({
        ts: draft.drafted_at,
        type: "limsbot-draft",
        actor: draft.drafted_by,
        ref: draft.draft_id,
        action: `LIMS BOT draft '${draft.subject}' awaiting human approval`,
      });
    }
  });
});
