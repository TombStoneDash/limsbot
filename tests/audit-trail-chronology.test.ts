// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildAuditTrail, type AuditTrailData } from "../src/lib/audit-trail";

describe("buildAuditTrail chronology", () => {
  it.each([
    {
      name: "sorts mixed offsets by instant, newest first",
      drafts: [
        { draft_id: "DRAFT-OLDER", drafted_at: "2026-05-06T15:30:00Z" },
        { draft_id: "DRAFT-NEWER", drafted_at: "2026-05-06T09:00:00-07:00" },
      ],
      expectedIds: ["DRAFT-NEWER", "DRAFT-OLDER"],
    },
    {
      name: "sorts across a date boundary by instant",
      drafts: [
        { draft_id: "DRAFT-MAY-07", drafted_at: "2026-05-07T00:15:00Z" },
        { draft_id: "DRAFT-MAY-06", drafted_at: "2026-05-06T23:30:00-07:00" },
      ],
      expectedIds: ["DRAFT-MAY-06", "DRAFT-MAY-07"],
    },
    {
      name: "retains input order for identical timestamps",
      drafts: [
        { draft_id: "DRAFT-FIRST", drafted_at: "2026-05-06T16:00:00Z" },
        { draft_id: "DRAFT-SECOND", drafted_at: "2026-05-06T16:00:00Z" },
        { draft_id: "DRAFT-THIRD", drafted_at: "2026-05-06T16:00:00Z" },
      ],
      expectedIds: ["DRAFT-FIRST", "DRAFT-SECOND", "DRAFT-THIRD"],
    },
    {
      name: "retains input order for equivalent instants with different offsets",
      drafts: [
        { draft_id: "DRAFT-FIRST", drafted_at: "2026-05-06T09:00:00-07:00" },
        { draft_id: "DRAFT-SECOND", drafted_at: "2026-05-06T16:00:00Z" },
        { draft_id: "DRAFT-THIRD", drafted_at: "2026-05-06T18:00:00+02:00" },
      ],
      expectedIds: ["DRAFT-FIRST", "DRAFT-SECOND", "DRAFT-THIRD"],
    },
    { name: "handles empty input", drafts: [], expectedIds: [] },
  ])("$name", ({ drafts, expectedIds }) => {
    const data: AuditTrailData = {
      scan_events: [],
      service_events: [],
      reports: [],
      non_compliance_items: [],
      pending_limsbot_drafts: drafts.map((draft) => ({
        ...draft,
        subject: draft.draft_id,
        draft_text: "Review the lab log.",
        drafted_by: "limsbot-local",
        approval_required: true,
      })),
    };
    const before = structuredClone(data);
    const inputArrays = Object.values(data);

    const events = buildAuditTrail(data);

    expect(events.map((event) => event.ref)).toEqual(expectedIds);
    expect(data).toEqual(before);
    Object.values(data).forEach((array, index) => {
      expect(array).toBe(inputArrays[index]);
    });
    expect(events).toEqual(
      expectedIds.map((id) => {
        const draft = before.pending_limsbot_drafts.find((d) => d.draft_id === id)!;
        return {
          ts: draft.drafted_at,
          type: "limsbot-draft",
          actor: draft.drafted_by,
          ref: id,
          action: `LIMS BOT draft '${draft.subject}' awaiting human approval`,
        };
      }),
    );
  });
});
