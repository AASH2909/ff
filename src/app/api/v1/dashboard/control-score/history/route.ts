import type { NextRequest } from "next/server";
import { createDashboardModule } from "@/dashboard";

/**
 * @swagger
 * /api/v1/dashboard/control-score/history:
 *   get:
 *     summary: Get Control Score history
 *     description: Returns persisted Control Score trend points for a configurable date range.
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
 *         description: Control Score history
 */
export async function GET(request: NextRequest) {
  const { controller } = await createDashboardModule();
  return controller.getControlScoreHistory(request);
}
