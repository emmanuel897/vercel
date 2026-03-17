"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/useAuth";

export default function ProfilPage() {
  const router = useRouter();
  const { friend, accessToken, loading: authLoading } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !friend) router.push("/login");
    if (friend) {
      setDisplayName(friend.display_name);
      setBio(friend.bio ?? "");
    }
  }, [authLoading, friend, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!friend || !accessToken) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/friends/${friend.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ display_name: displayName, bio }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !friend) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-400 text-sm">
          Chargement…
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon profil</h1>

        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 mb-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
              Profil mis à jour avec succès.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom / Pseudo
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Enregistrement…" : "Sauvegarder"}
          </button>
        </form>

        {/* Informations sur les données personnelles */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <h2 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>🔒</span> Vos données personnelles
          </h2>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>
              <strong>Données collectées :</strong> prénom/pseudo, bio
              (optionnel), adresse e-mail (pour l'authentification uniquement).
            </li>
            <li>
              <strong>Finalité :</strong> vous permettre de publier et de
              commenter des podcasts au sein de la communauté privée.
            </li>
            <li>
              <strong>Durée de conservation :</strong> tant que votre compte est
              actif. En cas de désactivation, vos données sont conservées
              anonymisées.
            </li>
            <li>
              <strong>Vos droits :</strong> accès, rectification, effacement.
              Contactez l'administrateur pour toute demande.
            </li>
          </ul>
          <p className="mt-3 text-xs text-blue-500">
            Conformément au RGPD et à la loi Informatique et Libertés (CNIL).
          </p>
        </div>
      </main>
    </>
  );
}
