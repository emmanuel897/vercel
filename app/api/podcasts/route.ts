import { NextResponse } from "next/server";
import { getServerSupabase, getFriendFromRequest } from "@/lib/auth";

// GET /api/podcasts — lecture publique avec filtres
export async function GET(req: Request) {
  const supabase = getServerSupabase();
  const friend = await getFriendFromRequest(req);
  const { searchParams } = new URL(req.url);

  let query = supabase
    .from("podcasts")
    .select(
      `
      *,
      friend:friends(id, display_name, bio),
      reactions(id, friend_id, type)
      `
    )
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const category = searchParams.get("category");
  if (category) query = query.eq("category", category);

  const duration = searchParams.get("duration");
  if (duration) query = query.eq("duration", duration);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Calculer les compteurs de réactions et ma réaction
  const podcasts = (data ?? []).map((p) => {
    const reactions: { friend_id: string; type: string }[] = p.reactions ?? [];
    const reaction_counts = {
      interesse: reactions.filter((r) => r.type === "interesse").length,
      pas_interesse: reactions.filter((r) => r.type === "pas_interesse").length,
      ecoute: reactions.filter((r) => r.type === "ecoute").length,
      conseille: reactions.filter((r) => r.type === "conseille").length,
    };
    const my_reaction = friend
      ? (reactions.find((r) => r.friend_id === friend.id)?.type ?? null)
      : null;

    return { ...p, reaction_counts, my_reaction, reactions: undefined };
  });

  return NextResponse.json(podcasts);
}

// POST /api/podcasts — création (amis uniquement)
export async function POST(req: Request) {
  const friend = await getFriendFromRequest(req);
  if (!friend) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { url, title, description, category, duration } = body;

  if (!url || !title) {
    return NextResponse.json(
      { error: "L'URL et le titre sont requis." },
      { status: 400 }
    );
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("podcasts")
    .insert({ url, title, description, category, duration, friend_id: friend.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
