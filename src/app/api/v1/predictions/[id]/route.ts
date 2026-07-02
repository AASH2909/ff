import type { NextRequest } from "next/server";
import { createPredictiveModule } from "@/predictive";

type PredictionRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/predictions/{id}:
 *   get:
 *     summary: Get prediction by id
 *     description: Resolves a deterministic prediction id against the latest Analytics Context for the requested scope.
 *     tags:
 *       - Predictive Analytics
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
 *       - in: query
 *         name: predictionWindow
 *         schema:
 *           type: string
 *           enum: [NEXT_7_DAYS, NEXT_30_DAYS, NEXT_90_DAYS]
 *     responses:
 *       200:
 *         description: Predictive analytics result
 */
export async function GET(request: NextRequest, context: PredictionRouteContext) {
  const { controller } = await createPredictiveModule();
  const { id } = await context.params;

  return controller.getPredictionById(request, id);
}
