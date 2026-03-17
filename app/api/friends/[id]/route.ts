import { NextResponse } from "next/server";
import { getServerSupabase, getFriendFromRequest, isAdmin } from "@/lib/auth";

// PATCH /api/friends/[id] — modifier un ami (admin ou soi-même)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const me = await getFriendFromRequest(req);
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const isSelf = me.id === id;
  if (!isSelf && !isAdmin(me)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.display_name !== undefined) updates.display_name = body.display_name.trim();
  if (body.bio !== undefined) updates.bio = body.bio?.trim() ?? null;

  // Seul l'admin peut activer/désactiver
  if (isAdmin(me) && body.is_active !== undefined) {
    updates.is_active = body.is_active;
  }

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("friends")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
