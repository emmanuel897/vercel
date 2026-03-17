import { NextResponse } from "next/server";
import { getServerSupabase, getFriendFromRequest } from "@/lib/auth";

// POST /api/podcasts/[id]/reactions — upsert réaction (amis uniquement)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: podcast_id } = await params;
  const friend = await getFriendFromRequest(req);
  if (!friend) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { type } = await req.json();
  const validTypes = ["interesse", "pas_interesse", "ecoute", "conseille"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Type de réaction invalide." }, { status: 400 });
  }

  const supabase = getServerSupabase();

  // Vérifier si une réaction existe déjà
  const { data: existing } = await supabase
    .from("reactions")
    .select("id, type")
    .eq("friend_id", friend.id)
    .eq("podcast_id", podcast_id)
    .single();

  if (existing) {
    if (existing.type === type) {
      // Même réaction → on la retire (toggle)
      await supabase.from("reactions").delete().eq("id", existing.id);
      return NextResponse.json({ action: "removed" });
    } else {
      // Autre réaction → on met à jour
      await supabase
        .from("reactions")
        .update({ type })
        .eq("id", existing.id);
      return NextResponse.json({ action: "updated" });
    }
  }

  // Nouvelle réaction
  const { error } = await supabase
    .from("reactions")
    .insert({ friend_id: friend.id, podcast_id, type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ action: "created" }, { status: 201 });
}
