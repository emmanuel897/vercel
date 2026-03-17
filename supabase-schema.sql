-- ============================================================
-- Schéma Supabase — Application Podcasts Communautaire
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Extension pour les UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE : friends (profils des amis approuvés)
-- ============================================================
create table public.friends (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  display_name  text not null,
  bio           text,
  is_active     boolean not null default true,
  is_admin      boolean not null default false,
  invited_at    timestamptz not null default now(),
  joined_at     timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- TABLE : invitations (tokens d'invitation)
-- ============================================================
create table public.invitations (
  id         uuid primary key default gen_random_uuid(),
  token      text not null unique default encode(gen_random_bytes(32), 'hex'),
  email      text,
  friend_id  uuid references public.friends(id) on delete cascade,
  used       boolean not null default false,
  expires_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLE : podcasts
-- ============================================================
create type podcast_category as enum (
  'Culture', 'Science', 'Société', 'Histoire', 'Humour', 'Autre'
);

create type podcast_duration as enum (
  'courte', 'moyenne', 'longue'
);

create table public.podcasts (
  id          uuid primary key default gen_random_uuid(),
  friend_id   uuid not null references public.friends(id) on delete cascade,
  url         text not null,
  title       text not null,
  description text,
  category    podcast_category not null default 'Autre',
  duration    podcast_duration not null default 'moyenne',
  is_deleted  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- TABLE : reactions
-- ============================================================
create type reaction_type as enum (
  'interesse', 'pas_interesse', 'ecoute', 'conseille'
);

create table public.reactions (
  id          uuid primary key default gen_random_uuid(),
  friend_id   uuid not null references public.friends(id) on delete cascade,
  podcast_id  uuid not null references public.podcasts(id) on delete cascade,
  type        reaction_type not null,
  created_at  timestamptz not null default now(),
  unique(friend_id, podcast_id)
);

-- ============================================================
-- TABLE : comments
-- ============================================================
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  friend_id   uuid not null references public.friends(id) on delete cascade,
  podcast_id  uuid not null references public.podcasts(id) on delete cascade,
  content     text not null,
  is_deleted  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.friends     enable row level security;
alter table public.invitations enable row level security;
alter table public.podcasts    enable row level security;
alter table public.reactions   enable row level security;
alter table public.comments    enable row level security;

-- ---- FRIENDS ----
-- Lecture publique des amis actifs (nom + bio uniquement)
create policy "friends_select_public" on public.friends
  for select using (is_active = true);

-- Admin peut tout faire
create policy "friends_all_admin" on public.friends
  for all using (
    exists (
      select 1 from public.friends f
      where f.user_id = auth.uid() and f.is_admin = true
    )
  );

-- Un ami peut modifier son propre profil
create policy "friends_update_self" on public.friends
  for update using (user_id = auth.uid());

-- ---- INVITATIONS ----
-- Admin uniquement
create policy "invitations_admin" on public.invitations
  for all using (
    exists (
      select 1 from public.friends f
      where f.user_id = auth.uid() and f.is_admin = true
    )
  );

-- Token d'invitation : lecture publique pour valider lors de l'inscription
create policy "invitations_token_check" on public.invitations
  for select using (used = false and expires_at > now());

-- ---- PODCASTS ----
-- Lecture publique (non supprimés)
create policy "podcasts_select_public" on public.podcasts
  for select using (is_deleted = false);

-- Insertion : amis actifs uniquement
create policy "podcasts_insert_friends" on public.podcasts
  for insert with check (
    exists (
      select 1 from public.friends f
      where f.user_id = auth.uid() and f.is_active = true
    )
  );

-- Modification : l'auteur ou l'admin
create policy "podcasts_update_author_or_admin" on public.podcasts
  for update using (
    (select user_id from public.friends where id = friend_id) = auth.uid()
    or
    exists (select 1 from public.friends f where f.user_id = auth.uid() and f.is_admin = true)
  );

-- ---- REACTIONS ----
-- Lecture publique
create policy "reactions_select_public" on public.reactions
  for select using (true);

-- Insertion/modification : amis actifs uniquement
create policy "reactions_upsert_friends" on public.reactions
  for all using (
    exists (
      select 1 from public.friends f
      where f.user_id = auth.uid() and f.is_active = true
    )
  );

-- ---- COMMENTS ----
-- Lecture publique (non supprimés)
create policy "comments_select_public" on public.comments
  for select using (is_deleted = false);

-- Insertion : amis actifs
create policy "comments_insert_friends" on public.comments
  for insert with check (
    exists (
      select 1 from public.friends f
      where f.user_id = auth.uid() and f.is_active = true
    )
  );

-- Modification/suppression : auteur ou admin
create policy "comments_update_author_or_admin" on public.comments
  for update using (
    (select user_id from public.friends where id = friend_id) = auth.uid()
    or
    exists (select 1 from public.friends f where f.user_id = auth.uid() and f.is_admin = true)
  );

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Mise à jour automatique de updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger podcasts_updated_at
  before update on public.podcasts
  for each row execute function public.handle_updated_at();

create trigger comments_updated_at
  before update on public.comments
  for each row execute function public.handle_updated_at();

-- Marquer une invitation comme utilisée et lier l'utilisateur à son profil ami
create or replace function public.use_invitation(p_token text, p_user_id uuid)
returns boolean language plpgsql security definer as $$
declare
  v_friend_id uuid;
begin
  select friend_id into v_friend_id
  from public.invitations
  where token = p_token and used = false and expires_at > now();

  if v_friend_id is null then
    return false;
  end if;

  update public.invitations set used = true where token = p_token;
  update public.friends set user_id = p_user_id, joined_at = now() where id = v_friend_id;
  return true;
end;
$$;

-- ============================================================
-- INDEX pour les performances
-- ============================================================
create index podcasts_friend_id_idx    on public.podcasts(friend_id);
create index podcasts_created_at_idx   on public.podcasts(created_at desc);
create index reactions_podcast_id_idx  on public.reactions(podcast_id);
create index comments_podcast_id_idx   on public.comments(podcast_id);
create index friends_user_id_idx       on public.friends(user_id);
