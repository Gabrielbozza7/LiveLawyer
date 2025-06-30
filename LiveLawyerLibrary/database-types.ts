export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      CallEvent: {
        Row: {
          action: Database['public']['Enums']['Action']
          callId: string
          id: string
          timestamp: string
          userId: string
        }
        Insert: {
          action: Database['public']['Enums']['Action']
          callId: string
          id?: string
          timestamp: string
          userId: string
        }
        Update: {
          action?: Database['public']['Enums']['Action']
          callId?: string
          id?: string
          timestamp?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: 'CallEvent_callId_fkey'
            columns: ['callId']
            isOneToOne: false
            referencedRelation: 'CallMetadata'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'CallEvent_userId_fkey'
            columns: ['userId']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      CallMetadata: {
        Row: {
          clientId: string
          id: string
          lawyerId: string | null
          observerId: string
          startTime: string
          twilioRoomSid: string
        }
        Insert: {
          clientId: string
          id?: string
          lawyerId?: string | null
          observerId: string
          startTime: string
          twilioRoomSid: string
        }
        Update: {
          clientId?: string
          id?: string
          lawyerId?: string | null
          observerId?: string
          startTime?: string
          twilioRoomSid?: string
        }
        Relationships: [
          {
            foreignKeyName: 'CallMetadata_clientId_fkey'
            columns: ['clientId']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'CallMetadata_lawyerId_fkey'
            columns: ['lawyerId']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'CallMetadata_observerId_fkey'
            columns: ['observerId']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      CallRecording: {
        Row: {
          callId: string
          id: string
          s3Ref: string | null
          startTime: string
          trackType: Database['public']['Enums']['TrackType']
          userId: string
        }
        Insert: {
          callId: string
          id?: string
          s3Ref?: string | null
          startTime: string
          trackType: Database['public']['Enums']['TrackType']
          userId: string
        }
        Update: {
          callId?: string
          id?: string
          s3Ref?: string | null
          startTime?: string
          trackType?: Database['public']['Enums']['TrackType']
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: 'CallRecording_callId_fkey'
            columns: ['callId']
            isOneToOne: false
            referencedRelation: 'CallMetadata'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'CallRecording_userId_fkey'
            columns: ['userId']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      Contact: {
        Row: {
          id: string
          name: string
          phoneNumber: string
          userId: string
        }
        Insert: {
          id?: string
          name: string
          phoneNumber: string
          userId: string
        }
        Update: {
          id?: string
          name?: string
          phoneNumber?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Contact_userId_fkey'
            columns: ['userId']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      LawOffice: {
        Row: {
          administratorId: string
          createdAt: string
          id: string
          name: string
        }
        Insert: {
          administratorId: string
          createdAt?: string
          id?: string
          name: string
        }
        Update: {
          administratorId?: string
          createdAt?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'LawOffice_administratorId_fkey'
            columns: ['administratorId']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      Lawyer: {
        Row: {
          address: string
          description: string | null
          email: string
          id: string
          name: string
          phoneNum: string
          picUrl: string | null
        }
        Insert: {
          address: string
          description?: string | null
          email: string
          id?: string
          name: string
          phoneNum: string
          picUrl?: string | null
        }
        Update: {
          address?: string
          description?: string | null
          email?: string
          id?: string
          name?: string
          phoneNum?: string
          picUrl?: string | null
        }
        Relationships: []
      }
      User: {
        Row: {
          dateJoined: string
          email: string
          firstName: string
          id: string
          lastName: string
          phoneNumber: string
          profPicUrl: string | null
          userType: Database['public']['Enums']['UserType']
        }
        Insert: {
          dateJoined?: string
          email: string
          firstName: string
          id: string
          lastName: string
          phoneNumber: string
          profPicUrl?: string | null
          userType?: Database['public']['Enums']['UserType']
        }
        Update: {
          dateJoined?: string
          email?: string
          firstName?: string
          id?: string
          lastName?: string
          phoneNumber?: string
          profPicUrl?: string | null
          userType?: Database['public']['Enums']['UserType']
        }
        Relationships: []
      }
      UserLawyer: {
        Row: {
          id: string
          officeId: string | null
        }
        Insert: {
          id: string
          officeId?: string | null
        }
        Update: {
          id?: string
          officeId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'UserLawyer_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'UserLawyer_officeId_fkey'
            columns: ['officeId']
            isOneToOne: false
            referencedRelation: 'LawOffice'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Action: 'Ended Call' | 'Token Issued' | 'Connected' | 'Disconnected'
      TrackType: 'Audio' | 'Video'
      UserType: 'Observer' | 'Lawyer' | 'Client' | 'Dev'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      Action: ['Ended Call', 'Token Issued', 'Connected', 'Disconnected'],
      TrackType: ['Audio', 'Video'],
      UserType: ['Observer', 'Lawyer', 'Client', 'Dev'],
    },
  },
} as const
