type WaitlistOutcome = "joined" | "invalid" | "failed";

export function waitlistOutcome(
  result: { ok: boolean; status: number } | "network-error"
): WaitlistOutcome {
  if (result === "network-error") return "failed";
  if (result.ok) return "joined";
  return result.status === 400 ? "invalid" : "failed";
}

export function waitlistErrorMessage(outcome: WaitlistOutcome): string {
  if (outcome === "joined") return "";
  if (outcome === "invalid") return "Please check your name and email.";
  return "We could not reach the server. Please try again, or email info@lims.bot.";
}
