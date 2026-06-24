export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          name: string
          telegram_user_id: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      projects: {
        Row: {
          id: string
          name: string
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      bot_sessions: {
        Row: {
          telegram_user_id: number
          step: string
          project_id: string | null
          project_name: string | null
          work_description: string | null
          notes: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bot_sessions']['Row'], 'updated_at'> & { updated_at?: string }
        Update: Partial<Database['public']['Tables']['bot_sessions']['Insert']>
      }
      daily_reports: {
        Row: {
          id: string
          employee_id: string
          project_id: string | null
          location: string
          work_date: string
          work_description: string
          notes: string | null
          status: 'submitted' | 'reviewed'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_reports']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['daily_reports']['Insert']>
      }
      admins: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admins']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['admins']['Insert']>
      }
    }
  }
}

export type Employee = Database['public']['Tables']['employees']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type BotSession = Database['public']['Tables']['bot_sessions']['Row']
export type DailyReport = Database['public']['Tables']['daily_reports']['Row']
export type Admin = Database['public']['Tables']['admins']['Row']

export type ReportWithEmployee = DailyReport & {
  employees: Pick<Employee, 'id' | 'name'>
}
