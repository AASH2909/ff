export type DemoBadgeVariant =
  | "default"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "destructive"
  | "outline";

export type DemoStatusTone = "neutral" | "live" | "ready" | "rush" | "blocked";

export type DemoSurface = "background" | "surface";

export function getDemoDashboardData() {
 return {
  banner: {
    status: t("dashboard.demo.bannerStatus"),
    badges: [t("dashboard.demo.sampleRestaurant"), t("dashboard.demo.noProductionData")],
    description: t("dashboard.demo.bannerDescription"),
    scopeTitle: t("dashboard.demo.scopeNotSelected"),
    scopeDescription: t("dashboard.demo.modeActive")
  },
  demoScope: {
    restaurantLabel: t("dashboard.demo.restaurant"),
    restaurant: "Harbor & Pine",
    locationLabel: t("dashboard.demo.location"),
    location: t("dashboard.demo.locationValue")
  },
  restaurantContext: [
    { label: t("dashboard.demo.restaurant"), value: "Harbor & Pine" },
    { label: t("dashboard.demo.location"), value: t("dashboard.demo.locationValue") },
    { label: t("dashboard.demo.shift"), value: t("dashboard.demo.fridayDinner") },
    { label: t("dashboard.demo.serviceWindow"), value: "5:30 PM-10:30 PM" },
    { label: t("dashboard.demo.guestsSeated"), value: "218" },
    { label: t("dashboard.demo.activeStations"), value: "6" }
  ],
  executiveHero: {
    restaurantLabel: t("dashboard.restaurantHealth"),
    overallHealthLabel: t("dashboard.overallHealth"),
    overallHealth: t("dashboard.servicePressure"),
    scoreLabel: t("dashboard.controlScore"),
    riskLevelLabel: t("dashboard.riskLevel"),
    riskLevel: t("dashboard.moderateRisk"),
    dailyDeltaLabel: t("dashboard.dailyDelta"),
    dailyDelta: t("dashboard.demo.dailyDeltaValue", { delta: 9 }),
    lastUpdateLabel: t("dashboard.lastUpdate"),
    lastUpdate: "7:10 PM"
  },
  briefingSections: {
    keySignals: {
      title: t("dashboard.demo.attentionTitle"),
      description: t("dashboard.demo.attentionDescription")
    },
    recommendation: {
      title: t("dashboard.nextBestAction"),
      description: t("dashboard.demo.recommendationDescription")
    },
    evidence: {
      title: t("dashboard.demo.evidenceTitle"),
      description: t("dashboard.demo.evidenceDescription")
    },
    aiExplanation: {
      title: t("dashboard.askAi"),
      description: t("dashboard.demo.askDescription")
    }
  },
  executiveSummary: {
    description: t("dashboard.demo.summaryDescription"),
    badge: t("dashboard.demo.sample"),
    context: t("dashboard.demo.summaryContext"),
    signals: [
      t("dashboard.demo.summarySignalInventory"),
      t("dashboard.demo.summarySignalStaff"),
      t("dashboard.demo.summarySignalAction")
    ],
    facts: [
      { icon: "package", label: t("dashboard.demo.primaryRisk"), value: t("dashboard.demo.inventoryVariance") },
      { icon: "users", label: t("dashboard.demo.pressurePoint"), value: t("dashboard.demo.lineCoverage") },
      { icon: "decision", label: t("dashboard.demo.recommendedAction"), value: t("dashboard.demo.rebalanceShift") }
    ]
  },
  controlScore: {
    value: "64",
    numericValue: 64,
    status: t("dashboard.atRisk"),
    description: t("dashboard.demo.scoreDescription"),
    helper: t("dashboard.demo.scoreHelper"),
    coverageLabel: t("dashboard.demo.controlCoverage"),
    coverageValueLabel: "64 / 100",
    factors: [
      { label: t("dashboard.demo.inventory"), value: "51", tone: "blocked" },
      { label: t("dashboard.demo.staffing"), value: "58", tone: "rush" },
      { label: t("dashboard.demo.payments"), value: "86", tone: "ready" },
      { label: t("dashboard.demo.kitchenFlow"), value: "69", tone: "rush" }
    ]
  },
  metrics: [
    {
      label: t("dashboard.demo.predictedRisk"),
      value: "72%",
      helper: t("dashboard.demo.next90Driven"),
      badge: t("dashboard.demo.rising"),
      variant: "warning"
    },
    {
      label: t("dashboard.demo.staffLoad"),
      value: t("dashboard.demo.high"),
      helper: t("dashboard.demo.lineBelowPlan"),
      status: t("status.rush"),
      tone: "rush"
    },
    {
      label: t("dashboard.demo.inventoryRisk"),
      value: t("dashboard.demo.high"),
      helper: t("dashboard.demo.grillVariance"),
      badge: t("dashboard.demo.watch"),
      variant: "destructive"
    }
  ],
  attentionSignals: [
    {
      title: t("dashboard.demo.attentionInventoryTitle"),
      sentence: t("dashboard.demo.attentionInventoryText"),
      severity: t("dashboard.demo.high")
    },
    {
      title: t("dashboard.demo.attentionStaffTitle"),
      sentence: t("dashboard.demo.attentionStaffText"),
      severity: t("dashboard.demo.medium")
    },
    {
      title: t("dashboard.demo.attentionRefundTitle"),
      sentence: t("dashboard.demo.attentionRefundText"),
      severity: t("dashboard.demo.medium")
    }
  ],
  risks: [
    {
      title: t("dashboard.demo.riskInventoryTitle"),
      description: t("dashboard.demo.riskInventoryText"),
      severity: t("dashboard.demo.high"),
      progress: 82,
      variant: "destructive"
    },
    {
      title: t("dashboard.demo.riskCapacityTitle"),
      description: t("dashboard.demo.riskCapacityText"),
      severity: t("dashboard.demo.medium"),
      progress: 68,
      variant: "warning"
    },
    {
      title: t("dashboard.demo.riskRefundTitle"),
      description: t("dashboard.demo.riskRefundText"),
      severity: t("dashboard.demo.medium"),
      progress: 55,
      variant: "warning"
    }
  ],
  prediction: {
    description: t("dashboard.demo.next90"),
    probabilityLabel: t("dashboard.demo.disruptionRisk"),
    probability: 72,
    probabilityDisplay: "72%",
    explanation: t("dashboard.demo.forecastExplanation"),
    signals: [
      { label: t("dashboard.demo.demand"), value: t("dashboard.demo.abovePlan") },
      { label: t("dashboard.demo.coverage"), value: t("dashboard.demo.stationUncovered") },
      { label: t("dashboard.demo.prepVariance"), value: t("dashboard.demo.proteinDrifting") },
      { label: t("dashboard.demo.guestImpact"), value: t("dashboard.demo.waitTimesUp") }
    ]
  },
  timeline: [
    {
      time: "5:40 PM",
      label: t("dashboard.timeline.rushTitle"),
      detail: t("dashboard.timeline.rushText")
    },
    {
      time: "6:25 PM",
      label: t("dashboard.timeline.inventoryTitle"),
      detail: t("dashboard.timeline.inventoryText")
    },
    {
      time: "7:10 PM",
      label: t("dashboard.timeline.decisionTitle"),
      detail: t("dashboard.timeline.decisionText")
    }
  ],
  intelligenceJourney: [
    {
      label: t("dashboard.signal.risk"),
      explanation: t("dashboard.signal.riskText"),
      status: t("dashboard.signal.detected"),
      variant: "destructive"
    },
    {
      label: t("dashboard.signal.analytics"),
      explanation: t("dashboard.signal.analyticsText"),
      status: t("dashboard.signal.correlated"),
      variant: "secondary"
    },
    {
      label: t("dashboard.signal.prediction"),
      explanation: t("dashboard.signal.predictionText"),
      status: t("dashboard.signal.forecast"),
      variant: "warning"
    },
    {
      label: t("dashboard.signal.timeline"),
      explanation: t("dashboard.signal.timelineText"),
      status: t("dashboard.signal.matched"),
      variant: "outline"
    },
    {
      label: t("dashboard.signal.decision"),
      explanation: t("dashboard.signal.decisionText"),
      status: t("dashboard.signal.recommended"),
      variant: "success"
    },
    {
      label: t("dashboard.signal.copilot"),
      explanation: t("dashboard.signal.copilotText"),
      status: t("dashboard.signal.ready"),
      variant: "default"
    }
  ],
  recommendation: {
    title: t("demo.initialRecommendation"),
    reason: t("demo.initialHelper"),
    description: t("demo.initialDescription"),
    expectedImpact: t("dashboard.controlScorePoints"),
    confidence: 82,
    owner: t("dashboard.shiftLead"),
    ctaLabel: t("demo.startRebalance")
  },
  copilot: {
    description: t("dashboard.copilot.description"),
    transcript: [
      {
        role: "user",
        speaker: t("dashboard.copilot.user"),
        message: t("dashboard.copilot.questionScore"),
        variant: "outline",
        surface: "background"
      },
      {
        role: "copilot",
        speaker: t("dashboard.copilot.name"),
        message: t("dashboard.copilot.answerScore"),
        variant: "default",
        surface: "surface"
      },
      {
        role: "user",
        speaker: t("dashboard.copilot.user"),
        message: t("dashboard.copilot.questionFirst"),
        variant: "outline",
        surface: "background"
      },
      {
        role: "copilot",
        speaker: t("dashboard.copilot.name"),
        message: t("dashboard.copilot.answerFirst"),
        variant: "default",
        surface: "surface"
      }
    ],
    evidence: [
      t("dashboard.copilot.evidenceAnalytics"),
      t("dashboard.copilot.evidencePrediction"),
      t("dashboard.copilot.evidenceTimeline"),
      t("dashboard.copilot.evidenceDecision")
    ],
    confidence: 82
  }
} as const satisfies {
  banner: {
    status: string;
    badges: readonly string[];
    description: string;
    scopeTitle: string;
    scopeDescription: string;
  };
  demoScope: {
    restaurantLabel: string;
    restaurant: string;
    locationLabel: string;
    location: string;
  };
  restaurantContext: readonly { label: string; value: string }[];
  executiveHero: {
    restaurantLabel: string;
    overallHealthLabel: string;
    overallHealth: string;
    scoreLabel: string;
    riskLevelLabel: string;
    riskLevel: string;
    dailyDeltaLabel: string;
    dailyDelta: string;
    lastUpdateLabel: string;
    lastUpdate: string;
  };
  briefingSections: {
    keySignals: { title: string; description: string };
    recommendation: { title: string; description: string };
    evidence: { title: string; description: string };
    aiExplanation: { title: string; description: string };
  };
  executiveSummary: {
    description: string;
    badge: string;
    context: string;
    signals: readonly string[];
    facts: readonly { icon: "package" | "users" | "decision"; label: string; value: string }[];
  };
  controlScore: {
    value: string;
    numericValue: number;
    status: string;
    description: string;
    helper: string;
    coverageLabel: string;
    coverageValueLabel: string;
    factors: readonly { label: string; value: string; tone: DemoStatusTone }[];
  };
  metrics: readonly {
    label: string;
    value: string;
    helper: string;
    badge?: string;
    variant?: DemoBadgeVariant;
    status?: string;
    tone?: DemoStatusTone;
  }[];
  attentionSignals: readonly {
    title: string;
    sentence: string;
    severity: string;
  }[];
  risks: readonly {
    title: string;
    description: string;
    severity: string;
    progress: number;
    variant: DemoBadgeVariant;
  }[];
  prediction: {
    description: string;
    probabilityLabel: string;
    probability: number;
    probabilityDisplay: string;
    explanation: string;
    signals: readonly { label: string; value: string }[];
  };
  timeline: readonly { time: string; label: string; detail: string }[];
  intelligenceJourney: readonly {
    label: string;
    explanation: string;
    status: string;
    variant: DemoBadgeVariant;
  }[];
  recommendation: {
    title: string;
    reason: string;
    description: string;
    expectedImpact: string;
    confidence: number;
    owner: string;
    ctaLabel: string;
  };
  copilot: {
    description: string;
    transcript: readonly {
      role: "user" | "copilot";
      speaker: string;
      message: string;
      variant: DemoBadgeVariant;
      surface: DemoSurface;
    }[];
    evidence: readonly string[];
    confidence: number;
  };
};
}

export type DemoDashboardData = ReturnType<typeof getDemoDashboardData>;
import { t } from "@/localization";
