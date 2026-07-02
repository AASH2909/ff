export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ai_executive_summaries: {
        Row: {
          id: string;
          tenant_id: string;
          business_unit_id: string | null;
          period_start: string;
          period_end: string;
          summary_type: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
          status: "DRAFT" | "READY" | "FAILED";
          headline: string;
          overall_assessment: string;
          key_positive_signals: Json;
          key_negative_signals: Json;
          critical_risks: Json;
          recommended_actions: Json;
          confidence: number;
          source_modules: Json;
          generated_at: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          business_unit_id?: string | null;
          period_start: string;
          period_end: string;
          summary_type: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
          status?: "DRAFT" | "READY" | "FAILED";
          headline: string;
          overall_assessment: string;
          key_positive_signals?: Json;
          key_negative_signals?: Json;
          critical_risks?: Json;
          recommended_actions?: Json;
          confidence: number;
          source_modules?: Json;
          generated_at: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          business_unit_id?: string | null;
          period_start?: string;
          period_end?: string;
          summary_type?: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
          status?: "DRAFT" | "READY" | "FAILED";
          headline?: string;
          overall_assessment?: string;
          key_positive_signals?: Json;
          key_negative_signals?: Json;
          critical_risks?: Json;
          recommended_actions?: Json;
          confidence?: number;
          source_modules?: Json;
          generated_at?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          tenant_id: string;
          business_unit_id: string | null;
          severity: "information" | "warning" | "critical" | "severe";
          status: "NEW" | "PENDING" | "SENT" | "ACKNOWLEDGED" | "RESOLVED" | "FAILED";
          title: string;
          description: string;
          source_event: string;
          source_event_id: string;
          category: string;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          metadata: Json;
        };
        Insert: {
          id: string;
          tenant_id: string;
          business_unit_id?: string | null;
          severity: "information" | "warning" | "critical" | "severe";
          status?: "NEW" | "PENDING" | "SENT" | "ACKNOWLEDGED" | "RESOLVED" | "FAILED";
          title: string;
          description: string;
          source_event: string;
          source_event_id: string;
          category: string;
          created_at: string;
          updated_at: string;
          resolved_at?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          business_unit_id?: string | null;
          severity?: "information" | "warning" | "critical" | "severe";
          status?: "NEW" | "PENDING" | "SENT" | "ACKNOWLEDGED" | "RESOLVED" | "FAILED";
          title?: string;
          description?: string;
          source_event?: string;
          source_event_id?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
          resolved_at?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          tenant_id: string;
          business_unit_id: string | null;
          incident_id: string;
          recipient_type: "EXECUTIVE" | "OPERATIONS" | "CONTROL_CENTER";
          channel: "IN_APP" | "DASHBOARD" | "API";
          status: "NEW" | "PENDING" | "SENT" | "ACKNOWLEDGED" | "RESOLVED" | "FAILED";
          priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          created_at: string;
          sent_at: string | null;
          acknowledged_at: string | null;
          metadata: Json;
        };
        Insert: {
          id: string;
          tenant_id: string;
          business_unit_id?: string | null;
          incident_id: string;
          recipient_type: "EXECUTIVE" | "OPERATIONS" | "CONTROL_CENTER";
          channel: "IN_APP" | "DASHBOARD" | "API";
          status?: "NEW" | "PENDING" | "SENT" | "ACKNOWLEDGED" | "RESOLVED" | "FAILED";
          priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          created_at: string;
          sent_at?: string | null;
          acknowledged_at?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          business_unit_id?: string | null;
          incident_id?: string;
          recipient_type?: "EXECUTIVE" | "OPERATIONS" | "CONTROL_CENTER";
          channel?: "IN_APP" | "DASHBOARD" | "API";
          status?: "NEW" | "PENDING" | "SENT" | "ACKNOWLEDGED" | "RESOLVED" | "FAILED";
          priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          created_at?: string;
          sent_at?: string | null;
          acknowledged_at?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      predictive_predictions: {
        Row: {
          id: string;
          tenant_id: string;
          business_unit_id: string | null;
          prediction_type:
            | "CONTROL_SCORE"
            | "FRAUD_RISK"
            | "OPERATIONAL_RISK"
            | "INVENTORY_RISK"
            | "FINANCIAL_RISK"
            | "STAFF_RISK";
          prediction_window: "NEXT_24_HOURS" | "NEXT_7_DAYS" | "NEXT_30_DAYS";
          risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          trend: "IMPROVING" | "STABLE" | "DECLINING" | "UNKNOWN";
          confidence: number;
          summary: string;
          predicted_control_score: number | null;
          created_at: string;
          metadata: Json;
        };
        Insert: {
          id: string;
          tenant_id: string;
          business_unit_id?: string | null;
          prediction_type:
            | "CONTROL_SCORE"
            | "FRAUD_RISK"
            | "OPERATIONAL_RISK"
            | "INVENTORY_RISK"
            | "FINANCIAL_RISK"
            | "STAFF_RISK";
          prediction_window: "NEXT_24_HOURS" | "NEXT_7_DAYS" | "NEXT_30_DAYS";
          risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          trend: "IMPROVING" | "STABLE" | "DECLINING" | "UNKNOWN";
          confidence: number;
          summary: string;
          predicted_control_score?: number | null;
          created_at: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          business_unit_id?: string | null;
          prediction_type?:
            | "CONTROL_SCORE"
            | "FRAUD_RISK"
            | "OPERATIONAL_RISK"
            | "INVENTORY_RISK"
            | "FINANCIAL_RISK"
            | "STAFF_RISK";
          prediction_window?: "NEXT_24_HOURS" | "NEXT_7_DAYS" | "NEXT_30_DAYS";
          risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          trend?: "IMPROVING" | "STABLE" | "DECLINING" | "UNKNOWN";
          confidence?: number;
          summary?: string;
          predicted_control_score?: number | null;
          created_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      predictive_prediction_factors: {
        Row: {
          id: string;
          tenant_id: string;
          business_unit_id: string | null;
          prediction_id: string;
          factor_type: string;
          source: string;
          title: string;
          description: string;
          impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          weight: number;
          direction: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
          evidence: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          business_unit_id?: string | null;
          prediction_id: string;
          factor_type: string;
          source: string;
          title: string;
          description: string;
          impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          weight: number;
          direction: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
          evidence?: Json;
          created_at: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          business_unit_id?: string | null;
          prediction_id?: string;
          factor_type?: string;
          source?: string;
          title?: string;
          description?: string;
          impact?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          weight?: number;
          direction?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
          evidence?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      predictive_prediction_scenarios: {
        Row: {
          id: string;
          tenant_id: string;
          business_unit_id: string | null;
          prediction_id: string;
          scenario_type: string;
          title: string;
          description: string;
          expected_impact: string;
          confidence: number;
          assumptions: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          business_unit_id?: string | null;
          prediction_id: string;
          scenario_type: string;
          title: string;
          description: string;
          expected_impact: string;
          confidence: number;
          assumptions?: Json;
          created_at: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          business_unit_id?: string | null;
          prediction_id?: string;
          scenario_type?: string;
          title?: string;
          description?: string;
          expected_impact?: string;
          confidence?: number;
          assumptions?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          actor_type: string;
          actor_display_name: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          outcome: string;
          occurred_at: string;
          previous_value: Json | null;
          new_value: Json | null;
          reason: string | null;
          metadata: Json | null;
          ip_address: string | null;
          forwarded_for: string | null;
          user_agent: string | null;
          device_info: string | null;
          correlation_id: string | null;
          causation_id: string | null;
          request_id: string | null;
          session_id: string | null;
          source: string | null;
          sensitivity: string;
          hash: string | null;
          hash_algorithm: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          user_id: string;
          actor_type?: string;
          actor_display_name?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          outcome?: string;
          occurred_at: string;
          previous_value?: Json | null;
          new_value?: Json | null;
          reason?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          forwarded_for?: string | null;
          user_agent?: string | null;
          device_info?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          request_id?: string | null;
          session_id?: string | null;
          source?: string | null;
          sensitivity?: string;
          hash?: string | null;
          hash_algorithm?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          actor_type?: string;
          actor_display_name?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          outcome?: string;
          occurred_at?: string;
          previous_value?: Json | null;
          new_value?: Json | null;
          reason?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          forwarded_for?: string | null;
          user_agent?: string | null;
          device_info?: string | null;
          correlation_id?: string | null;
          causation_id?: string | null;
          request_id?: string | null;
          session_id?: string | null;
          source?: string | null;
          sensitivity?: string;
          hash?: string | null;
          hash_algorithm?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      control_scores: {
        Row: {
          id: string;
          tenant_id: string;
          business_unit_id: string;
          business_unit_name: string | null;
          score: number;
          status: string;
          period_start: string;
          period_end: string;
          calculated_at: string;
          source_version: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          business_unit_id: string;
          business_unit_name?: string | null;
          score: number;
          status: string;
          period_start: string;
          period_end: string;
          calculated_at?: string;
          source_version?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          business_unit_id?: string;
          business_unit_name?: string | null;
          score?: number;
          status?: string;
          period_start?: string;
          period_end?: string;
          calculated_at?: string;
          source_version?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      control_score_domain_scores: {
        Row: {
          id: string;
          tenant_id: string;
          control_score_id: string;
          domain_code: string;
          domain_name: string;
          score: number;
          weight: number;
          contribution: number;
          period_start: string;
          period_end: string;
          calculated_at: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          control_score_id: string;
          domain_code: string;
          domain_name: string;
          score: number;
          weight: number;
          contribution: number;
          period_start: string;
          period_end: string;
          calculated_at?: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          control_score_id?: string;
          domain_code?: string;
          domain_name?: string;
          score?: number;
          weight?: number;
          contribution?: number;
          period_start?: string;
          period_end?: string;
          calculated_at?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      control_score_explanations: {
        Row: {
          id: string;
          tenant_id: string;
          control_score_id: string;
          domain_code: string | null;
          metric_code: string | null;
          metric_name: string | null;
          driver_type: string | null;
          contribution: number;
          severity: string;
          explanation: string;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          control_score_id: string;
          domain_code?: string | null;
          metric_code?: string | null;
          metric_name?: string | null;
          driver_type?: string | null;
          contribution?: number;
          severity?: string;
          explanation: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          control_score_id?: string;
          domain_code?: string | null;
          metric_code?: string | null;
          metric_name?: string | null;
          driver_type?: string | null;
          contribution?: number;
          severity?: string;
          explanation?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      dashboard_alerts: {
        Row: {
          id: string;
          tenant_id: string;
          business_unit_id: string | null;
          severity: string;
          status: string;
          title: string;
          message: string;
          source: string;
          domain_code: string | null;
          metric_code: string | null;
          resource_type: string | null;
          resource_id: string | null;
          occurred_at: string;
          resolved_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          business_unit_id?: string | null;
          severity: string;
          status?: string;
          title: string;
          message: string;
          source?: string;
          domain_code?: string | null;
          metric_code?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          occurred_at: string;
          resolved_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          business_unit_id?: string | null;
          severity?: string;
          status?: string;
          title?: string;
          message?: string;
          source?: string;
          domain_code?: string | null;
          metric_code?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          occurred_at?: string;
          resolved_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fraud_alerts: {
        Row: {
          id: string;
          tenant_id: string;
          alert_id: string;
          incident_id: string;
          severity: string;
          alert_type: string;
          recipient_type: string;
          status: string;
          action_required: string | null;
          generated_at: string;
          acknowledged_at: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          alert_id: string;
          incident_id: string;
          severity: string;
          alert_type: string;
          recipient_type: string;
          status?: string;
          action_required?: string | null;
          generated_at: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          alert_id?: string;
          incident_id?: string;
          severity?: string;
          alert_type?: string;
          recipient_type?: string;
          status?: string;
          action_required?: string | null;
          generated_at?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role_id: string;
          assigned_at: string;
          assigned_by: string | null;
        };
        Insert: {
          user_id: string;
          role_id: string;
          assigned_at?: string;
          assigned_by?: string | null;
        };
        Update: {
          user_id?: string;
          role_id?: string;
          assigned_at?: string;
          assigned_by?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
