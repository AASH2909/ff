import type { NextRequest } from "next/server";
import { createNotificationModule } from "@/notification";

/**
 * @swagger
 * /api/v1/incidents:
 *   get:
 *     summary: Get operational incidents
 *     description: Returns incidents created by Notification Center from domain events.
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, PENDING, SENT, ACKNOWLEDGED, RESOLVED, FAILED]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [information, warning, critical, severe]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Operational incidents
 */
export async function GET(request: NextRequest) {
  const { controller } = await createNotificationModule();
  return controller.getIncidents(request);
}
