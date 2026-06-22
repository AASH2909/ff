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
        Update: never;
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
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
