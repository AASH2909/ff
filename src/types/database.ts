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
