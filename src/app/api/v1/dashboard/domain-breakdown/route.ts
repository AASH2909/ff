import type { NextRequest } from "next/server";
import { createDashboardModule } from "@/dashboard";

/**
 * @swagger
 * /api/v1/dashboard/domain-breakdown:
 *   get:
 *     summary: Get Control Score domain breakdown
 *     description: Returns persisted domain scores, weights, contributions, trends, and ranking.
 *     tags:
 *       - Dashboard Intelligence
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
 *     responses:
 *       200:
 *         description: Domain score breakdown
 */
export async function GET(request: NextRequest) {
  const { controller } = await createDashboardModule();
  return controller.getDomainBreakdown(request);
}
