import type { NextRequest } from "next/server";
import { createNotificationModule } from "@/notification";

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get internal notifications
 *     description: Returns internal IN_APP, DASHBOARD, and API notifications created from incidents.
 *     tags:
 *       - Notification & Incident Center
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
 *         name: incidentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, PENDING, SENT, ACKNOWLEDGED, RESOLVED, FAILED]
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *           enum: [IN_APP, DASHBOARD, API]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Internal notifications
 */
export async function GET(request: NextRequest) {
  const { controller } = await createNotificationModule();
  return controller.getNotifications(request);
}
