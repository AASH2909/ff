import type { CopilotIntent } from "@/copilot/domain/value-objects";

export class CopilotIntentClassifier {
  classify(question: string): CopilotIntent {
    const normalized = question.trim().toLowerCase();

    if (!normalized) {
      return "UNKNOWN";
    }

    if (matchesAny(normalized, ["timeline", "history", "sequence", "chronology"])) {
      return "TIMELINE_EXPLANATION";
    }

    if (
      matchesAny(normalized, [
        "what will happen",
        "happen next",
        "next",
        "forecast",
        "predict",
        "prediction",
        "future",
        "trend"
      ])
    ) {
      return "WHAT_WILL_HAPPEN_NEXT";
    }

    if (
      matchesAny(normalized, [
        "what should",
        "should we",
        "what do we do",
        "recommend",
        "recommendation",
        "action",
        "fix",
        "improve",
        "prioritize"
      ])
    ) {
      return "WHAT_SHOULD_WE_DO";
    }

    if (matchesAny(normalized, ["why", "cause", "driver", "reason", "root cause"])) {
      return "WHY_DID_THIS_HAPPEN";
    }

    if (
      matchesAny(normalized, [
        "risk",
        "risky",
        "critical",
        "threat",
        "exposure",
        "concern"
      ])
    ) {
      return "RISK_EXPLANATION";
    }

    if (
      matchesAny(normalized, [
        "status",
        "health",
        "overview",
        "summary",
        "how are we doing",
        "control"
      ])
    ) {
      return "BUSINESS_STATUS";
    }

    return "UNKNOWN";
  }
}

function matchesAny(value: string, tokens: string[]) {
  return tokens.some((token) => value.includes(token));
}
