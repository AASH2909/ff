import type { NextRequest } from "next/server";
import { createPredictiveModule } from "@/predictive";

/**
 * @swagger
 * /api/v1/predictions:
 *   get:
 *     summary: Get deterministic predictive analytics
 *     description: Returns persisted explainable rule-based predictions generated only from Analytics Context. No ML, external AI, or upstream business object generation is performed.
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
 *           enum: [CONTROL_SCORE, FRAUD_RISK, OPERATIONAL_RISK, INVENTORY_RISK, FINANCIAL_RISK, STAFF_RISK]
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
 *         description: Predictive analytics results
 */
export async function GET(request: NextRequest) {
  const { controller } = await createPredictiveModule();
  return controller.getPredictions(request);
}
