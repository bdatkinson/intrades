// =============================================================================
// InTrades — Database Type Definitions
// Auto-generated from migration: 20260526033219_initial_schema
// =============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// =============================================================================
// ENUMS
// =============================================================================

export type SuitType = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type UserRole = 'apprentice' | 'journeyman' | 'mentor' | 'admin';
export type BrtStep = 'legal_entity' | 'banking' | 'insurance' | 'licensing';
export type MilestoneStatus = 'locked' | 'in_progress' | 'completed';

// =============================================================================
// DATABASE INTERFACE
// =============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          role: UserRole;
          trade: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          role?: UserRole;
          trade?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          role?: UserRole;
          trade?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mentor_personas: {
        Row: {
          id: string;
          slug: string;
          name: string;
          trade: string;
          suit: SuitType;
          card_rank: CardRank;
          tagline: string | null;
          system_prompt: string;
          voice_style: string | null;
          avatar_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          trade: string;
          suit: SuitType;
          card_rank: CardRank;
          tagline?: string | null;
          system_prompt: string;
          voice_style?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          trade?: string;
          suit?: SuitType;
          card_rank?: CardRank;
          tagline?: string | null;
          system_prompt?: string;
          voice_style?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      scenario_cards: {
        Row: {
          id: string;
          slug: string;
          title: string;
          suit: SuitType;
          card_rank: CardRank;
          scenario_text: string;
          hint: string | null;
          correct_response: string | null;
          difficulty: number;
          mentor_id: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          suit: SuitType;
          card_rank: CardRank;
          scenario_text: string;
          hint?: string | null;
          correct_response?: string | null;
          difficulty?: number;
          mentor_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          suit?: SuitType;
          card_rank?: CardRank;
          scenario_text?: string;
          hint?: string | null;
          correct_response?: string | null;
          difficulty?: number;
          mentor_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      capstone_cards: {
        Row: {
          id: string;
          slug: string;
          title: string;
          suit: SuitType;
          card_rank: CardRank;
          description: string;
          content_type: string;
          content: Json | null;
          mentor_id: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          suit: SuitType;
          card_rank: CardRank;
          description: string;
          content_type: string;
          content?: Json | null;
          mentor_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          suit?: SuitType;
          card_rank?: CardRank;
          description?: string;
          content_type?: string;
          content?: Json | null;
          mentor_id?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      brt_progress: {
        Row: {
          id: string;
          user_id: string;
          step: BrtStep;
          status: MilestoneStatus;
          data: Json;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          step: BrtStep;
          status?: MilestoneStatus;
          data?: Json;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          step?: BrtStep;
          status?: MilestoneStatus;
          data?: Json;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          mentor_id: string;
          scenario_id: string | null;
          capstone_id: string | null;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mentor_id: string;
          scenario_id?: string | null;
          capstone_id?: string | null;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mentor_id?: string;
          scenario_id?: string | null;
          capstone_id?: string | null;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          tokens_used?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          tokens_used?: number | null;
          created_at?: string;
        };
      };
      user_milestones: {
        Row: {
          id: string;
          user_id: string;
          milestone_key: string;
          achieved_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          milestone_key: string;
          achieved_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          milestone_key?: string;
          achieved_at?: string;
          metadata?: Json;
        };
      };
    };
    Enums: {
      suit_type: SuitType;
      card_rank: CardRank;
      user_role: UserRole;
      brt_step: BrtStep;
      milestone_status: MilestoneStatus;
    };
  };
}
