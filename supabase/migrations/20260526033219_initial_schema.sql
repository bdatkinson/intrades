-- =============================================================================
-- InTrades — Initial Schema
-- Migration: 20260526033219_initial_schema
-- =============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

create type suit_type as enum ('spades', 'hearts', 'diamonds', 'clubs');
create type card_rank as enum ('2','3','4','5','6','7','8','9','10','J','Q','K','A');
create type user_role as enum ('apprentice', 'journeyman', 'mentor', 'admin');
create type brt_step as enum ('legal_entity', 'banking', 'insurance', 'licensing');
create type milestone_status as enum ('locked', 'in_progress', 'completed');

-- =============================================================================
-- USERS & PROFILES
-- =============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  role user_role default 'apprentice' not null,
  trade text,                          -- e.g. "electrician", "plumber"
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS: users can only read/update their own profile
alter table public.profiles enable row level security;

create policy "profiles: own read" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: own update" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles: insert on signup" on public.profiles
  for insert with check (auth.uid() = id);

-- =============================================================================
-- MENTOR PERSONAS
-- =============================================================================

create table public.mentor_personas (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,           -- e.g. "ray-the-electrician"
  name text not null,                  -- e.g. "Ray"
  trade text not null,                 -- e.g. "Master Electrician"
  suit suit_type not null,
  card_rank card_rank not null,
  tagline text,
  system_prompt text not null,
  voice_style text,                    -- e.g. "direct, no-nonsense"
  avatar_url text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now() not null
);

-- Public read — mentors are not sensitive
alter table public.mentor_personas enable row level security;
create policy "mentors: public read" on public.mentor_personas
  for select using (true);

-- =============================================================================
-- SCENARIO CARDS (36 pitfall scenarios, 9 per suit)
-- =============================================================================

create table public.scenario_cards (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  suit suit_type not null,
  card_rank card_rank not null,        -- 2-10 for scenarios
  scenario_text text not null,         -- the pitfall description
  hint text,                           -- Socratic nudge
  correct_response text,               -- ideal answer for teaching gate
  difficulty int check (difficulty between 1 and 5) default 3,
  mentor_id uuid references public.mentor_personas(id),
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now() not null
);

alter table public.scenario_cards enable row level security;
create policy "scenarios: public read" on public.scenario_cards
  for select using (true);

-- =============================================================================
-- CAPSTONE CARDS (16 face/ace cards — 4 per suit)
-- =============================================================================

create table public.capstone_cards (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  suit suit_type not null,
  card_rank card_rank not null,        -- J, Q, K, A
  description text not null,
  content_type text not null,          -- 'brt_wizard' | 'coming_soon' | 'activity'
  content jsonb,                       -- flexible per content_type
  mentor_id uuid references public.mentor_personas(id),
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now() not null
);

alter table public.capstone_cards enable row level security;
create policy "capstones: public read" on public.capstone_cards
  for select using (true);

-- =============================================================================
-- BUSINESS READINESS TRACK (BRT) — Diamond face cards wizard
-- =============================================================================

create table public.brt_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  step brt_step not null,
  status milestone_status default 'locked' not null,
  data jsonb default '{}'::jsonb,      -- step-specific form data
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, step)
);

alter table public.brt_progress enable row level security;
create policy "brt: own read" on public.brt_progress
  for select using (auth.uid() = user_id);
create policy "brt: own write" on public.brt_progress
  for all using (auth.uid() = user_id);

-- =============================================================================
-- CHAT SESSIONS
-- =============================================================================

create table public.chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  mentor_id uuid references public.mentor_personas(id) not null,
  scenario_id uuid references public.scenario_cards(id),    -- nullable
  capstone_id uuid references public.capstone_cards(id),    -- nullable
  title text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.chat_sessions enable row level security;
create policy "sessions: own read/write" on public.chat_sessions
  for all using (auth.uid() = user_id);

-- =============================================================================
-- CHAT MESSAGES
-- =============================================================================

create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  tokens_used int,
  created_at timestamptz default now() not null
);

alter table public.chat_messages enable row level security;
create policy "messages: session owner" on public.chat_messages
  for all using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- =============================================================================
-- USER MILESTONES (Day-One unlock system)
-- =============================================================================

create table public.user_milestones (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  milestone_key text not null,         -- e.g. "first_chat", "completed_scenario_spades_1"
  achieved_at timestamptz default now() not null,
  metadata jsonb default '{}'::jsonb,
  unique(user_id, milestone_key)
);

alter table public.user_milestones enable row level security;
create policy "milestones: own read/write" on public.user_milestones
  for all using (auth.uid() = user_id);

-- =============================================================================
-- TRIGGERS — updated_at auto-maintenance
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_chat_sessions_updated_at
  before update on public.chat_sessions
  for each row execute function public.set_updated_at();

create trigger trg_brt_progress_updated_at
  before update on public.brt_progress
  for each row execute function public.set_updated_at();

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_mentor_personas_suit on public.mentor_personas(suit);
create index idx_scenario_cards_suit on public.scenario_cards(suit);
create index idx_chat_sessions_user on public.chat_sessions(user_id);
create index idx_chat_messages_session on public.chat_messages(session_id);
create index idx_user_milestones_user on public.user_milestones(user_id);
create index idx_brt_progress_user on public.brt_progress(user_id);
