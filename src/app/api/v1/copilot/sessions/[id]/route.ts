import type { NextRequest } from "next/server";
import { createCopilotModule } from "@/copilot";

type CopilotSessionRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/copilot/sessions/{id}:
 *   get:
 *     summary: Get copilot session by id
 *     tags:
 *       - AI Copilot
 */
export async function GET(request: NextRequest, context: CopilotSessionRouteContext) {
  const { controller } = await createCopilotModule();
  const { id } = await context.params;

  return controller.getSessionById(request, id);
}
