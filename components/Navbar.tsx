"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { getSupabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const { friend, loading } = useAuth();

  async function handleLogout() {
    await getSupabase().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
      <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-indigo-700 font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🎙️</span>
          <span className="hidden sm:inline">Ma Communauté</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {loading ? (
            <span className="text-gray-400 text-xs">Chargement…</span>
          ) : friend ? (
            <>
              {friend.is_admin && (
                <Link
                  href="/admin"
                  className="text-purple-600 font-medium hover:underline"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/podcasts/nouveau"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                + Partager
              </Link>
              <Link
                href="/profil"
                className="text-gray-600 hover:text-gray-900"
              >
                {friend.display_name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
