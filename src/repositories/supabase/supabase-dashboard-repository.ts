import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DashboardOverview,
  DashboardRepository
} from "@/repositories/interfaces/dashboard-repository";
import type { Database } from "@/types/database";

export class SupabaseDashboardRepository implements DashboardRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getOverview(): Promise<DashboardOverview> {
    await this.supabase.auth.getSession();

    return {
      metrics: [
        {
          label: "Open orders",
          value: "24",
          helper: "8 waiting, 16 in progress",
          tone: "live"
        },
        {
          label: "Avg ticket time",
          value: "7m 18s",
          helper: "Target is under 8m",
          tone: "neutral"
        },
        {
          label: "Net sales",
          value: "$4,820",
          helper: "Current shift",
          tone: "ready"
        },
        {
          label: "Rush level",
          value: "High",
          helper: "Lunch wave active",
          tone: "rush"
        }
      ],
      queueStatuses: [
        {
          label: "Taking orders",
          tone: "live"
        },
        {
          label: "Kitchen rush",
          tone: "rush"
        },
        {
          label: "Pickup ready",
          tone: "ready"
        }
      ]
    };
  }
}
