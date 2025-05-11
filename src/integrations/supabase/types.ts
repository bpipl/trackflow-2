export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          timestamp: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      couriers: {
        Row: {
          air_charge: number | null
          current_tracking_number: number | null
          id: string
          is_system: boolean | null
          name: string
          prefix: string
          surface_charge: number | null
          tracking_url_format: string | null
        }
        Insert: {
          air_charge?: number | null
          current_tracking_number?: number | null
          id?: string
          is_system?: boolean | null
          name: string
          prefix: string
          surface_charge?: number | null
          tracking_url_format?: string | null
        }
        Update: {
          air_charge?: number | null
          current_tracking_number?: number | null
          id?: string
          is_system?: boolean | null
          name?: string
          prefix?: string
          surface_charge?: number | null
          tracking_url_format?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          pincode: string | null
          state: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
        }
        Relationships: []
      }
      express_slips: {
        Row: {
          box_weights: Json | null
          charges: number | null
          courier_id: string | null
          courier_name: string
          customer_address: string
          customer_id: string | null
          customer_mobile: string | null
          customer_name: string
          email_sent: boolean | null
          generated_at: string | null
          generated_by: string | null
          id: string
          is_cancelled: boolean | null
          is_packed: boolean | null
          is_to_pay_shipping: boolean | null
          method: string | null
          number_of_boxes: number | null
          packed_at: string | null
          packed_by: string | null
          sender_address: string
          sender_address_id: string | null
          sender_name: string
          tracking_id: string
          weighed_by: string | null
          weight: number | null
        }
        Insert: {
          box_weights?: Json | null
          charges?: number | null
          courier_id?: string | null
          courier_name: string
          customer_address: string
          customer_id?: string | null
          customer_mobile?: string | null
          customer_name: string
          email_sent?: boolean | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_cancelled?: boolean | null
          is_packed?: boolean | null
          is_to_pay_shipping?: boolean | null
          method?: string | null
          number_of_boxes?: number | null
          packed_at?: string | null
          packed_by?: string | null
          sender_address: string
          sender_address_id?: string | null
          sender_name: string
          tracking_id: string
          weighed_by?: string | null
          weight?: number | null
        }
        Update: {
          box_weights?: Json | null
          charges?: number | null
          courier_id?: string | null
          courier_name?: string
          customer_address?: string
          customer_id?: string | null
          customer_mobile?: string | null
          customer_name?: string
          email_sent?: boolean | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_cancelled?: boolean | null
          is_packed?: boolean | null
          is_to_pay_shipping?: boolean | null
          method?: string | null
          number_of_boxes?: number | null
          packed_at?: string | null
          packed_by?: string | null
          sender_address?: string
          sender_address_id?: string | null
          sender_name?: string
          tracking_id?: string
          weighed_by?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "express_slips_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "express_slips_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "express_slips_sender_address_id_fkey"
            columns: ["sender_address_id"]
            isOneToOne: false
            referencedRelation: "sender_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      sender_addresses: {
        Row: {
          full_address: string
          id: string
          is_default: boolean | null
          name: string
          phone: string | null
        }
        Insert: {
          full_address: string
          id?: string
          is_default?: boolean | null
          name: string
          phone?: string | null
        }
        Update: {
          full_address?: string
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      slips: {
        Row: {
          box_count: number | null
          courier_id: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          is_to_pay: boolean | null
          method: string | null
          tracking_id: string
          weight: number | null
        }
        Insert: {
          box_count?: number | null
          courier_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_to_pay?: boolean | null
          method?: string | null
          tracking_id: string
          weight?: number | null
        }
        Update: {
          box_count?: number | null
          courier_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_to_pay?: boolean | null
          method?: string | null
          tracking_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "slips_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slips_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          id: string
          permission: string
          user_id: string
          value: boolean
        }
        Insert: {
          id?: string
          permission: string
          user_id: string
          value?: boolean
        }
        Update: {
          id?: string
          permission?: string
          user_id?: string
          value?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
