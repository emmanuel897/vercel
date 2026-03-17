import { NextResponse } from "next/server";
import { getServerSupabase, getFriendFromRequest, isAdmin } from "@/lib/auth";

// GET /api/podcasts/[id] — lecture publique détaillée
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getServerSupabase();
  const friend = await getFriendFromRequest(req);

  const { data, error } = await supabase
    .from("podcasts")
    .select(
      `
      *,
      friend:friends(id, display_name, bio),
      reactions(id, friend_id, type)
      `
    )
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Podcast introuvable." }, { status: 404 });
  }

  const reactions: { friend_id: string; type: string }[] = data.reactions ?? [];
  const reaction_counts = {
    interesse: reactions.filter((r) => r.type === "interesse").length,
    pas_interesse: reactions.filter((r) => r.type === "pas_interesse").length,
    ecoute: reactions.filter((r) => r.type === "ecoute").length,
    conseille: reactions.filter((r) => r.type === "conseille").length,
  };
  const my_reaction = friend
    ? (reactions.find((r) => r.friend_id === friend.id)?.type ?? null)
    : null;

  return NextResponse.json({ ...data, reaction_counts, my_reaction, reactions: undefined });
}

// DELETE /api/podcasts/[id] — suppression logique (admin uniquement)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const friend = await getFriendFromRequest(req);
  if (!isAdmin(friend)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("podcasts")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
