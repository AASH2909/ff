import type { NextRequest } from "next/server";
import { createAnalyticsContextModule } from "@/analytics-context";

/**
 * @swagger
 * /api/v1/analytics/context:
 *   get:
 *     summary: Get unified analytics context
 *     description: Aggregates existing Dashboard, Recommendation, AI Summary, Notification, Fraud, and Audit outputs without recalculating or generating upstream business data.
 *     tags:
 *       - Analytics Context
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
 *         description: Unified analytics context
 */
export async function GET(request: NextRequest) {
  const { controller } = await createAnalyticsContextModule();
  return controller.getContext(request);
}
