import type { PostgrestError } from "@supabase/supabase-js";
import type {
  DecisionScenarioReadQuery,
  DecisionScenarioReadScope,
  DecisionScenarioRepository
} from "@/decision/application";
import type { DecisionScenario } from "@/decision/domain";
import { sortDecisionScenarios } from "@/decision/domain";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import {
  mapDecisionActionInsert,
  mapDecisionScenarioInsert,
  mapDecisionScenarioRow,
  type DecisionActionRow,
  type DecisionScenarioRow
} from "@/decision/infrastructure/supabase/supabase-decision-mappers";

export class SupabaseDecisionScenarioRepository implements DecisionScenarioRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async saveMany(scenarios: DecisionScenario[]): Promise<void> {
    if (scenarios.length === 0) {
      return;
    }

    const { error: scenarioError } = await this.supabase
      .from("decision_scenarios")
      .upsert(scenarios.map(mapDecisionScenarioInsert), { onConflict: "id" });

    this.throwIfSupabaseError(scenarioError);

    const actions = scenarios.flatMap((scenario) =>
      scenario.actions.map((action, index) => mapDecisionActionInsert(scenario, action, index))
    );

    if (actions.length === 0) {
      return;
    }

    const { error: actionError } = await this.supabase
      .from("decision_actions")
      .upsert(actions, { onConflict: "id" });

    this.throwIfSupabaseError(actionError);
  }

  async findMany(queryInput: DecisionScenarioReadQuery): Promise<DecisionScenario[]> {
    let query = this.supabase
      .from("decision_scenarios")
      .select("*")
      .eq("tenant_id", queryInput.tenantId)
      .order("created_at", { ascending: false })
      .limit(queryInput.limit);

    if (queryInput.businessUnitId) {
      query = query.eq("business_unit_id", queryInput.businessUnitId);
    }

    if (queryInput.scenarioType) {
      query = query.eq("scenario_type", queryInput.scenarioType);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return sortDecisionScenarios(await this.hydrateScenarioRows(data ?? []));
  }

  async findLatest(queryInput: DecisionScenarioReadQuery): Promise<DecisionScenario | null> {
    const scenarios = await this.findMany({
      ...queryInput,
      limit: Math.max(queryInput.limit, 10)
    });

    return sortDecisionScenarios(scenarios)[0] ?? null;
  }

  async findById(
    scope: DecisionScenarioReadScope,
    id: string
  ): Promise<DecisionScenario | null> {
    let query = this.supabase
      .from("decision_scenarios")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("id", id)
      .limit(1);

    if (scope.businessUnitId) {
      query = query.eq("business_unit_id", scope.businessUnitId);
    }

    const { data, error } = await query.maybeSingle();

    this.throwIfSupabaseError(error);

    if (!data) {
      return null;
    }

    const [scenario] = await this.hydrateScenarioRows([data]);

    return scenario ?? null;
  }

  private async hydrateScenarioRows(rows: DecisionScenarioRow[]) {
    if (rows.length === 0) {
      return [];
    }

    const scenarioIds = rows.map((row) => row.id);
    const actionRows = await this.loadActionRows(scenarioIds);

    return rows.map((row) =>
      mapDecisionScenarioRow(
        row,
        actionRows.filter((action) => action.scenario_id === row.id)
      )
    );
  }

  private async loadActionRows(scenarioIds: string[]): Promise<DecisionActionRow[]> {
    const { data, error } = await this.supabase
      .from("decision_actions")
      .select("*")
      .in("scenario_id", scenarioIds)
      .order("action_order", { ascending: true });

    this.throwIfSupabaseError(error);

    return data ?? [];
  }

  private throwIfSupabaseError(error: PostgrestError | null) {
    if (error) {
      throw new Error(error.message);
    }
  }
}
