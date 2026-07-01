import type { NextRequest } from "next/server";
import { createDashboardModule } from "@/dashboard";

/**
 * @swagger
 * /api/v1/dashboard/alerts:
 *   get:
 *     summary: Get active dashboard alerts
 *     description: Returns active dashboard alerts classified from persisted alerts, score explanations, and domain result metadata.
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
 *         description: Active alerts
 */
export async function GET(request: NextRequest) {
  const { controller } = await createDashboardModule();
  return controller.getAlerts(request);
}
