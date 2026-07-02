import type { NextRequest } from "next/server";
import { createCopilotModule } from "@/copilot";

/**
 * @swagger
 * /api/v1/copilot/ask:
 *   post:
 *     summary: Ask deterministic CONTROL OS copilot
 *     description: Classifies the question, reads approved internal context, persists the conversation, and returns a structured deterministic answer draft. No external AI provider is called.
 *     tags:
 *       - AI Copilot
 */
export async function POST(request: NextRequest) {
  const { controller } = await createCopilotModule();
  return controller.ask(request);
}
