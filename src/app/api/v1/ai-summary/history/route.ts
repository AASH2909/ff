import type { NextRequest } from "next/server";
import { createAISummaryModule } from "@/ai-summary";

/**
 * @swagger
 * /api/v1/ai-summary/history:
 *   get:
 *     summary: Get executive summary history
 *     description: Returns persisted AI executive summary drafts for a configurable date range.
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
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Executive summary history
 */
export async function GET(request: NextRequest) {
  const { controller } = await createAISummaryModule();
  return controller.getExecutiveSummaryHistory(request);
}
