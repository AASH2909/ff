import type { NextRequest } from "next/server";
import { createPredictiveModule } from "@/predictive";

/**
 * @swagger
 * /api/v1/predictions/generate:
 *   post:
 *     summary: Generate deterministic predictive analytics
 *     description: Generates and persists explainable rule-based predictions using Analytics Context as the only input.
 *     tags:
 *       - Predictive Analytics
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
 *         name: predictionWindow
 *         schema:
 *           type: string
 *           enum: [NEXT_24_HOURS, NEXT_7_DAYS, NEXT_30_DAYS]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Generated predictive analytics results
 */
export async function POST(request: NextRequest) {
  const { controller } = await createPredictiveModule();
  return controller.generatePredictions(request);
}
