import type { NextRequest } from "next/server";
import { createCopilotModule } from "@/copilot";

/**
 * @swagger
 * /api/v1/copilot/sessions:
 *   get:
 *     summary: Get copilot sessions
 *     tags:
 *       - AI Copilot
 */
export async function GET(request: NextRequest) {
  const { controller } = await createCopilotModule();
  return controller.getSessions(request);
}
