import type { NextRequest } from "next/server";
import { createDecisionModule } from "@/decision";

/**
 * @swagger
 * /api/v1/decisions/scenarios/generate:
 *   post:
 *     summary: Generate decision intelligence scenarios
 *     description: Generates and persists deterministic explainable decision scenarios using Analytics Context, Predictive, and Timeline as inputs.
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
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Generated decision scenarios
 */
export async function POST(request: NextRequest) {
  const { controller } = await createDecisionModule();
  return controller.generateDecisionScenarios(request);
}
