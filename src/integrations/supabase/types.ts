export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_keys: {
        Row: {
          blocked: boolean
          created_at: string
          created_by: string
          id: string
          key: string
          used: boolean
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          created_by?: string
          id?: string
          key: string
          used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          blocked?: boolean
          created_at?: string
          created_by?: string
          id?: string
          key?: string
          used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      battle_challenges: {
        Row: {
          challenger_key: string
          challenger_name: string
          challenger_score: number
          created_at: string
          id: string
          opponent_key: string | null
          opponent_name: string | null
          opponent_score: number
          questions: Json
          status: string
          subject: string
          winner_key: string | null
        }
        Insert: {
          challenger_key: string
          challenger_name?: string
          challenger_score?: number
          created_at?: string
          id?: string
          opponent_key?: string | null
          opponent_name?: string | null
          opponent_score?: number
          questions?: Json
          status?: string
          subject: string
          winner_key?: string | null
        }
        Update: {
          challenger_key?: string
          challenger_name?: string
          challenger_score?: number
          created_at?: string
          id?: string
          opponent_key?: string | null
          opponent_name?: string | null
          opponent_score?: number
          questions?: Json
          status?: string
          subject?: string
          winner_key?: string | null
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          completed_count: number
          created_at: string
          id: string
          mission_date: string
          missions: Json
          total_count: number
          user_key: string
          xp_reward: number
        }
        Insert: {
          completed_count?: number
          created_at?: string
          id?: string
          mission_date?: string
          missions?: Json
          total_count?: number
          user_key: string
          xp_reward?: number
        }
        Update: {
          completed_count?: number
          created_at?: string
          id?: string
          mission_date?: string
          missions?: Json
          total_count?: number
          user_key?: string
          xp_reward?: number
        }
        Relationships: []
      }
      exam_reports: {
        Row: {
          created_at: string
          difficulty: number
          exam_date: string
          grade: string
          id: string
          notes: string | null
          subject: string
          topics_appeared: Json
          user_key: string
        }
        Insert: {
          created_at?: string
          difficulty?: number
          exam_date?: string
          grade: string
          id?: string
          notes?: string | null
          subject: string
          topics_appeared?: Json
          user_key: string
        }
        Update: {
          created_at?: string
          difficulty?: number
          exam_date?: string
          grade?: string
          id?: string
          notes?: string | null
          subject?: string
          topics_appeared?: Json
          user_key?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          questions: Json
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          questions?: Json
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          questions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      global_keys: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          current_uses: number
          expires_at: string | null
          id: string
          key: string
          label: string
          max_uses: number | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          key: string
          label?: string
          max_uses?: number | null
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          key?: string
          label?: string
          max_uses?: number | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string
          created_at: string
          grade: string
          id: string
          subject: string
          topic: string
        }
        Insert: {
          content: string
          created_at?: string
          grade: string
          id?: string
          subject: string
          topic: string
        }
        Update: {
          content?: string
          created_at?: string
          grade?: string
          id?: string
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: number
          grade: string
          id: string
          options: Json
          question_text: string
          source: string | null
          subject: string
          topic: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty?: number
          grade: string
          id?: string
          options?: Json
          question_text: string
          source?: string | null
          subject: string
          topic: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: number
          grade?: string
          id?: string
          options?: Json
          question_text?: string
          source?: string | null
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      school_missions: {
        Row: {
          active: boolean
          created_at: string
          current_count: number
          description: string | null
          end_date: string
          id: string
          reward_xp: number
          start_date: string
          target_count: number
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          current_count?: number
          description?: string | null
          end_date: string
          id?: string
          reward_xp?: number
          start_date?: string
          target_count: number
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          current_count?: number
          description?: string | null
          end_date?: string
          id?: string
          reward_xp?: number
          start_date?: string
          target_count?: number
          title?: string
        }
        Relationships: []
      }
      student_badges: {
        Row: {
          badge_description: string
          badge_icon: string
          badge_id: string
          badge_name: string
          earned_at: string
          id: string
          user_key: string
        }
        Insert: {
          badge_description?: string
          badge_icon?: string
          badge_id: string
          badge_name: string
          earned_at?: string
          id?: string
          user_key: string
        }
        Update: {
          badge_description?: string
          badge_icon?: string
          badge_id?: string
          badge_name?: string
          earned_at?: string
          id?: string
          user_key?: string
        }
        Relationships: []
      }
      student_errors: {
        Row: {
          correct_answer: string | null
          created_at: string
          error_count: number
          grade: string
          id: string
          last_error_at: string
          question_text: string
          resolved: boolean
          subject: string
          topic: string
          user_key: string
          wrong_answer: string | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          error_count?: number
          grade: string
          id?: string
          last_error_at?: string
          question_text: string
          resolved?: boolean
          subject: string
          topic: string
          user_key: string
          wrong_answer?: string | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          error_count?: number
          grade?: string
          id?: string
          last_error_at?: string
          question_text?: string
          resolved?: boolean
          subject?: string
          topic?: string
          user_key?: string
          wrong_answer?: string | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          last_study_date: string | null
          learning_style: string | null
          level: number
          streak_days: number
          total_study_minutes: number
          turma: string | null
          user_key: string
          xp: number
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          last_study_date?: string | null
          learning_style?: string | null
          level?: number
          streak_days?: number
          total_study_minutes?: number
          turma?: string | null
          user_key: string
          xp?: number
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          last_study_date?: string | null
          learning_style?: string | null
          level?: number
          streak_days?: number
          total_study_minutes?: number
          turma?: string | null
          user_key?: string
          xp?: number
        }
        Relationships: []
      }
      student_topic_progress: {
        Row: {
          avg_response_time_ms: number | null
          correct_count: number
          created_at: string
          grade: string
          id: string
          last_practiced_at: string | null
          mastery_percent: number
          subject: string
          topic: string
          total_attempts: number
          user_key: string
          wrong_count: number
        }
        Insert: {
          avg_response_time_ms?: number | null
          correct_count?: number
          created_at?: string
          grade: string
          id?: string
          last_practiced_at?: string | null
          mastery_percent?: number
          subject: string
          topic: string
          total_attempts?: number
          user_key: string
          wrong_count?: number
        }
        Update: {
          avg_response_time_ms?: number | null
          correct_count?: number
          created_at?: string
          grade?: string
          id?: string
          last_practiced_at?: string | null
          mastery_percent?: number
          subject?: string
          topic?: string
          total_attempts?: number
          user_key?: string
          wrong_count?: number
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          duration_minutes: number
          ended_at: string | null
          grade: string | null
          id: string
          session_type: string
          started_at: string
          subject: string | null
          topic: string | null
          user_key: string
        }
        Insert: {
          duration_minutes?: number
          ended_at?: string | null
          grade?: string | null
          id?: string
          session_type?: string
          started_at?: string
          subject?: string | null
          topic?: string | null
          user_key: string
        }
        Update: {
          duration_minutes?: number
          ended_at?: string | null
          grade?: string | null
          id?: string
          session_type?: string
          started_at?: string
          subject?: string | null
          topic?: string | null
          user_key?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
