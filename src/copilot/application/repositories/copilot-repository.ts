import type {
  CopilotContextSnapshot,
  CopilotMessage,
  CopilotSession
} from "@/copilot/domain";
import type { CopilotSessionStatus } from "@/copilot/domain/value-objects";

export type CopilotSessionReadScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type CopilotSessionReadQuery = CopilotSessionReadScope & {
  status?: CopilotSessionStatus;
  limit: number;
};

export interface CopilotRepository {
  saveSession(session: CopilotSession): Promise<void>;
  saveMessage(message: CopilotMessage): Promise<void>;
  saveContextSnapshot(contextSnapshot: CopilotContextSnapshot): Promise<void>;
  findSessions(query: CopilotSessionReadQuery): Promise<CopilotSession[]>;
  findSessionById(scope: CopilotSessionReadScope, id: string): Promise<CopilotSession | null>;
  findMessages(sessionId: string): Promise<CopilotMessage[]>;
}
