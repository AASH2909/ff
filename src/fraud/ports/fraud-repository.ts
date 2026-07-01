import type { FraudIncident } from "@/fraud/entities/fraud-incident";

export interface FraudRepository {
  /**
   * Save a new fraud incident
   */
  save(incident: FraudIncident): Promise<void>;

  /**
   * Find fraud incident by ID
   */
  findById(id: string, tenantId: string): Promise<FraudIncident | null>;

  /**
   * Find all fraud incidents for a tenant
   */
  findByTenant(
    tenantId: string,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<FraudIncident[]>;

  /**
   * Find fraud incidents by order
   */
  findByOrder(orderId: string, tenantId: string): Promise<FraudIncident[]>;

  /**
   * Find fraud incidents by employee
   */
  findByEmployee(employeeId: string, tenantId: string): Promise<FraudIncident[]>;

  /**
   * Find fraud incidents by location
   */
  findByLocation(locationId: string, tenantId: string): Promise<FraudIncident[]>;

  /**
   * Find fraud incidents by shift
   */
  findByShift(shiftId: string, tenantId: string): Promise<FraudIncident[]>;

  /**
   * Update existing fraud incident
   */
  update(incident: FraudIncident): Promise<void>;

  /**
   * Count total fraud incidents
   */
  count(
    tenantId: string,
    filters?: {
      status?: string;
      severity?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<number>;

  /**
   * Get fraud statistics for tenant
   */
  getStatistics(
    tenantId: string,
    timeWindowDays?: number
  ): Promise<{
    totalIncidents: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
    averageRiskScore: number;
    criticalCount: number;
  }>;
}
