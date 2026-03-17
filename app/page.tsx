"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type {
  Podcast,
  PodcastCategory,
  PodcastDuration,
  ReactionType,
} from "@/lib/supabase";
import { REACTION_CONFIG, PODCAST_CATEGORIES } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

const DURATION_LABELS: Record<PodcastDuration, string> = {
  courte: "< 30 min",
  moyenne: "30–60 min",
  longue: "> 60 min",
};

export default function HomePage() {
  const { friend, accessToken } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [filterCategory, setFilterCategory] = useState<PodcastCategory | "">("");
  const [filterDuration, setFilterDuration] = useState<PodcastDuration | "">("");
  const [filterFriend, setFilterFriend] = useState("");

  async function fetchPodcasts() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterDuration) params.set("duration", filterDuration);
      if (filterFriend) params.set("friend", filterFriend);

      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const res = await fetch(`/api/podcasts?${params}`, { headers });
      if (!res.ok) throw new Error("Erreur lors du chargement des podcasts.");
      setPodcasts(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPodcasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterDuration, filterFriend, accessToken]);

  async function handleReaction(podcastId: string, type: ReactionType) {
    if (!accessToken) return;
    await fetch(`/api/podcasts/${podcastId}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ type }),
    });
    fetchPodcasts();
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Podcasts partagés</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Découvrez les recommandations de la communauté.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as PodcastCategory | "")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Toutes catégories</option>
            {PODCAST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value as PodcastDuration | "")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Toutes durées</option>
            <option value="courte">Courte (&lt; 30 min)</option>
            <option value="moyenne">Moyenne (30–60 min)</option>
            <option value="longue">Longue (&gt; 60 min)</option>
          </select>
        </div>

        {/* Liste */}
        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Chargement…
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {!loading && podcasts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🎙️</div>
            <p>Aucun podcast partagé pour le moment.</p>
            {friend && (
              <Link
                href="/podcasts/nouveau"
                className="mt-4 inline-block text-indigo-600 hover:underline text-sm"
              >
                Partagez le premier !
              </Link>
            )}
          </div>
        )}

        <div className="space-y-4">
          {podcasts.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              podcast={podcast}
              isFriend={!!friend}
              onReact={(type) => handleReaction(podcast.id, type)}
            />
          ))}
        </div>
      </main>
    </>
  );
}

function PodcastCard({
  podcast,
  isFriend,
  onReact,
}: {
  podcast: Podcast;
  isFriend: boolean;
  onReact: (type: ReactionType) => void;
}) {
  const counts = podcast.reaction_counts ?? {
    interesse: 0,
    pas_interesse: 0,
    ecoute: 0,
    conseille: 0,
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
            <span className="bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">
              {podcast.category}
            </span>
            <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
              {DURATION_LABELS[podcast.duration]}
            </span>
            {podcast.friend && (
              <span>par {podcast.friend.display_name}</span>
            )}
          </div>

          <Link href={`/podcasts/${podcast.id}`}>
            <h2 className="text-base font-semibold text-gray-800 hover:text-indigo-700 transition-colors line-clamp-2">
              {podcast.title}
            </h2>
          </Link>

          {podcast.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {podcast.description}
            </p>
          )}

          <p className="text-xs text-gray-300 mt-2">
            {new Date(podcast.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <a
          href={podcast.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-indigo-50 text-indigo-600 px-3 py-2 text-xs font-medium hover:bg-indigo-100 transition-colors"
        >
          Écouter ↗
        </a>
      </div>

      {/* Réactions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.entries(REACTION_CONFIG) as [ReactionType, { emoji: string; label: string }][]).map(
          ([type, cfg]) => (
            <button
              key={type}
              onClick={() => isFriend && onReact(type)}
              disabled={!isFriend}
              title={isFriend ? cfg.label : "Connectez-vous pour réagir"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors
                ${
                  podcast.my_reaction === type
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300"
                }
                ${!isFriend ? "cursor-default opacity-70" : "cursor-pointer"}
              `}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              <span className="font-medium">{counts[type]}</span>
            </button>
          )
        )}
      </div>
    </article>
  );
}
