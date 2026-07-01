import type { NextRequest } from "next/server";
import { createDashboardModule } from "@/dashboard";

/**
 * @swagger
 * /api/v1/dashboard/control-score/latest:
 *   get:
 *     summary: Get latest Control Score
 *     description: Returns the latest persisted Control Score for the dashboard scope without recalculating score logic.
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
 *         description: Latest Control Score
 */
export async function GET(request: NextRequest) {
  const { controller } = await createDashboardModule();
  return controller.getLatestControlScore(request);
}
