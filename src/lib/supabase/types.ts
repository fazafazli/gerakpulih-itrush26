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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      kejadian: {
        Row: {
          ditindaklanjuti: boolean
          ditindaklanjuti_pada: string | null
          id: string
          jenis: string
          kode_gerakan: string | null
          pasien_id: string
          repetisi_ke: number | null
          sesi_id: string
          sudut: number | null
          terjadi_pada: string
        }
        Insert: {
          ditindaklanjuti?: boolean
          ditindaklanjuti_pada?: string | null
          id?: string
          jenis: string
          kode_gerakan?: string | null
          pasien_id: string
          repetisi_ke?: number | null
          sesi_id: string
          sudut?: number | null
          terjadi_pada?: string
        }
        Update: {
          ditindaklanjuti?: boolean
          ditindaklanjuti_pada?: string | null
          id?: string
          jenis?: string
          kode_gerakan?: string | null
          pasien_id?: string
          repetisi_ke?: number | null
          sesi_id?: string
          sudut?: number | null
          terjadi_pada?: string
        }
        Relationships: [
          {
            foreignKeyName: "kejadian_pasien_id_fkey"
            columns: ["pasien_id"]
            isOneToOne: false
            referencedRelation: "pasien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kejadian_sesi_id_fkey"
            columns: ["sesi_id"]
            isOneToOne: false
            referencedRelation: "sesi"
            referencedColumns: ["id"]
          },
        ]
      }
      pasien: {
        Row: {
          aktif: boolean
          catatan: string | null
          dibuat: string
          id: string
          is_demo: boolean
          nama_tampilan: string
          sisi_dilatih: string
          terakhir_aktif: string | null
          terapis_id: string
          token_hash: string
        }
        Insert: {
          aktif?: boolean
          catatan?: string | null
          dibuat?: string
          id?: string
          is_demo?: boolean
          nama_tampilan: string
          sisi_dilatih: string
          terakhir_aktif?: string | null
          terapis_id: string
          token_hash: string
        }
        Update: {
          aktif?: boolean
          catatan?: string | null
          dibuat?: string
          id?: string
          is_demo?: boolean
          nama_tampilan?: string
          sisi_dilatih?: string
          terakhir_aktif?: string | null
          terapis_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "pasien_terapis_id_fkey"
            columns: ["terapis_id"]
            isOneToOne: false
            referencedRelation: "terapis"
            referencedColumns: ["id"]
          },
        ]
      }
      program_gerakan: {
        Row: {
          aktif: boolean
          dibuat: string
          id: string
          kode_gerakan: string
          pasien_id: string
          repetisi: number
          target_sudut: number
          urutan: number
        }
        Insert: {
          aktif?: boolean
          dibuat?: string
          id?: string
          kode_gerakan: string
          pasien_id: string
          repetisi: number
          target_sudut: number
          urutan?: number
        }
        Update: {
          aktif?: boolean
          dibuat?: string
          id?: string
          kode_gerakan?: string
          pasien_id?: string
          repetisi?: number
          target_sudut?: number
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_gerakan_pasien_id_fkey"
            columns: ["pasien_id"]
            isOneToOne: false
            referencedRelation: "pasien"
            referencedColumns: ["id"]
          },
        ]
      }
      ringkasan_ai: {
        Row: {
          dibuat: string
          hash_input: string
          id: string
          isi: Json
          model: string | null
          pasien_id: string
          periode_mulai: string
          periode_selesai: string
          sumber: string
        }
        Insert: {
          dibuat?: string
          hash_input: string
          id?: string
          isi: Json
          model?: string | null
          pasien_id: string
          periode_mulai: string
          periode_selesai: string
          sumber: string
        }
        Update: {
          dibuat?: string
          hash_input?: string
          id?: string
          isi?: Json
          model?: string | null
          pasien_id?: string
          periode_mulai?: string
          periode_selesai?: string
          sumber?: string
        }
        Relationships: [
          {
            foreignKeyName: "ringkasan_ai_pasien_id_fkey"
            columns: ["pasien_id"]
            isOneToOne: false
            referencedRelation: "pasien"
            referencedColumns: ["id"]
          },
        ]
      }
      sesi: {
        Row: {
          dibuat: string
          dihentikan_nyeri: boolean
          id: string
          info_teknis: Json
          mulai: string
          pasien_id: string
          selesai: string | null
        }
        Insert: {
          dibuat?: string
          dihentikan_nyeri?: boolean
          id?: string
          info_teknis?: Json
          mulai: string
          pasien_id: string
          selesai?: string | null
        }
        Update: {
          dibuat?: string
          dihentikan_nyeri?: boolean
          id?: string
          info_teknis?: Json
          mulai?: string
          pasien_id?: string
          selesai?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sesi_pasien_id_fkey"
            columns: ["pasien_id"]
            isOneToOne: false
            referencedRelation: "pasien"
            referencedColumns: ["id"]
          },
        ]
      }
      sesi_gerakan: {
        Row: {
          id: string
          kode_gerakan: string
          puncak_maks: number | null
          puncak_rata: number | null
          rep_capai_target: number
          rep_kompensasi: number
          repetisi_selesai: number
          repetisi_target: number
          sesi_id: string
          target_sudut: number
        }
        Insert: {
          id?: string
          kode_gerakan: string
          puncak_maks?: number | null
          puncak_rata?: number | null
          rep_capai_target?: number
          rep_kompensasi?: number
          repetisi_selesai?: number
          repetisi_target: number
          sesi_id: string
          target_sudut: number
        }
        Update: {
          id?: string
          kode_gerakan?: string
          puncak_maks?: number | null
          puncak_rata?: number | null
          rep_capai_target?: number
          rep_kompensasi?: number
          repetisi_selesai?: number
          repetisi_target?: number
          sesi_id?: string
          target_sudut?: number
        }
        Relationships: [
          {
            foreignKeyName: "sesi_gerakan_sesi_id_fkey"
            columns: ["sesi_id"]
            isOneToOne: false
            referencedRelation: "sesi"
            referencedColumns: ["id"]
          },
        ]
      }
      terapis: {
        Row: {
          dibuat: string
          id: string
          institusi: string | null
          nama: string
        }
        Insert: {
          dibuat?: string
          id: string
          institusi?: string | null
          nama: string
        }
        Update: {
          dibuat?: string
          id?: string
          institusi?: string | null
          nama?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      milik_terapis: { Args: { p_pasien: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
