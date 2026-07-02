import type { NextRequest } from "next/server";
import { createAISummaryModule } from "@/ai-summary";

/**
 * @swagger
 * /api/v1/ai-summary/latest:
 *   get:
 *     summary: Get latest executive summary
 *     description: Returns the latest persisted AI executive summary draft for the requested scope and optional summary type.
 *     tags:
 *       - AI Executive Summary
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
 *         name: summaryType
 *         schema:
 *           type: string
 *           enum: [DAILY, WEEKLY, MONTHLY, CUSTOM]
 *     responses:
 *       200:
 *         description: Latest executive summary
 */
export async function GET(request: NextRequest) {
  const { controller } = await createAISummaryModule();
  return controller.getLatestExecutiveSummary(request);
}
