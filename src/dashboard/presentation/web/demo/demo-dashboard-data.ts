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

export const demoDashboardData = {
  banner: {
    status: "CONTROL OS Interactive Demo",
    badges: ["Sample restaurant", "No production data"],
    description:
      "This demo uses Harbor & Pine sample operations data. Real dashboard data appears after a restaurant scope is selected in the application shell.",
    scopeTitle: "Restaurant scope not selected",
    scopeDescription: "Demo mode is active."
  },
  demoScope: {
    restaurantLabel: "Restaurant",
    restaurant: "Harbor & Pine",
    locationLabel: "Location",
    location: "Downtown"
  },
  restaurantContext: [
    { label: "Restaurant", value: "Harbor & Pine" },
    { label: "Location", value: "Downtown" },
    { label: "Shift", value: "Friday dinner" },
    { label: "Service window", value: "5:30 PM-10:30 PM" },
    { label: "Guests seated", value: "218" },
    { label: "Active stations", value: "6" }
  ],
  executiveHero: {
    restaurantLabel: "Restaurant Health",
    overallHealthLabel: "Overall Health",
    overallHealth: "Service pressure building",
    scoreLabel: "Control Score",
    riskLevelLabel: "Risk Level",
    riskLevel: "Moderate Risk",
    dailyDeltaLabel: "Daily Delta",
    dailyDelta: "▼ 9 since lunch",
    lastUpdateLabel: "Last update",
    lastUpdate: "7:10 PM"
  },
  briefingSections: {
    keySignals: {
      title: "What needs attention",
      description: "The three signals that need attention now."
    },
    recommendation: {
      title: "Next Best Action",
      description: "The next operating move for this shift."
    },
    evidence: {
      title: "Why the system recommends this",
      description: "Supporting evidence behind the action."
    },
    aiExplanation: {
      title: "Ask AI",
      description: "Need more context? Ask Control Copilot."
    }
  },
  executiveSummary: {
    description:
      "Peak dinner pressure is building. CONTROL OS is linking inventory drift, staffing load, and late-shift demand into one recommended operating move.",
    badge: "Sample",
    context: "Harbor & Pine dinner service, Friday evening.",
    signals: [
      "Risk is concentrated in grill inventory",
      "Staff load is above plan",
      "Recommended action is shift rebalance before 7:15 PM"
    ],
    facts: [
      { icon: "package", label: "Primary risk", value: "Inventory variance" },
      { icon: "users", label: "Pressure point", value: "Line coverage" },
      { icon: "decision", label: "Recommended action", value: "Rebalance shift" }
    ]
  },
  controlScore: {
    value: "64",
    numericValue: 64,
    status: "At risk",
    description: "Demo projection for the active evening shift.",
    helper: "Down 9 points from the lunch baseline.",
    coverageLabel: "Control coverage",
    coverageValueLabel: "64 / 100",
    factors: [
      { label: "Inventory", value: "51", tone: "blocked" },
      { label: "Staffing", value: "58", tone: "rush" },
      { label: "Payments", value: "86", tone: "ready" },
      { label: "Kitchen flow", value: "69", tone: "rush" }
    ]
  },
  metrics: [
    {
      label: "Predicted Ops Risk",
      value: "72%",
      helper: "Next 90 minutes, driven by demand and prep variance.",
      badge: "Rising",
      variant: "warning"
    },
    {
      label: "Staff Load",
      value: "High",
      helper: "Line coverage is below the dinner rush plan.",
      status: "Rush",
      tone: "rush"
    },
    {
      label: "Inventory Risk",
      value: "High",
      helper: "Variance concentrated in grill proteins.",
      badge: "Watch",
      variant: "destructive"
    }
  ],
  attentionSignals: [
    {
      title: "Inventory variance",
      sentence: "Grill protein counts are drifting during dinner.",
      severity: "High"
    },
    {
      title: "Staffing pressure",
      sentence: "Line coverage is below plan while demand is up.",
      severity: "Medium"
    },
    {
      title: "Refund approvals",
      sentence: "High-value voids are clustering late in service.",
      severity: "Medium"
    }
  ],
  risks: [
    {
      title: "Inventory variance on grill proteins",
      description:
        "Steak and salmon counts are drifting from expected prep usage during the dinner rush.",
      severity: "High",
      progress: 82,
      variant: "destructive"
    },
    {
      title: "Line capacity under pressure",
      description:
        "Two cooks are covering three stations while order volume is 24% above the normal Friday curve.",
      severity: "Medium",
      progress: 68,
      variant: "warning"
    },
    {
      title: "Refund approvals need review",
      description: "Manager approvals are clustered around table transfers and late-course voids.",
      severity: "Medium",
      progress: 55,
      variant: "warning"
    }
  ],
  prediction: {
    description: "Next 90 minutes.",
    probabilityLabel: "Disruption risk",
    probability: 72,
    probabilityDisplay: "72%",
    explanation:
      "Risk rises after 7:30 PM if inventory checks and manager approvals compete with order recovery.",
    signals: [
      { label: "Demand", value: "24% above plan" },
      { label: "Coverage", value: "1 station uncovered" },
      { label: "Prep variance", value: "Protein counts drifting" },
      { label: "Guest impact", value: "Wait times trending up" }
    ]
  },
  timeline: [
    {
      time: "5:40 PM",
      label: "Dinner rush starts early",
      detail: "Walk-ins and online orders push kitchen load above plan."
    },
    {
      time: "6:25 PM",
      label: "Inventory signal detected",
      detail: "Protein usage outpaces completed tickets on two stations."
    },
    {
      time: "7:10 PM",
      label: "Decision point",
      detail: "Shift lead can rebalance prep and require approval on high-risk voids."
    }
  ],
  intelligenceJourney: [
    {
      label: "Risk Signal",
      explanation: "Grill inventory variance is rising during the dinner rush.",
      status: "Detected",
      variant: "destructive"
    },
    {
      label: "Analytics Context",
      explanation: "Demand is 24% above plan while line coverage is below target.",
      status: "Correlated",
      variant: "secondary"
    },
    {
      label: "Prediction",
      explanation: "Late-shift disruption risk reaches 72% if the team does not intervene.",
      status: "Forecast",
      variant: "warning"
    },
    {
      label: "Timeline",
      explanation: "A similar pressure pattern appeared earlier in the week.",
      status: "Matched",
      variant: "outline"
    },
    {
      label: "Decision",
      explanation: "Rebalance the shift before 7:15 PM to stabilize service.",
      status: "Recommended",
      variant: "success"
    },
    {
      label: "Copilot",
      explanation: "Explains why the score is dropping and what to do next.",
      status: "Ready",
      variant: "default"
    }
  ],
  recommendation: {
    title: "Rebalance the shift before 7:15 PM",
    reason:
      "Demand is above plan while grill inventory variance and staff load are both elevated.",
    description:
      "Move one cross-trained server to expo, verify grill protein counts, and require approval for high-value voids until close.",
    expectedImpact: "+8 Control Score points",
    confidence: 82,
    owner: "Shift lead",
    ctaLabel: "Start shift rebalance"
  },
  copilot: {
    description: "Ask Control Copilot for the reasoning behind this action.",
    transcript: [
      {
        speaker: "User",
        message: "Why is the score dropping?",
        variant: "outline",
        surface: "background"
      },
      {
        speaker: "Copilot",
        message:
          "The score is falling because dinner demand is rising while grill inventory variance and staff load are both elevated.",
        variant: "default",
        surface: "surface"
      },
      {
        speaker: "User",
        message: "What should I do first?",
        variant: "outline",
        surface: "background"
      },
      {
        speaker: "Copilot",
        message:
          "Rebalance the shift before 7:15 PM, verify protein counts, and tighten manager approvals for high-value voids.",
        variant: "default",
        surface: "surface"
      }
    ],
    evidence: [
      "Analytics Context",
      "Prediction 72%",
      "Timeline Pattern",
      "Decision Scenario"
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
      speaker: "User" | "Copilot";
      message: string;
      variant: DemoBadgeVariant;
      surface: DemoSurface;
    }[];
    evidence: readonly string[];
    confidence: number;
  };
};
