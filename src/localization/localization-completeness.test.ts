import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { dictionaries, type MessageKey } from "@/localization";
import { createLocaleTranslator } from "@/localization/locale-runtime";
import {
  initialOperationalDemoState,
  applyOperationalDemoAction
} from "@/components/app/operational-demo-state";

const visibleGroups = {
  navigation: ["nav."],
  kitchen: ["pages.kitchen."],
  inventory: ["pages.inventory."],
  pos: ["pages.pos."],
  settings: ["pages.settings."],
  loginAndUnauthorized: ["auth."],
  statuses: ["status."],
  dashboard: ["dashboard."],
  missionsAndCtas: ["demo."],
  executiveWorkspace: ["executive."]
} as const;

const intentionallyLocaleInvariant = new Set<MessageKey>([
  "nav.pos",
  "executive.restaurant.harborPine"
]);

function keysFor(prefixes: readonly string[]) {
  return (Object.keys(dictionaries.en) as MessageKey[]).filter((key) =>
    prefixes.some((prefix) => key.startsWith(prefix))
  );
}

describe("Russian localization completeness", () => {
  it("keeps exact English and Russian dictionary parity", () => {
    expect(Object.keys(dictionaries.ru)).toEqual(Object.keys(dictionaries.en));
  });

  it.each(Object.entries(visibleGroups))(
    "translates every visible %s message",
    (_, prefixes) => {
      for (const key of keysFor(prefixes)) {
        if (intentionallyLocaleInvariant.has(key)) continue;
        expect(dictionaries.ru[key], key).not.toBe(dictionaries.en[key]);
      }
    }
  );

  it("covers the Dashboard timeline, signal chain, and Ask AI catalogs", () => {
    const requiredPrefixes = [
      "dashboard.timeline.",
      "dashboard.signal.",
      "dashboard.copilot."
    ];

    for (const prefix of requiredPrefixes) {
      expect(keysFor([prefix]).length, prefix).toBeGreaterThan(0);
      for (const key of keysFor([prefix])) {
        expect(dictionaries.ru[key], key).not.toBe(dictionaries.en[key]);
      }
    }
  });

  it("interpolates composed Russian presentation copy without exposing a key", () => {
    const translate = createLocaleTranslator("ru");
    const result = translate("pages.pos.queueRemaining", { count: 4 });
    expect(result).toContain("4");
    expect(result).not.toContain("refund items remain");
    expect(result).not.toContain("pages.pos.queueRemaining");
  });

  it("keeps locale-invariant product data and internal values unchanged", () => {
    expect("Harbor & Pine").toBe("Harbor & Pine");
    expect("/dashboard").toBe("/dashboard");
    expect("complete-rebalance").toBe("complete-rebalance");
    expect("rush").toBe("rush");
  });

  it("does not reset or mutate operational state when translation changes", () => {
    const progressed = applyOperationalDemoAction(
      initialOperationalDemoState,
      "complete-rebalance"
    );
    const snapshot = structuredClone(progressed);

    createLocaleTranslator("ru")("demo.handoffMission");
    createLocaleTranslator("en")("demo.handoffMission");

    expect(progressed).toEqual(snapshot);
    expect(progressed.controlScore).toBeGreaterThan(
      initialOperationalDemoState.controlScore
    );
  });

  it("never returns a technical key for a catalogued message", () => {
    const translate = createLocaleTranslator("ru");
    for (const key of Object.keys(dictionaries.en) as MessageKey[]) {
      expect(translate(key), key).not.toBe(key);
    }
  });

  it("provides Russian messages for every remaining product-review key", () => {
    const requiredKeys = [
      "dashboard.scope.tenant",
      "dashboard.scope.businessUnit",
      "dashboard.scope.optional",
      "dashboard.scope.apply",
      "dashboard.scope.refresh",
      "dashboard.scope.demoData",
      "dashboard.openDemo",
      "dashboard.demo.dailyDeltaImproved",
      "dashboard.copilot.productName",
      "dashboard.copilot.confidenceValue",
      "dashboard.scoreChangeValue",
      "dashboard.scoreTransition",
      "dashboard.noImprovedDomains",
      "dashboard.noDeterioratedDomains",
      "common.languageEnglish",
      "common.languageRussian"
    ];
    const translate = createLocaleTranslator("ru");

    for (const rawKey of requiredKeys) {
      const key = rawKey as MessageKey;
      expect(translate(key), rawKey).not.toBe("");
      expect(translate(key), rawKey).not.toBe(rawKey);
      expect(translate(key), rawKey).not.toBe(
        dictionaries.en[key] as string | undefined
      );
    }
  });

  it("does not leave reviewed English literals in presentation sources", () => {
    const files = [
      "src/dashboard/presentation/web/components/dashboard-scope-controls.tsx",
      "src/dashboard/presentation/web/components/dashboard-states.tsx",
      "src/dashboard/presentation/web/components/demo-copilot-preview-card.tsx",
      "src/dashboard/presentation/web/components/demo-executive-hero-card.tsx",
      "src/dashboard/presentation/web/components/insights-widget.tsx"
    ];
    const forbidden = [
      ">Tenant<",
      ">Business unit<",
      ">Apply<",
      ">Refresh<",
      ">Demo data<",
      ">Open demo<",
      ">Control Copilot<",
      "% confidence",
      '"▲ 8 today"',
      '"▼ 9 since lunch"',
      '"Score explanation"',
      'emptyLabel="No improved domains"',
      'emptyLabel="No deteriorated domains"',
      ">English</button>"
    ];
    const source = files
      .map((file) => readFileSync(resolve(process.cwd(), file), "utf8"))
      .join("\n");

    for (const literal of forbidden) {
      expect(source, literal).not.toContain(literal);
    }
  });
});
