import type {
  ActionEffort,
  DecisionPriority,
  DecisionScenario,
  DecisionScenarioMetadata,
  ScenarioType
} from "@/decision/domain";

export type DecisionScenarioScopeDto = {
  tenantId: string;
  businessUnitId?: string;
};

export type DecisionScenarioQueryDto = DecisionScenarioScopeDto & {
  scenarioType?: string;
  limit?: number;
};

export type GenerateDecisionScenariosCommandDto = DecisionScenarioScopeDto & {
  limit?: number;
};

export type DecisionScenarioByIdQueryDto = DecisionScenarioScopeDto & {
  id: string;
};

export type DecisionImpactDto = {
  controlScoreDelta: number;
  riskLevelChange: string;
  estimatedTimeToImpact: string;
  affectedDomains: string[];
};

export type DecisionActionDto = {
  id: string;
  scenarioId: string;
  actionType: string;
  title: string;
  description: string;
  expectedEffect: string;
  effort: ActionEffort;
  priority: DecisionPriority;
};

export type DecisionScenarioDto = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  scenarioType: ScenarioType;
  title: string;
  description: string;
  estimatedImpact: DecisionImpactDto;
  confidence: number;
  assumptions: string[];
  risks: string[];
  actions: DecisionActionDto[];
  createdAt: string;
  metadata: DecisionScenarioMetadata;
};

export type DecisionScenariosOutputDto = {
  scenarios: DecisionScenarioDto[];
};

export type DecisionScenarioOutputDto = {
  scenario: DecisionScenarioDto;
};

export function toDecisionScenarioDto(scenario: DecisionScenario): DecisionScenarioDto {
  return {
    id: scenario.id,
    tenantId: scenario.tenantId,
    businessUnitId: scenario.businessUnitId,
    scenarioType: scenario.scenarioType,
    title: scenario.title,
    description: scenario.description,
    estimatedImpact: {
      controlScoreDelta: scenario.estimatedImpact.controlScoreDelta,
      riskLevelChange: scenario.estimatedImpact.riskLevelChange,
      estimatedTimeToImpact: scenario.estimatedImpact.estimatedTimeToImpact,
      affectedDomains: scenario.estimatedImpact.affectedDomains
    },
    confidence: scenario.confidence,
    assumptions: scenario.assumptions,
    risks: scenario.risks,
    actions: scenario.actions.map((action) => ({
      id: action.id,
      scenarioId: action.scenarioId,
      actionType: action.actionType,
      title: action.title,
      description: action.description,
      expectedEffect: action.expectedEffect,
      effort: action.effort,
      priority: action.priority
    })),
    createdAt: scenario.createdAt.toISOString(),
    metadata: scenario.metadata
  };
}
