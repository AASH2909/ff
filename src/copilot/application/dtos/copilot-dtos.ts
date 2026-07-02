import type {
  CopilotAnswerDraft,
  CopilotAnswerSource,
  CopilotContextSnapshot,
  CopilotMessage,
  CopilotMetadata,
  CopilotRecommendedAction,
  CopilotSession
} from "@/copilot/domain";
import type {
  CopilotIntent,
  CopilotMessageRole,
  CopilotSessionStatus
} from "@/copilot/domain/value-objects";
import type { AnalyticsContextDto } from "@/analytics-context/application";
import type { PredictionDto } from "@/predictive/application";
import type { TimelineEntryDto } from "@/timeline/application";
import type { DecisionScenarioDto } from "@/decision/application";

export type CopilotScopeDto = {
  tenantId: string;
  businessUnitId?: string;
};

export type AskCopilotCommandDto = CopilotScopeDto & {
  sessionId?: string;
  question: string;
  limit?: number;
  metadata?: CopilotMetadata;
};

export type CopilotSessionQueryDto = CopilotScopeDto & {
  status?: string;
  limit?: number;
};

export type CopilotSessionByIdQueryDto = CopilotScopeDto & {
  id: string;
};

export type CopilotMessagesQueryDto = CopilotScopeDto & {
  sessionId: string;
};

export type CopilotSessionDto = {
  id: string;
  tenantId: string;
  businessUnitId: string | null;
  status: CopilotSessionStatus;
  createdAt: string;
  updatedAt: string;
  metadata: CopilotMetadata;
};

export type CopilotMessageDto = {
  id: string;
  sessionId: string;
  role: CopilotMessageRole;
  content: string;
  intent: CopilotIntent;
  createdAt: string;
  metadata: CopilotMetadata;
};

export type CopilotAnswerDraftDto = {
  id: string;
  sessionId: string;
  intent: CopilotIntent;
  answer: string;
  confidence: number;
  sources: CopilotAnswerSource[];
  recommendedActions: CopilotRecommendedAction[];
  createdAt: string;
  metadata: CopilotMetadata;
};

export type CopilotContextSnapshotDto = {
  id: string;
  sessionId: string;
  analyticsContext: AnalyticsContextDto | null;
  predictions: PredictionDto[];
  timeline: TimelineEntryDto[];
  decisionScenarios: DecisionScenarioDto[];
  createdAt: string;
  metadata: CopilotMetadata;
};

export type AskCopilotOutputDto = {
  session: CopilotSessionDto;
  userMessage: CopilotMessageDto;
  assistantMessage: CopilotMessageDto;
  answerDraft: CopilotAnswerDraftDto;
  contextSnapshot: CopilotContextSnapshotDto;
};

export type CopilotSessionsOutputDto = {
  sessions: CopilotSessionDto[];
};

export type CopilotSessionOutputDto = {
  session: CopilotSessionDto;
};

export type CopilotMessagesOutputDto = {
  messages: CopilotMessageDto[];
};

export function toCopilotSessionDto(session: CopilotSession): CopilotSessionDto {
  return {
    id: session.id,
    tenantId: session.tenantId,
    businessUnitId: session.businessUnitId,
    status: session.status,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    metadata: session.metadata
  };
}

export function toCopilotMessageDto(message: CopilotMessage): CopilotMessageDto {
  return {
    id: message.id,
    sessionId: message.sessionId,
    role: message.role,
    content: message.content,
    intent: message.intent,
    createdAt: message.createdAt.toISOString(),
    metadata: message.metadata
  };
}

export function toCopilotAnswerDraftDto(
  answerDraft: CopilotAnswerDraft
): CopilotAnswerDraftDto {
  return {
    id: answerDraft.id,
    sessionId: answerDraft.sessionId,
    intent: answerDraft.intent,
    answer: answerDraft.answer,
    confidence: answerDraft.confidence,
    sources: answerDraft.sources,
    recommendedActions: answerDraft.recommendedActions,
    createdAt: answerDraft.createdAt.toISOString(),
    metadata: answerDraft.metadata
  };
}

export function toCopilotContextSnapshotDto(
  contextSnapshot: CopilotContextSnapshot
): CopilotContextSnapshotDto {
  return {
    id: contextSnapshot.id,
    sessionId: contextSnapshot.sessionId,
    analyticsContext: contextSnapshot.analyticsContext,
    predictions: contextSnapshot.predictions,
    timeline: contextSnapshot.timeline,
    decisionScenarios: contextSnapshot.decisionScenarios,
    createdAt: contextSnapshot.createdAt.toISOString(),
    metadata: contextSnapshot.metadata
  };
}
