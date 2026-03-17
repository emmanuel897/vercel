"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/useAuth";
import {
  PODCAST_CATEGORIES,
  PODCAST_DURATIONS,
  type PodcastCategory,
  type PodcastDuration,
} from "@/lib/supabase";

export default function NouveauPodcastPage() {
  const router = useRouter();
  const { friend, accessToken, loading: authLoading } = useAuth();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PodcastCategory>("Autre");
  const [duration, setDuration] = useState<PodcastDuration>("moyenne");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && !friend) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center text-gray-500">
          <p>Vous devez être connecté en tant qu'ami pour partager un podcast.</p>
        </main>
      </>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/podcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url, title, description, category, duration }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Erreur lors de la publication.");
      }
      const podcast = await res.json();
      router.push(`/podcasts/${podcast.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Partager un podcast
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lien du podcast <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://open.spotify.com/episode/..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Nom du podcast ou de l'épisode"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pourquoi le partager ?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Ce qui vous a marqué, à qui vous le recommandez…"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PodcastCategory)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {PODCAST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as PodcastDuration)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {PODCAST_DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Publication…" : "Publier"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
