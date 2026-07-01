import type { NextRequest } from "next/server";
import { createDashboardModule } from "@/dashboard";

/**
 * @swagger
 * /api/v1/dashboard/overview:
 *   get:
 *     summary: Get executive dashboard overview
 *     description: Returns the latest persisted Control Score, previous score, score difference, trend, status, domain contributions, drivers, alerts, and calculation timestamp.
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
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dashboard overview
 */
export async function GET(request: NextRequest) {
  const { controller } = await createDashboardModule();
  return controller.getOverview(request);
}
