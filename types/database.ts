export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      learning_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_level: string | null;
          weekly_hours: number | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_level?: string | null;
          weekly_hours?: number | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          target_level?: string | null;
          weekly_hours?: number | null;
          status?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
