import type { NextRequest } from "next/server";
import { createTimelineModule } from "@/timeline";

/**
 * @swagger
 * /api/v1/timeline:
 *   get:
 *     summary: Get executive causal timeline
 *     description: Builds and persists a causal explanation timeline from Analytics Context and existing Predictive outputs only.
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
 *         description: Executive timeline graph
 */
export async function GET(request: NextRequest) {
  const { controller } = await createTimelineModule();
  return controller.getTimeline(request);
}
