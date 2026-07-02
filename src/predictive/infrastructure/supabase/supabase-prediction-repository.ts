import type { PostgrestError } from "@supabase/supabase-js";
import type {
  PredictionReadQuery,
  PredictionReadScope,
  PredictionRepository
} from "@/predictive/application";
import type { Prediction } from "@/predictive/domain";
import { sortPredictions } from "@/predictive/domain";
import type { AppSupabaseClient } from "@/lib/supabase/types";
import {
  mapPredictionFactorInsert,
  mapPredictionInsert,
  mapPredictionRow,
  mapPredictionScenarioInsert,
  type PredictionFactorRow,
  type PredictionRow,
  type PredictionScenarioRow
} from "@/predictive/infrastructure/supabase/supabase-prediction-mappers";

export class SupabasePredictionRepository implements PredictionRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  async saveMany(predictions: Prediction[]): Promise<void> {
    if (predictions.length === 0) {
      return;
    }

    const { error: predictionError } = await this.supabase
      .from("predictive_predictions")
      .upsert(predictions.map(mapPredictionInsert), { onConflict: "id" });

    this.throwIfSupabaseError(predictionError);

    const factors = predictions.flatMap((prediction) =>
      prediction.factors.map((factor) => mapPredictionFactorInsert(prediction, factor))
    );
    const scenarios = predictions.flatMap((prediction) =>
      prediction.scenarios.map((scenario) => mapPredictionScenarioInsert(prediction, scenario))
    );

    if (factors.length > 0) {
      const { error } = await this.supabase
        .from("predictive_prediction_factors")
        .upsert(factors, { onConflict: "id" });

      this.throwIfSupabaseError(error);
    }

    if (scenarios.length > 0) {
      const { error } = await this.supabase
        .from("predictive_prediction_scenarios")
        .upsert(scenarios, { onConflict: "id" });

      this.throwIfSupabaseError(error);
    }
  }

  async findMany(queryInput: PredictionReadQuery): Promise<Prediction[]> {
    let query = this.supabase
      .from("predictive_predictions")
      .select("*")
      .eq("tenant_id", queryInput.tenantId)
      .order("created_at", { ascending: false })
      .limit(queryInput.limit);

    if (queryInput.businessUnitId) {
      query = query.eq("business_unit_id", queryInput.businessUnitId);
    }

    if (queryInput.predictionType) {
      query = query.eq("prediction_type", queryInput.predictionType);
    }

    if (queryInput.predictionWindow) {
      query = query.eq("prediction_window", queryInput.predictionWindow);
    }

    const { data, error } = await query;

    this.throwIfSupabaseError(error);

    return this.hydratePredictionRows(data ?? []);
  }

  async findLatest(queryInput: PredictionReadQuery): Promise<Prediction | null> {
    const predictions = await this.findMany({
      ...queryInput,
      limit: Math.max(queryInput.limit, 10)
    });

    return sortPredictions(predictions)[0] ?? null;
  }

  async findById(scope: PredictionReadScope, id: string): Promise<Prediction | null> {
    let query = this.supabase
      .from("predictive_predictions")
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

    const [prediction] = await this.hydratePredictionRows([data]);

    return prediction ?? null;
  }

  private async hydratePredictionRows(rows: PredictionRow[]) {
    if (rows.length === 0) {
      return [];
    }

    const predictionIds = rows.map((row) => row.id);
    const [factorRows, scenarioRows] = await Promise.all([
      this.loadFactorRows(predictionIds),
      this.loadScenarioRows(predictionIds)
    ]);

    return rows.map((row) =>
      mapPredictionRow(
        row,
        factorRows.filter((factor) => factor.prediction_id === row.id),
        scenarioRows.filter((scenario) => scenario.prediction_id === row.id)
      )
    );
  }

  private async loadFactorRows(predictionIds: string[]): Promise<PredictionFactorRow[]> {
    const { data, error } = await this.supabase
      .from("predictive_prediction_factors")
      .select("*")
      .in("prediction_id", predictionIds)
      .order("created_at", { ascending: true });

    this.throwIfSupabaseError(error);

    return data ?? [];
  }

  private async loadScenarioRows(predictionIds: string[]): Promise<PredictionScenarioRow[]> {
    const { data, error } = await this.supabase
      .from("predictive_prediction_scenarios")
      .select("*")
      .in("prediction_id", predictionIds)
      .order("created_at", { ascending: true });

    this.throwIfSupabaseError(error);

    return data ?? [];
  }

  private throwIfSupabaseError(error: PostgrestError | null) {
    if (error) {
      throw new Error(error.message);
    }
  }
}
