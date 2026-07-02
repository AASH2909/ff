import type { NextRequest } from "next/server";
import { createNotificationModule } from "@/notification";

type IncidentRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/incidents/{id}/resolve:
 *   patch:
 *     summary: Resolve operational incident
 *     description: Marks an incident and its internal notifications as resolved.
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
 *         description: Resolved incident
 */
export async function PATCH(request: NextRequest, context: IncidentRouteContext) {
  const { controller } = await createNotificationModule();
  const { id } = await context.params;

  return controller.resolveIncident(request, id);
}
