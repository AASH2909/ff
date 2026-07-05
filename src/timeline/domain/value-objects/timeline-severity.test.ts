import { describe, expect, it } from "vitest";
import { DomainError } from "@/domain/errors";
import {
  isTimelineSeverity,
  normalizeTimelineSeverity,
  TIMELINE_SEVERITIES
} from "@/timeline/domain/value-objects/timeline-severity";

describe("timeline severity", () => {
  it("recognizes the supported severity values", () => {
    expect(TIMELINE_SEVERITIES).toEqual(["INFO", "WARNING", "CRITICAL", "SEVERE"]);
    expect(isTimelineSeverity("CRITICAL")).toBe(true);
    expect(isTimelineSeverity("critical")).toBe(false);
    expect(isTimelineSeverity(null)).toBe(false);
  });

  it("normalizes known inputs and rejects invalid values", () => {
    expect(normalizeTimelineSeverity(" warning ")).toBe("WARNING");
    expect(normalizeTimelineSeverity("information")).toBe("INFO");

    expect(() => normalizeTimelineSeverity("urgent")).toThrow(DomainError);
    expect(() => normalizeTimelineSeverity(undefined)).toThrow("Timeline severity is invalid.");
  });
});
