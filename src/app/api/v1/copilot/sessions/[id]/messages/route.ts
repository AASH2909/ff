import type { NextRequest } from "next/server";
import { createCopilotModule } from "@/copilot";

type CopilotMessagesRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * @swagger
 * /api/v1/copilot/sessions/{id}/messages:
 *   get:
 *     summary: Get copilot session messages
 *     tags:
 *       - AI Copilot
 */
export async function GET(request: NextRequest, context: CopilotMessagesRouteContext) {
  const { controller } = await createCopilotModule();
  const { id } = await context.params;

  return controller.getMessages(request, id);
}
