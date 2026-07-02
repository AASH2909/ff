import type { NextRequest } from "next/server";
import { createAISummaryModule } from "@/ai-summary";

/**
 * @swagger
 * /api/v1/ai-summary/generate:
 *   post:
 *     summary: Generate deterministic executive summary draft
 *     description: Creates a structured executive summary draft from existing dashboard, Control Score, alert, explanation, and executive recommendation data. This endpoint does not call external AI providers.
 *     tags:
 *       - AI Executive Summary
 *     parameters:
 *       - in: header
 *         name: x-tenant-id
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-business-unit-id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               summaryType:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, CUSTOM]
 *               businessUnitId:
 *                 type: string
 *               periodStart:
 *                 type: string
 *                 format: date-time
 *               periodEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Generated executive summary draft
 */
export async function POST(request: NextRequest) {
  const { controller } = await createAISummaryModule();
  return controller.generateExecutiveSummary(request);
}
