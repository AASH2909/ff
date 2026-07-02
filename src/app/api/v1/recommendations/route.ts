import type { NextRequest } from "next/server";
import { createRecommendationModule } from "@/recommendation";

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: Get executive recommendations
 *     description: Returns deterministic executive recommendations generated from existing dashboard, control score, explanation, fraud alert and audit source data.
 *     tags:
 *       - Executive Recommendations
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
 *         description: Executive recommendations
 */
export async function GET(request: NextRequest) {
  const { controller } = await createRecommendationModule();
  return controller.getRecommendations(request);
}
