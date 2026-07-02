import type { Prediction } from "@/predictive/domain";
import type { PredictionType, PredictionWindow } from "@/predictive/domain/value-objects";

export type PredictionReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type PredictionReadQuery = PredictionReadScope & {
  predictionType?: PredictionType;
  predictionWindow?: PredictionWindow;
  limit: number;
};

export interface PredictionRepository {
  saveMany(predictions: Prediction[]): Promise<void>;
  findMany(query: PredictionReadQuery): Promise<Prediction[]>;
  findLatest(query: PredictionReadQuery): Promise<Prediction | null>;
  findById(scope: PredictionReadScope, id: string): Promise<Prediction | null>;
}
