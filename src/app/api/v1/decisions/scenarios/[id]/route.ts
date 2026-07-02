import type { NextRequest } from "next/server";
import { createDecisionModule } from "@/decision";

type DecisionScenarioRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/decisions/scenarios/{id}:
 *   get:
 *     summary: Get decision scenario by id
 *     description: Returns a persisted explainable decision scenario by id for the requested scope.
 *     tags:
 *       - Decision Intelligence
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-tenant-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessUnitId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Decision scenario
 */
export async function GET(request: NextRequest, context: DecisionScenarioRouteContext) {
  const { controller } = await createDecisionModule();
  const { id } = await context.params;

  return controller.getDecisionScenarioById(request, id);
}
