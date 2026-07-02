import type { ApplicationError } from "@/application/result";
import type {
  IncidentByIdQueryDto,
  IncidentLifecycleCommandDto,
  IncidentQueryDto,
  NotificationQueryDto,
  NotificationScopeDto
} from "@/notification/application/dtos";
import {
  isIncidentSeverity,
  isNotificationChannel,
  isNotificationLifecycleStatus,
  type IncidentSeverity,
  type NotificationChannel,
  type NotificationLifecycleStatus
} from "@/notification/domain";

export const DEFAULT_INCIDENT_LIMIT = 25;
export const MAX_INCIDENT_LIMIT = 100;
export const DEFAULT_NOTIFICATION_LIMIT = 25;
export const MAX_NOTIFICATION_LIMIT = 100;

export type ValidatedNotificationScope = {
  tenantId: string;
  businessUnitId?: string;
};

export type ValidatedIncidentQuery = ValidatedNotificationScope & {
  status?: NotificationLifecycleStatus;
  severity?: IncidentSeverity;
  category?: string;
  limit: number;
};

export type ValidatedIncidentByIdQuery = ValidatedNotificationScope & {
  id: string;
};

export type ValidatedNotificationQuery = ValidatedNotificationScope & {
  status?: NotificationLifecycleStatus;
  channel?: NotificationChannel;
  incidentId?: string;
  limit: number;
};

export function validateNotificationScope(input: NotificationScopeDto): {
  value?: ValidatedNotificationScope;
  error?: ApplicationError;
} {
  if (!input || typeof input.tenantId !== "string" || input.tenantId.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Tenant id is required."
      }
    };
  }

  const businessUnitId = input.businessUnitId?.trim();

  return {
    value: {
      tenantId: input.tenantId.trim(),
      ...(businessUnitId ? { businessUnitId } : {})
    }
  };
}

export function validateIncidentQuery(input: IncidentQueryDto): {
  value?: ValidatedIncidentQuery;
  error?: ApplicationError;
} {
  const scope = validateNotificationScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  const status = parseStatus(input.status);

  if (status.error) {
    return { error: status.error };
  }

  const severity = parseSeverity(input.severity);

  if (severity.error) {
    return { error: severity.error };
  }

  const limit = validateLimit(input.limit, DEFAULT_INCIDENT_LIMIT, MAX_INCIDENT_LIMIT);

  if (limit.error || !limit.value) {
    return { error: limit.error };
  }

  const category = input.category?.trim();

  return {
    value: {
      ...scope.value,
      ...(status.value ? { status: status.value } : {}),
      ...(severity.value ? { severity: severity.value } : {}),
      ...(category ? { category } : {}),
      limit: limit.value
    }
  };
}

export function validateIncidentByIdQuery(
  input: IncidentByIdQueryDto | IncidentLifecycleCommandDto
): {
  value?: ValidatedIncidentByIdQuery;
  error?: ApplicationError;
} {
  const scope = validateNotificationScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  if (!input.id || input.id.trim().length === 0) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Incident id is required."
      }
    };
  }

  return {
    value: {
      ...scope.value,
      id: input.id.trim()
    }
  };
}

export function validateNotificationQuery(input: NotificationQueryDto): {
  value?: ValidatedNotificationQuery;
  error?: ApplicationError;
} {
  const scope = validateNotificationScope(input);

  if (scope.error || !scope.value) {
    return { error: scope.error };
  }

  const status = parseStatus(input.status);

  if (status.error) {
    return { error: status.error };
  }

  const channel = parseChannel(input.channel);

  if (channel.error) {
    return { error: channel.error };
  }

  const limit = validateLimit(input.limit, DEFAULT_NOTIFICATION_LIMIT, MAX_NOTIFICATION_LIMIT);

  if (limit.error || !limit.value) {
    return { error: limit.error };
  }

  const incidentId = input.incidentId?.trim();

  return {
    value: {
      ...scope.value,
      ...(status.value ? { status: status.value } : {}),
      ...(channel.value ? { channel: channel.value } : {}),
      ...(incidentId ? { incidentId } : {}),
      limit: limit.value
    }
  };
}

function parseStatus(
  value: string | undefined
): { value?: NotificationLifecycleStatus; error?: ApplicationError } {
  if (!value || value.trim().length === 0) {
    return {};
  }

  const normalized = value.trim().toUpperCase();

  if (isNotificationLifecycleStatus(normalized)) {
    return { value: normalized };
  }

  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Status must be NEW, PENDING, SENT, ACKNOWLEDGED, RESOLVED, or FAILED."
    }
  };
}

function parseSeverity(
  value: string | undefined
): { value?: IncidentSeverity; error?: ApplicationError } {
  if (!value || value.trim().length === 0) {
    return {};
  }

  const normalized = value.trim().toLowerCase();

  if (isIncidentSeverity(normalized)) {
    return { value: normalized };
  }

  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Severity must be information, warning, critical, or severe."
    }
  };
}

function parseChannel(
  value: string | undefined
): { value?: NotificationChannel; error?: ApplicationError } {
  if (!value || value.trim().length === 0) {
    return {};
  }

  const normalized = value.trim().toUpperCase();

  if (isNotificationChannel(normalized)) {
    return { value: normalized };
  }

  return {
    error: {
      code: "VALIDATION_ERROR",
      message: "Channel must be IN_APP, DASHBOARD, or API."
    }
  };
}

function validateLimit(
  value: number | undefined,
  defaultLimit: number,
  maxLimit: number
): { value?: number; error?: ApplicationError } {
  const limit = value ?? defaultLimit;

  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Limit must be an integer between 1 and ${maxLimit}.`
      }
    };
  }

  return { value: limit };
}
