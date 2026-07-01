import type { NextRequest } from "next/server";
import { createDashboardModule } from "@/dashboard";

/**
 * @swagger
 * /api/v1/dashboard/insights:
 *   get:
 *     summary: Get structured dashboard insights
 *     description: Explains score changes, improved domains, deteriorated domains, and executive risks using persisted Control Score explanation and domain records.
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
 *         description: Dashboard insights
 */
export async function GET(request: NextRequest) {
  const { controller } = await createDashboardModule();
  return controller.getInsights(request);
}
