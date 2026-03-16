// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chatbot_interactions: {
        Row: {
          bot_response: string | null
          created_at: string
          id: string
          lead_id: string | null
          metadata: Json | null
          platform: string
          session_id: string
          user_message: string | null
        }
        Insert: {
          bot_response?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          platform: string
          session_id: string
          user_message?: string | null
        }
        Update: {
          bot_response?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          platform?: string
          session_id?: string
          user_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          color: string
          created_at: string | null
          id: string
          position: number
          title: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          position: number
          title: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          position?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_history: {
        Row: {
          action_type: string
          description: string | null
          id: string
          lead_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          description?: string | null
          id?: string
          lead_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          description?: string | null
          id?: string
          lead_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cost: number | null
          created_at: string
          email: string | null
          id: string
          lgpd_consent: boolean | null
          name: string
          phone: string | null
          source: string
          status: string
          user_id: string | null
          value: number | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          email?: string | null
          id?: string
          lgpd_consent?: boolean | null
          name: string
          phone?: string | null
          source: string
          status?: string
          user_id?: string | null
          value?: number | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          email?: string | null
          id?: string
          lgpd_consent?: boolean | null
          name?: string
          phone?: string | null
          source?: string
          status?: string
          user_id?: string | null
          value?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          direction: string
          id: string
          lead_id: string | null
          message_text: string
          phone: string
          read: boolean
          timestamp: string
        }
        Insert: {
          direction: string
          id?: string
          lead_id?: string | null
          message_text: string
          phone: string
          read?: boolean
          timestamp?: string
        }
        Update: {
          direction?: string
          id?: string
          lead_id?: string | null
          message_text?: string
          phone?: string
          read?: boolean
          timestamp?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          follow_up_enabled: boolean | null
          follow_up_template: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          follow_up_enabled?: boolean | null
          follow_up_template?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          follow_up_enabled?: boolean | null
          follow_up_template?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_filters: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          lead_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_links: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          title: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          video_url?: string | null
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


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   action: text (not null)
//   timestamp: timestamp with time zone (not null, default: now())
//   details: jsonb (nullable)
// Table: chatbot_interactions
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   session_id: text (not null)
//   user_message: text (nullable)
//   bot_response: text (nullable)
//   metadata: jsonb (nullable, default: '{}'::jsonb)
//   platform: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: kanban_columns
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   color: text (not null)
//   position: integer (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: lead_history
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   action_type: text (not null)
//   description: text (nullable)
//   timestamp: timestamp with time zone (not null, default: now())
//   user_id: uuid (nullable)
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   source: text (not null)
//   status: text (not null, default: 'new'::text)
//   value: numeric (nullable, default: 0)
//   cost: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   user_id: uuid (nullable)
//   email: text (nullable)
//   phone: text (nullable)
//   lgpd_consent: boolean (nullable, default: false)
// Table: messages
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   phone: text (not null)
//   message_text: text (not null)
//   direction: text (not null)
//   timestamp: timestamp with time zone (not null, default: now())
//   read: boolean (not null, default: false)
// Table: notes
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   content: text (not null)
//   user_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   full_name: text (nullable)
//   updated_at: timestamp with time zone (nullable, default: now())
//   follow_up_enabled: boolean (nullable, default: false)
//   follow_up_template: text (nullable, default: 'Olá [Name], notei que não conversamos nos últimos dias. Gostaria de tirar alguma dúvida pendente?'::text)
// Table: saved_filters
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   name: text (not null)
//   filters: jsonb (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: tasks
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   title: text (not null)
//   description: text (nullable)
//   due_date: timestamp with time zone (nullable)
//   status: text (not null, default: 'pending'::text)
//   assigned_to: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: tutorial_links
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (nullable)
//   video_url: text (nullable)
//   category: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: audit_logs
//   PRIMARY KEY audit_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audit_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: chatbot_interactions
//   FOREIGN KEY chatbot_interactions_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
//   PRIMARY KEY chatbot_interactions_pkey: PRIMARY KEY (id)
//   CHECK chatbot_interactions_platform_check: CHECK ((platform = ANY (ARRAY['website'::text, 'whatsapp'::text])))
// Table: kanban_columns
//   PRIMARY KEY kanban_columns_pkey: PRIMARY KEY (id)
//   FOREIGN KEY kanban_columns_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE kanban_columns_user_title_unique: UNIQUE (user_id, title)
// Table: lead_history
//   CHECK lead_history_action_type_check: CHECK ((action_type = ANY (ARRAY['created'::text, 'moved'::text, 'message_received'::text, 'note_added'::text, 'task_created'::text, 'follow_up_sent'::text])))
//   FOREIGN KEY lead_history_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY lead_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY lead_history_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: leads
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY leads_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: messages
//   CHECK messages_direction_check: CHECK ((direction = ANY (ARRAY['incoming'::text, 'outgoing'::text])))
//   PRIMARY KEY messages_pkey: PRIMARY KEY (id)
// Table: notes
//   FOREIGN KEY notes_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY notes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notes_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY notes_user_id_profiles_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: saved_filters
//   PRIMARY KEY saved_filters_pkey: PRIMARY KEY (id)
//   FOREIGN KEY saved_filters_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: tasks
//   FOREIGN KEY tasks_assigned_to_fkey: FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY tasks_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY tasks_pkey: PRIMARY KEY (id)
// Table: tutorial_links
//   PRIMARY KEY tutorial_links_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: audit_logs
//   Policy "Users can insert their own logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view their own logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: chatbot_interactions
//   Policy "Enable all access for authenticated users chatbot" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Enable insert for anon chatbot" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "Enable select for anon chatbot session" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
// Table: kanban_columns
//   Policy "Users can manage own columns" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: lead_history
//   Policy "Enable all access for authenticated users history" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: leads
//   Policy "Enable all access for authenticated users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: messages
//   Policy "Enable all access for authenticated users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: notes
//   Policy "Enable all access for authenticated users notes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: profiles
//   Policy "Users can insert own profile" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//   Policy "Users can view own profile" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
// Table: saved_filters
//   Policy "Users can manage their own saved filters" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: tasks
//   Policy "Enable all access for authenticated users tasks" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: tutorial_links
//   Policy "Enable all access for authenticated users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION log_lead_created()
//   CREATE OR REPLACE FUNCTION public.log_lead_created()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       INSERT INTO public.lead_history (lead_id, action_type, description, user_id)
//       VALUES (NEW.id, 'created', 'Lead criado', NEW.user_id);
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION log_lead_moved()
//   CREATE OR REPLACE FUNCTION public.log_lead_moved()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF OLD.status IS DISTINCT FROM NEW.status THEN
//           -- Using current_setting to get auth.uid if available, fallback to NEW.user_id
//           INSERT INTO public.lead_history (lead_id, action_type, description, user_id)
//           VALUES (
//               NEW.id, 
//               'moved', 
//               OLD.status || ' → ' || NEW.status, 
//               COALESCE(NULLIF(current_setting('request.jwt.claim.sub', true), ''), NEW.user_id::text)::uuid
//           );
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION log_message_received()
//   CREATE OR REPLACE FUNCTION public.log_message_received()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.direction = 'incoming' AND NEW.lead_id IS NOT NULL THEN
//           INSERT INTO public.lead_history (lead_id, action_type, description)
//           VALUES (NEW.lead_id, 'message_received', NEW.message_text);
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION log_note_added()
//   CREATE OR REPLACE FUNCTION public.log_note_added()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       INSERT INTO public.lead_history (lead_id, action_type, description, user_id)
//       VALUES (NEW.lead_id, 'note_added', NEW.content, NEW.user_id);
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION log_task_created()
//   CREATE OR REPLACE FUNCTION public.log_task_created()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       INSERT INTO public.lead_history (lead_id, action_type, description, user_id)
//       VALUES (NEW.lead_id, 'task_created', NEW.title, NEW.assigned_to);
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: leads
//   trigger_lead_created: CREATE TRIGGER trigger_lead_created AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION log_lead_created()
//   trigger_lead_moved: CREATE TRIGGER trigger_lead_moved AFTER UPDATE OF status ON public.leads FOR EACH ROW EXECUTE FUNCTION log_lead_moved()
// Table: messages
//   trigger_message_received: CREATE TRIGGER trigger_message_received AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION log_message_received()
// Table: notes
//   trigger_note_added: CREATE TRIGGER trigger_note_added AFTER INSERT ON public.notes FOR EACH ROW EXECUTE FUNCTION log_note_added()
// Table: tasks
//   trigger_task_created: CREATE TRIGGER trigger_task_created AFTER INSERT ON public.tasks FOR EACH ROW EXECUTE FUNCTION log_task_created()

// --- INDEXES ---
// Table: kanban_columns
//   CREATE UNIQUE INDEX kanban_columns_user_title_unique ON public.kanban_columns USING btree (user_id, title)
// Table: messages
//   CREATE INDEX idx_messages_phone ON public.messages USING btree (phone)
//   CREATE INDEX idx_messages_timestamp ON public.messages USING btree ("timestamp")

