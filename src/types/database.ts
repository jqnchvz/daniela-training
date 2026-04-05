export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string;
          name: string;
          category: "compound" | "multi_joint" | "isolation";
          muscle_groups: string[];
          equipment: string[];
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["exercises"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Insert"]>;
      };
      workout_plans: {
        Row: {
          id: string;
          name: string;
          phase: number;
          day_of_week: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["workout_plans"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<
          Database["public"]["Tables"]["workout_plans"]["Insert"]
        >;
      };
      workout_plan_exercises: {
        Row: {
          id: string;
          plan_id: string;
          exercise_id: string;
          sets: number;
          reps: number;
          target_weight: number | null;
          rest_seconds: number;
          order: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["workout_plan_exercises"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<
          Database["public"]["Tables"]["workout_plan_exercises"]["Insert"]
        >;
      };
      session_logs: {
        Row: {
          id: string;
          plan_id: string;
          date: string;
          started_at: string;
          completed_at: string | null;
          energy_pre: number | null;
          energy_post: number | null;
          notes: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["session_logs"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<
          Database["public"]["Tables"]["session_logs"]["Insert"]
        >;
      };
      set_logs: {
        Row: {
          id: string;
          session_log_id: string;
          exercise_id: string;
          set_number: number;
          weight: number;
          reps: number;
          rpe: number | null;
          completed: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["set_logs"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["set_logs"]["Insert"]>;
      };
      daily_checkins: {
        Row: {
          id: string;
          date: string;
          energy: number;
          sleep_quality: number;
          sleep_hours: number | null;
          mood: number;
          soreness: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["daily_checkins"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<
          Database["public"]["Tables"]["daily_checkins"]["Insert"]
        >;
      };
      body_measurements: {
        Row: {
          id: string;
          date: string;
          weight_kg: number | null;
          waist_cm: number | null;
          hips_cm: number | null;
          notes: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["body_measurements"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<
          Database["public"]["Tables"]["body_measurements"]["Insert"]
        >;
      };
    };
  };
};
