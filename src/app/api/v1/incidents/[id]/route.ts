import type { NextRequest } from "next/server";
import { createNotificationModule } from "@/notification";

type IncidentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/incidents/{id}:
 *   get:
 *     summary: Get operational incident by id
 *     description: Returns one incident created by Notification Center.
 *     tags:
 *       - Notification & Incident Center
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
 *         description: Operational incident
 */
export async function GET(request: NextRequest, context: IncidentRouteContext) {
  const { controller } = await createNotificationModule();
  const { id } = await context.params;

  return controller.getIncidentById(request, id);
}
