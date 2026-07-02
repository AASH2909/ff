import type { NextRequest } from "next/server";
import { createDecisionModule } from "@/decision";

/**
 * @swagger
 * /api/v1/decisions/scenarios:
 *   get:
 *     summary: Get decision intelligence scenarios
 *     description: Returns persisted explainable decision scenarios. Decision consumes Analytics Context, Predictive, and Timeline only; it does not call AI or create upstream business outputs.
 *     tags:
 *       - Decision Intelligence
 *     parameters:
 *       - in: header
 *         name: x-tenant-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessUnitId
 *         schema:
 *           type: string
 *       - in: query
 *         name: scenarioType
 *         schema:
 *           type: string
 *           enum: [RESOLVE_CRITICAL_INCIDENTS, EXECUTE_HIGH_PRIORITY_RECOMMENDATIONS, REDUCE_FRAUD_RISK, IMPROVE_INVENTORY_CONTROL, IMPROVE_OPERATIONS, STABILIZE_CONTROL_SCORE, MAINTAIN_STABLE_OPERATIONS]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Decision scenarios
 */
export async function GET(request: NextRequest) {
  const { controller } = await createDecisionModule();
  return controller.getDecisionScenarios(request);
}
