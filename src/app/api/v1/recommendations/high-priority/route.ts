import type { NextRequest } from "next/server";
import { createRecommendationModule } from "@/recommendation";

/**
 * @swagger
 * /api/v1/recommendations/high-priority:
 *   get:
 *     summary: Get high priority executive recommendations
 *     description: Returns HIGH and CRITICAL deterministic recommendations for executive attention.
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
 *         description: High priority recommendations
 */
export async function GET(request: NextRequest) {
  const { controller } = await createRecommendationModule();
  return controller.getHighPriorityRecommendations(request);
}
