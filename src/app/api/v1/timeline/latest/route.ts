import type { NextRequest } from "next/server";
import { createTimelineModule } from "@/timeline";

/**
 * @swagger
 * /api/v1/timeline/latest:
 *   get:
 *     summary: Get latest executive causal timeline
 *     description: Builds and returns the latest causal explanation timeline from current Analytics Context and persisted Predictive outputs.
 *     tags:
 *       - Executive Timeline
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
 *         description: Latest executive timeline graph
 */
export async function GET(request: NextRequest) {
  const { controller } = await createTimelineModule();
  return controller.getLatestTimeline(request);
}
