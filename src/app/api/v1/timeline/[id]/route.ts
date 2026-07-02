import type { NextRequest } from "next/server";
import { createTimelineModule } from "@/timeline";

type TimelineEntryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/timeline/{id}:
 *   get:
 *     summary: Get timeline entry by id
 *     description: Returns one persisted causal timeline entry.
 *     tags:
 *       - Executive Timeline
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
 *         description: Timeline entry
 */
export async function GET(request: NextRequest, context: TimelineEntryRouteContext) {
  const { controller } = await createTimelineModule();
  const { id } = await context.params;

  return controller.getTimelineEntry(request, id);
}
