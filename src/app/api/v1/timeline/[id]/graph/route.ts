import type { NextRequest } from "next/server";
import { createTimelineModule } from "@/timeline";

type TimelineGraphRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/timeline/{id}/graph:
 *   get:
 *     summary: Get causal graph around timeline entry
 *     description: Returns persisted causal links and neighboring entries for a timeline entry.
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
 *         description: Timeline causal graph
 */
export async function GET(request: NextRequest, context: TimelineGraphRouteContext) {
  const { controller } = await createTimelineModule();
  const { id } = await context.params;

  return controller.getTimelineGraph(request, id);
}
