import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Client Supabase (singleton)
// ============================================================

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Variables manquantes : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  _client = createClient(url, key);
  return _client;
}

// ============================================================
// Types de l'application
// ============================================================

export type PodcastCategory =
  | "Culture"
  | "Science"
  | "Société"
  | "Histoire"
  | "Humour"
  | "Autre";

export type PodcastDuration = "courte" | "moyenne" | "longue";

export type ReactionType =
  | "interesse"
  | "pas_interesse"
  | "ecoute"
  | "conseille";

export type Friend = {
  id: string;
  user_id: string | null;
  display_name: string;
  bio: string | null;
  is_active: boolean;
  is_admin: boolean;
  invited_at: string;
  joined_at: string | null;
  created_at: string;
};

export type Invitation = {
  id: string;
  token: string;
  email: string | null;
  friend_id: string;
  used: boolean;
  expires_at: string;
  created_at: string;
};

export type Podcast = {
  id: string;
  friend_id: string;
  url: string;
  title: string;
  description: string | null;
  category: PodcastCategory;
  duration: PodcastDuration;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Relations jointes
  friend?: Friend;
  reactions?: Reaction[];
  comments?: Comment[];
  reaction_counts?: ReactionCounts;
  my_reaction?: ReactionType | null;
};

export type Reaction = {
  id: string;
  friend_id: string;
  podcast_id: string;
  type: ReactionType;
  created_at: string;
  friend?: Friend;
};

export type ReactionCounts = {
  interesse: number;
  pas_interesse: number;
  ecoute: number;
  conseille: number;
};

export type Comment = {
  id: string;
  friend_id: string;
  podcast_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  friend?: Friend;
};

// ============================================================
// Constantes UI
// ============================================================

export const PODCAST_CATEGORIES: PodcastCategory[] = [
  "Culture",
  "Science",
  "Société",
  "Histoire",
  "Humour",
  "Autre",
];

export const PODCAST_DURATIONS: { value: PodcastDuration; label: string }[] = [
  { value: "courte", label: "Courte (< 30 min)" },
  { value: "moyenne", label: "Moyenne (30–60 min)" },
  { value: "longue", label: "Longue (> 60 min)" },
];

export const REACTION_CONFIG: Record<
  ReactionType,
  { emoji: string; label: string }
> = {
  interesse: { emoji: "👍", label: "Intéressé" },
  pas_interesse: { emoji: "👎", label: "Pas intéressé" },
  ecoute: { emoji: "🎧", label: "Écouté" },
  conseille: { emoji: "⭐", label: "Je conseille" },
};
