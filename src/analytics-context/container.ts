import { createClient } from "@/lib/supabase/server";
import { SupabaseDashboardReadRepository } from "@/dashboard/infrastructure/supabase";
import { DashboardRecommendationContextRepository } from "@/recommendation/infrastructure/dashboard";
import { RecommendationRuleEngine } from "@/recommendation/domain";
import { GetDashboardOverviewUseCase } from "@/dashboard/application";
import { GetRecommendationsUseCase } from "@/recommendation/application";
import { GetLatestExecutiveSummaryUseCase } from "@/ai-summary/application";
import { SupabaseExecutiveSummaryRepository } from "@/ai-summary/infrastructure/supabase";
import {
  GetIncidentsUseCase,
  GetNotificationsUseCase
} from "@/notification/application";
import {
  SupabaseIncidentRepository,
  SupabaseNotificationRepository
} from "@/notification/infrastructure/supabase";
import { SupabaseFraudRepository } from "@/repositories/supabase/supabase-fraud-repository";
import { SupabaseAuditRepository } from "@/audit";
import {
  GetAnalyticsContextUseCase,
  GetLatestAnalyticsContextUseCase
} from "@/analytics-context/application";
import { AnalyticsContextAggregator } from "@/analytics-context/domain";
import { ModuleAnalyticsContextSourceRepository } from "@/analytics-context/infrastructure/modules";
import { AnalyticsContextController } from "@/analytics-context/presentation/http";

export type AnalyticsContextModule = {
  controller: AnalyticsContextController;
};

export type AnalyticsContextApplicationServices = {
  getAnalyticsContextUseCase: GetAnalyticsContextUseCase;
  getLatestAnalyticsContextUseCase: GetLatestAnalyticsContextUseCase;
};

export async function createAnalyticsContextApplicationServices(): Promise<AnalyticsContextApplicationServices> {
  const supabase = await createClient();
  const dashboardReadRepository = new SupabaseDashboardReadRepository(supabase);
  const recommendationContextRepository = new DashboardRecommendationContextRepository(
    dashboardReadRepository
  );
  const recommendationRuleEngine = new RecommendationRuleEngine();
  const executiveSummaryRepository = new SupabaseExecutiveSummaryRepository(supabase);
  const incidentRepository = new SupabaseIncidentRepository(supabase);
  const notificationRepository = new SupabaseNotificationRepository(supabase);
  const analyticsContextSourceRepository = new ModuleAnalyticsContextSourceRepository({
    getDashboardOverviewUseCase: new GetDashboardOverviewUseCase({ dashboardReadRepository }),
    getRecommendationsUseCase: new GetRecommendationsUseCase({
      recommendationContextRepository,
      recommendationRuleEngine
    }),
    getLatestExecutiveSummaryUseCase: new GetLatestExecutiveSummaryUseCase({
      executiveSummaryRepository
    }),
    getIncidentsUseCase: new GetIncidentsUseCase({ incidentRepository }),
    getNotificationsUseCase: new GetNotificationsUseCase({ notificationRepository }),
    fraudRepository: new SupabaseFraudRepository(supabase),
    auditRepository: new SupabaseAuditRepository(supabase)
  });
  const useCaseDependencies = {
    analyticsContextSourceRepository,
    aggregator: new AnalyticsContextAggregator()
  };

  return {
    getAnalyticsContextUseCase: new GetAnalyticsContextUseCase(useCaseDependencies),
    getLatestAnalyticsContextUseCase: new GetLatestAnalyticsContextUseCase(useCaseDependencies)
  };
}

export async function createAnalyticsContextModule(): Promise<AnalyticsContextModule> {
  const services = await createAnalyticsContextApplicationServices();

  return {
    controller: new AnalyticsContextController({
      getAnalyticsContextUseCase: services.getAnalyticsContextUseCase,
      getLatestAnalyticsContextUseCase: services.getLatestAnalyticsContextUseCase
    })
  };
}
