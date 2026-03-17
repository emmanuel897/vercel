"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import type { Friend } from "./supabase";

export type AuthState = {
  friend: Friend | null;
  loading: boolean;
  accessToken: string | null;
};

export function useAuth(): AuthState {
  const [friend, setFriend] = useState<Friend | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    async function loadProfile(userId: string, token: string) {
      setAccessToken(token);
      const { data } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();
      setFriend(data ?? null);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile(session.user.id, session.access_token);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          loadProfile(session.user.id, session.access_token);
        } else {
          setFriend(null);
          setAccessToken(null);
          setLoading(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return { friend, loading, accessToken };
}
