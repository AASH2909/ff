import type { NextRequest } from "next/server";
import { createPredictiveModule } from "@/predictive";

/**
 * @swagger
 * /api/v1/predictions/latest:
 *   get:
 *     summary: Get latest highest-priority prediction
 *     description: Returns the highest-risk deterministic prediction from the latest Analytics Context.
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
 *         name: predictionType
 *         schema:
 *           type: string
 *           enum: [CONTROL_SCORE, FRAUD, OPERATIONS, INVENTORY, FINANCIAL]
 *       - in: query
 *         name: predictionWindow
 *         schema:
 *           type: string
 *           enum: [NEXT_7_DAYS, NEXT_30_DAYS, NEXT_90_DAYS]
 *     responses:
 *       200:
 *         description: Latest predictive analytics result
 */
export async function GET(request: NextRequest) {
  const { controller } = await createPredictiveModule();
  return controller.getLatestPrediction(request);
}
