// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildAuditTrail, type AuditTrailData } from "../src/lib/audit-trail";

describe("audit trail chronology", () => {
  it.each([
    {
      name: "orders mixed UTC offsets by instant, newest first",
      drafts: [
        ["OFFSET", "2026-05-06T09:00:00-07:00"],
        ["UTC", "2026-05-06T15:30:00Z"],
        ["POSITIVE-OFFSET", "2026-05-06T18:00:00+03:00"],
      ],
      expectedIds: ["OFFSET", "UTC", "POSITIVE-OFFSET"],
    },
    {
      name: "preserves assembly order for equal instants written differently",
      drafts: [
        ["OFFSET-FIRST", "2026-05-06T09:00:00-07:00"],
        ["UTC-SECOND", "2026-05-06T16:00:00Z"],
        ["POSITIVE-THIRD", "2026-05-06T18:00:00+02:00"],
      ],
      expectedIds: ["OFFSET-FIRST", "UTC-SECOND", "POSITIVE-THIRD"],
    },
    {
      name: "preserves assembly order for identical timestamps",
      drafts: [
        ["FIRST", "2026-05-06T16:00:00Z"],
        ["SECOND", "2026-05-06T16:00:00Z"],
        ["THIRD", "2026-05-06T16:00:00Z"],
      ],
      expectedIds: ["FIRST", "SECOND", "THIRD"],
    },
    {
      name: "places invalid timestamps last in their original order",
      drafts: [
        ["INVALID-FIRST", "not-a-date"],
        ["OLDER", "2026-05-06T15:30:00Z"],
        ["INVALID-EMPTY", ""],
        ["NEWER", "2026-05-06T09:00:00-07:00"],
        ["INVALID-LAST", "2026-99-99T00:00:00Z"],
      ],
      expectedIds: ["NEWER", "OLDER", "INVALID-FIRST", "INVALID-EMPTY", "INVALID-LAST"],
    },
  ])("$name", ({ drafts, expectedIds }) => {
    const data: AuditTrailData = {
      scan_events: [],
      service_events: [],
      reports: [],
      non_compliance_items: [],
      pending_limsbot_drafts: drafts.map(([draft_id, drafted_at]) => ({
        draft_id,
        drafted_at,
        subject: `Subject ${draft_id}`,
        draft_text: `Text ${draft_id}`,
        drafted_by: "limsbot-local",
        approval_required: true,
      })),
    };
    const original = structuredClone(data);
    const sourceArrays = Object.values(data);

    const events = buildAuditTrail(data);

    expect(events.map((event) => event.ref)).toEqual(expectedIds);
    expect(data).toEqual(original);
    Object.values(data).forEach((array, index) => {
      expect(array).toBe(sourceArrays[index]);
    });
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
