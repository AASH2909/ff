import type { DecisionScenario } from "@/decision/domain";
import type { ScenarioType } from "@/decision/domain/value-objects";

export type DecisionScenarioReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type DecisionScenarioReadQuery = DecisionScenarioReadScope & {
  scenarioType?: ScenarioType;
  limit: number;
};

export interface DecisionScenarioRepository {
  saveMany(scenarios: DecisionScenario[]): Promise<void>;
  findMany(query: DecisionScenarioReadQuery): Promise<DecisionScenario[]>;
  findLatest(query: DecisionScenarioReadQuery): Promise<DecisionScenario | null>;
  findById(scope: DecisionScenarioReadScope, id: string): Promise<DecisionScenario | null>;
}
