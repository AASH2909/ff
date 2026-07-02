import type { NextRequest } from "next/server";
import { createAISummaryModule } from "@/ai-summary";

type AISummaryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/ai-summary/{id}:
 *   get:
 *     summary: Get executive summary by id
 *     description: Returns one persisted AI executive summary draft by id for the requested tenant scope.
 *     tags:
 *       - AI Executive Summary
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
 *         description: Executive summary
 */
export async function GET(request: NextRequest, context: AISummaryRouteContext) {
  const { controller } = await createAISummaryModule();
  const { id } = await context.params;

  return controller.getExecutiveSummaryById(request, id);
}
