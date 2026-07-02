import type { NextRequest } from "next/server";
import { createDecisionModule } from "@/decision";

/**
 * @swagger
 * /api/v1/decisions/scenarios/latest:
 *   get:
 *     summary: Get latest highest-priority decision scenario
 *     description: Returns the highest-priority persisted decision scenario for the requested scope.
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
 *     responses:
 *       200:
 *         description: Latest decision scenario
 */
export async function GET(request: NextRequest) {
  const { controller } = await createDecisionModule();
  return controller.getLatestDecisionScenario(request);
}
