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
    PostgrestVersion: "13.0.5"
  }
  car_rental: {
    Tables: {
      branches: {
        Row: {
          address: string
          created_at: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      cars: {
        Row: {
          branch_id: string | null
          category_id: string
          color: string | null
          created_at: string
          id: string
          make: string
          mileage: number
          model: string
          registration_no: string
          status: string
          vin: string | null
          year: number
        }
        Insert: {
          branch_id?: string | null
          category_id: string
          color?: string | null
          created_at?: string
          id?: string
          make: string
          mileage?: number
          model: string
          registration_no: string
          status?: string
          vin?: string | null
          year: number
        }
        Update: {
          branch_id?: string | null
          category_id?: string
          color?: string | null
          created_at?: string
          id?: string
          make?: string
          mileage?: number
          model?: string
          registration_no?: string
          status?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          date_of_birth: string
          driver_license_expiry: string
          driver_license_no: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          driver_license_expiry: string
          driver_license_no: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          driver_license_expiry?: string
          driver_license_no?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          active: boolean
          auth_user_id: string | null
          branch_id: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: string
        }
        Insert: {
          active?: boolean
          auth_user_id?: string | null
          branch_id?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          role: string
        }
        Update: {
          active?: boolean
          auth_user_id?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          car_id: string
          cost: number | null
          created_at: string
          description: string | null
          id: string
          maintenance_date: string
          maintenance_type: string
          odometer: number | null
          performed_by: string | null
        }
        Insert: {
          car_id: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          maintenance_date: string
          maintenance_type: string
          odometer?: number | null
          performed_by?: string | null
        }
        Update: {
          car_id?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          maintenance_date?: string
          maintenance_type?: string
          odometer?: number | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "mv_car_utilization"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "maintenance_records_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          payment_type: string
          received_by: string | null
          reference_no: string | null
          rental_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          payment_type: string
          received_by?: string | null
          reference_no?: string | null
          rental_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_type?: string
          received_by?: string | null
          reference_no?: string | null
          rental_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "mv_overdue_rentals"
            referencedColumns: ["rental_id"]
          },
          {
            foreignKeyName: "payments_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rental_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_contracts: {
        Row: {
          actual_return_datetime: string | null
          car_id: string
          contract_no: string
          created_at: string
          customer_id: string
          daily_rate: number
          discount: number | null
          employee_id: string | null
          id: string
          late_fee: number | null
          notes: string | null
          pickup_branch_id: string | null
          pickup_datetime: string
          rental_status: string
          return_branch_id: string | null
          return_datetime: string
          subtotal: number | null
          total_amount: number | null
          total_days: number | null
        }
        Insert: {
          actual_return_datetime?: string | null
          car_id: string
          contract_no: string
          created_at?: string
          customer_id: string
          daily_rate: number
          discount?: number | null
          employee_id?: string | null
          id?: string
          late_fee?: number | null
          notes?: string | null
          pickup_branch_id?: string | null
          pickup_datetime: string
          rental_status?: string
          return_branch_id?: string | null
          return_datetime: string
          subtotal?: number | null
          total_amount?: number | null
          total_days?: number | null
        }
        Update: {
          actual_return_datetime?: string | null
          car_id?: string
          contract_no?: string
          created_at?: string
          customer_id?: string
          daily_rate?: number
          discount?: number | null
          employee_id?: string | null
          id?: string
          late_fee?: number | null
          notes?: string | null
          pickup_branch_id?: string | null
          pickup_datetime?: string
          rental_status?: string
          return_branch_id?: string | null
          return_datetime?: string
          subtotal?: number | null
          total_amount?: number | null
          total_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_contracts_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "mv_car_utilization"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "rental_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_pickup_branch_id_fkey"
            columns: ["pickup_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_return_branch_id_fkey"
            columns: ["return_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_inspections: {
        Row: {
          created_at: string
          damages: Json | null
          fuel_level_percent: number | null
          id: string
          inspected_by: string | null
          inspection_datetime: string
          inspection_type: string
          notes: string | null
          odometer: number | null
          rental_id: string
        }
        Insert: {
          created_at?: string
          damages?: Json | null
          fuel_level_percent?: number | null
          id?: string
          inspected_by?: string | null
          inspection_datetime?: string
          inspection_type: string
          notes?: string | null
          odometer?: number | null
          rental_id: string
        }
        Update: {
          created_at?: string
          damages?: Json | null
          fuel_level_percent?: number | null
          id?: string
          inspected_by?: string | null
          inspection_datetime?: string
          inspection_type?: string
          notes?: string | null
          odometer?: number | null
          rental_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_inspections_inspected_by_fkey"
            columns: ["inspected_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_inspections_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "mv_overdue_rentals"
            referencedColumns: ["rental_id"]
          },
          {
            foreignKeyName: "rental_inspections_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rental_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_categories: {
        Row: {
          created_at: string
          daily_rate: number
          description: string | null
          id: string
          monthly_rate: number | null
          name: string
          required_deposit: number | null
          weekly_rate: number | null
        }
        Insert: {
          created_at?: string
          daily_rate: number
          description?: string | null
          id?: string
          monthly_rate?: number | null
          name: string
          required_deposit?: number | null
          weekly_rate?: number | null
        }
        Update: {
          created_at?: string
          daily_rate?: number
          description?: string | null
          id?: string
          monthly_rate?: number | null
          name?: string
          required_deposit?: number | null
          weekly_rate?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      mv_car_utilization: {
        Row: {
          car_id: string | null
          make: string | null
          model: string | null
          period_days: number | null
          registration_no: string | null
          rented_days: number | null
          utilization_percent: number | null
        }
        Relationships: []
      }
      mv_maintenance_history: {
        Row: {
          car_id: string | null
          last_service_date: string | null
          total_cost: number | null
          total_jobs: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "mv_car_utilization"
            referencedColumns: ["car_id"]
          },
        ]
      }
      mv_overdue_rentals: {
        Row: {
          car_id: string | null
          contract_no: string | null
          current_time: string | null
          customer_id: string | null
          late_fee: number | null
          overdue_days: number | null
          rental_id: string | null
          return_datetime: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_contracts_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "mv_car_utilization"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "rental_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_revenue_by_period: {
        Row: {
          deposits: number | null
          late_fee_income: number | null
          period: string | null
          refunds: number | null
          rental_income: number | null
          total_income: number | null
        }
        Relationships: []
      }
      mv_top_customers: {
        Row: {
          customer_id: string | null
          first_rental: string | null
          last_rental: string | null
          rental_count: number | null
          total_spent: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
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
  car_rental: {
    Enums: {},
  },
} as const
