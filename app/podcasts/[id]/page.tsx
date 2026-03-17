"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/useAuth";
import type { Podcast, Comment, ReactionType } from "@/lib/supabase";
import { REACTION_CONFIG, PODCAST_DURATIONS } from "@/lib/supabase";

export default function PodcastDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { friend, accessToken } = useAuth();

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  function buildHeaders(): HeadersInit {
    if (accessToken) return { Authorization: `Bearer ${accessToken}` };
    return {};
  }

  async function fetchPodcast() {
    try {
      const res = await fetch(`/api/podcasts/${id}`, { headers: buildHeaders() });
      if (!res.ok) throw new Error("Podcast introuvable.");
      const data = await res.json();
      setPodcast(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  async function fetchComments() {
    try {
      const res = await fetch(`/api/podcasts/${id}/comments`, {
        headers: buildHeaders(),
      });
      if (res.ok) setComments(await res.json());
    } catch {}
  }

  useEffect(() => {
    Promise.all([fetchPodcast(), fetchComments()]).finally(() =>
      setLoading(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, accessToken]);

  async function handleReaction(type: ReactionType) {
    if (!accessToken) return;
    await fetch(`/api/podcasts/${id}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ type }),
    });
    fetchPodcast();
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !accessToken) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/podcasts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'envoi.");
      setCommentText("");
      fetchComments();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleEditComment(commentId: string) {
    if (!editCommentText.trim() || !accessToken) return;
    await fetch(`/api/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content: editCommentText.trim() }),
    });
    setEditCommentId(null);
    fetchComments();
  }

  async function handleDeleteComment(commentId: string) {
    if (!accessToken) return;
    if (!confirm("Supprimer ce commentaire ?")) return;
    await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    fetchComments();
  }

  async function handleDeletePodcast() {
    if (!accessToken || !friend?.is_admin) return;
    if (!confirm("Supprimer ce podcast et tous ses commentaires ?")) return;
    await fetch(`/api/podcasts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    router.push("/");
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center text-gray-400 text-sm">
          Chargement…
        </main>
      </>
    );
  }

  if (error || !podcast) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-red-500">{error ?? "Podcast introuvable."}</p>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
            Retour à l'accueil
          </Link>
        </main>
      </>
    );
  }

  const counts = podcast.reaction_counts ?? {
    interesse: 0,
    pas_interesse: 0,
    ecoute: 0,
    conseille: 0,
  };

  const durationLabel =
    PODCAST_DURATIONS.find((d) => d.value === podcast.duration)?.label ?? "";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Fil d'ariane */}
        <nav className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-indigo-600">
            Accueil
          </Link>{" "}
          / <span className="text-gray-600">{podcast.title}</span>
        </nav>

        {/* Fiche podcast */}
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {podcast.category}
            </span>
            <span className="bg-gray-50 text-gray-500 text-xs px-2.5 py-0.5 rounded-full">
              {durationLabel}
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-800 mb-1">{podcast.title}</h1>

          <p className="text-sm text-gray-400 mb-4">
            Partagé par{" "}
            <span className="font-medium text-gray-600">
              {podcast.friend?.display_name ?? "un ami"}
            </span>{" "}
            ·{" "}
            {new Date(podcast.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {podcast.description && (
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              {podcast.description}
            </p>
          )}

          <a
            href={podcast.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            🎧 Écouter le podcast
          </a>

          {friend?.is_admin && (
            <button
              onClick={handleDeletePodcast}
              className="ml-3 text-xs text-red-400 hover:text-red-600"
            >
              Supprimer
            </button>
          )}
        </article>

        {/* Réactions */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Réactions des amis
          </h2>
          <div className="flex flex-wrap gap-3">
            {(
              Object.entries(REACTION_CONFIG) as [
                ReactionType,
                { emoji: string; label: string }
              ][]
            ).map(([type, cfg]) => (
              <button
                key={type}
                onClick={() => friend && handleReaction(type)}
                disabled={!friend}
                title={friend ? cfg.label : "Connectez-vous pour réagir"}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors
                  ${
                    podcast.my_reaction === type
                      ? "bg-indigo-600 text-white border-indigo-600 font-medium"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300"
                  }
                  ${!friend ? "cursor-default opacity-60" : "cursor-pointer"}
                `}
              >
                <span className="text-lg">{cfg.emoji}</span>
                <span>{cfg.label}</span>
                <span className="bg-white bg-opacity-30 rounded-full px-2 py-0.5 text-xs font-bold">
                  {counts[type]}
                </span>
              </button>
            ))}
          </div>
          {!friend && (
            <p className="mt-3 text-xs text-gray-400">
              <Link href="/login" className="text-indigo-600 hover:underline">
                Connectez-vous
              </Link>{" "}
              pour indiquer votre réaction.
            </p>
          )}
        </section>

        {/* Commentaires */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">
            Commentaires ({comments.length})
          </h2>

          {/* Formulaire de commentaire */}
          {friend ? (
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Votre commentaire…"
                rows={3}
                maxLength={2000}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="mt-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submittingComment ? "Envoi…" : "Commenter"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-400 mb-6">
              <Link href="/login" className="text-indigo-600 hover:underline">
                Connectez-vous
              </Link>{" "}
              pour laisser un commentaire.
            </p>
          )}

          {/* Liste des commentaires */}
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucun commentaire pour l'instant.
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => {
                const isOwner = comment.friend_id === friend?.id;
                const canDelete = isOwner || friend?.is_admin;

                return (
                  <li key={comment.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                      {comment.friend?.display_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {comment.friend?.display_name ?? "Anonyme"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                        {comment.updated_at !== comment.created_at && (
                          <span className="text-xs text-gray-300">(modifié)</span>
                        )}
                      </div>

                      {editCommentId === comment.id ? (
                        <div>
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                          />
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              className="text-xs text-indigo-600 hover:underline"
                            >
                              Sauvegarder
                            </button>
                            <button
                              onClick={() => setEditCommentId(null)}
                              className="text-xs text-gray-400 hover:underline"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}

                      {editCommentId !== comment.id && (
                        <div className="flex gap-3 mt-1">
                          {isOwner && (
                            <button
                              onClick={() => {
                                setEditCommentId(comment.id);
                                setEditCommentText(comment.content);
                              }}
                              className="text-xs text-gray-400 hover:text-indigo-600"
                            >
                              Modifier
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-xs text-gray-400 hover:text-red-500"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
