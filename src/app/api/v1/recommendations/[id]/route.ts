import type { NextRequest } from "next/server";
import { createRecommendationModule } from "@/recommendation";

type RecommendationRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/recommendations/{id}:
 *   get:
 *     summary: Get executive recommendation by id
 *     description: Returns one deterministic recommendation for the current dashboard scope.
 *     tags:
 *       - Executive Recommendations
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
 *         description: Executive recommendation
 */
export async function GET(request: NextRequest, context: RecommendationRouteContext) {
  const { controller } = await createRecommendationModule();
  const { id } = await context.params;

  return controller.getRecommendationById(request, id);
}
