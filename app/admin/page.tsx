"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/useAuth";
import type { Friend, Invitation } from "@/lib/supabase";

type FriendWithInvitation = Friend & { invitation?: Invitation };

export default function AdminPage() {
  const router = useRouter();
  const { friend, accessToken, loading: authLoading } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulaire ajout ami
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<FriendWithInvitation | null>(null);

  useEffect(() => {
    if (!authLoading && (!friend || !friend.is_admin)) {
      router.push("/");
    }
  }, [authLoading, friend, router]);

  async function fetchFriends() {
    if (!accessToken) return;
    try {
      const res = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Erreur");
      setFriends(await res.json());
    } catch {
      setError("Impossible de charger la liste des amis.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken && friend?.is_admin) fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, friend]);

  async function handleAddFriend(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          display_name: newName,
          bio: newBio,
          email: newEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCreatedInvitation({ ...json.friend, invitation: json.invitation });
      setNewName("");
      setNewBio("");
      setNewEmail("");
      setShowForm(false);
      fetchFriends();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(f: Friend) {
    await fetch(`/api/friends/${f.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ is_active: !f.is_active }),
    });
    fetchFriends();
  }

  if (authLoading || (!friend?.is_admin && !authLoading)) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center text-gray-400 text-sm">
          Vérification des droits…
        </main>
      </>
    );
  }

  const inviteUrl = createdInvitation?.invitation
    ? `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/invitation/${createdInvitation.invitation.token}`
    : "";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Administration
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestion des amis et des invitations
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            + Inviter un ami
          </button>
        </div>

        {/* Lien d'invitation créé */}
        {createdInvitation && createdInvitation.invitation && (
          <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-5">
            <h3 className="font-semibold text-green-800 mb-2">
              ✅ Invitation créée pour {createdInvitation.display_name}
            </h3>
            <p className="text-sm text-green-700 mb-3">
              Envoyez ce lien à votre ami. Il expire dans 48h.
            </p>
            <div className="flex gap-2 items-center">
              <code className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all">
                {inviteUrl}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(inviteUrl)}
                className="shrink-0 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
              >
                Copier
              </button>
            </div>
            <button
              onClick={() => setCreatedInvitation(null)}
              className="mt-3 text-xs text-green-600 hover:underline"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Formulaire d'ajout */}
        {showForm && (
          <form
            onSubmit={handleAddFriend}
            className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
          >
            <h2 className="font-semibold text-gray-700">Nouvel ami</h2>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom / Pseudo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio (optionnel)
              </label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail (pour l'invitation, optionnel)
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="ami@exemple.fr"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Création…" : "Créer et générer le lien"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Liste des amis */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-700">
              Amis ({friends.length})
            </h2>
          </div>

          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">
              Chargement…
            </p>
          ) : friends.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">
              Aucun ami pour l'instant.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {friends.map((f) => (
                <li key={f.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                    {f.display_name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 text-sm">
                        {f.display_name}
                      </span>
                      {f.is_admin && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          f.is_active
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {f.is_active ? "Actif" : "Inactif"}
                      </span>
                      {!f.joined_at && (
                        <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">
                          Invitation en attente
                        </span>
                      )}
                    </div>
                    {f.bio && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {f.bio}
                      </p>
                    )}
                    <p className="text-xs text-gray-300 mt-0.5">
                      Invité le{" "}
                      {new Date(f.invited_at).toLocaleDateString("fr-FR")}
                      {f.joined_at &&
                        ` · Rejoint le ${new Date(f.joined_at).toLocaleDateString("fr-FR")}`}
                    </p>
                  </div>

                  {!f.is_admin && (
                    <button
                      onClick={() => toggleActive(f)}
                      className={`shrink-0 text-xs rounded-lg px-3 py-1.5 font-medium transition-colors ${
                        f.is_active
                          ? "bg-red-50 text-red-500 hover:bg-red-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {f.is_active ? "Désactiver" : "Réactiver"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-indigo-600 hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </>
  );
}
