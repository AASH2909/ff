import { createClient } from "@/lib/supabase/server";
import {
  GetControlScoreHistoryUseCase,
  GetDashboardAlertsUseCase,
  GetDashboardInsightsUseCase,
  GetDashboardOverviewUseCase,
  GetDomainBreakdownUseCase,
  GetLatestControlScoreUseCase
} from "@/dashboard/application";
import { SupabaseDashboardReadRepository } from "@/dashboard/infrastructure/supabase";
import { DashboardController } from "@/dashboard/presentation/http/dashboard-controller";

export type DashboardModule = {
  controller: DashboardController;
};

export async function createDashboardModule(): Promise<DashboardModule> {
  const supabase = await createClient();
  const dashboardReadRepository = new SupabaseDashboardReadRepository(supabase);

  return {
    controller: new DashboardController({
      getOverviewUseCase: new GetDashboardOverviewUseCase({ dashboardReadRepository }),
      getLatestControlScoreUseCase: new GetLatestControlScoreUseCase({ dashboardReadRepository }),
      getControlScoreHistoryUseCase: new GetControlScoreHistoryUseCase({
        dashboardReadRepository
      }),
      getDomainBreakdownUseCase: new GetDomainBreakdownUseCase({ dashboardReadRepository }),
      getDashboardAlertsUseCase: new GetDashboardAlertsUseCase({ dashboardReadRepository }),
      getDashboardInsightsUseCase: new GetDashboardInsightsUseCase({ dashboardReadRepository })
    })
  };
}
