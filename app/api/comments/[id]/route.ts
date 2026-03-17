import { NextResponse } from "next/server";
import { getServerSupabase, getFriendFromRequest, isAdmin } from "@/lib/auth";

// PATCH /api/comments/[id] — modification (auteur uniquement)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const friend = await getFriendFromRequest(req);
  if (!friend) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Le contenu est requis." }, { status: 400 });
  }

  const supabase = getServerSupabase();

  // Vérifier que le commentaire appartient à l'ami
  const { data: comment } = await supabase
    .from("comments")
    .select("friend_id")
    .eq("id", id)
    .single();

  if (!comment) {
    return NextResponse.json({ error: "Commentaire introuvable." }, { status: 404 });
  }
  if (comment.friend_id !== friend.id && !isAdmin(friend)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { error } = await supabase
    .from("comments")
    .update({ content: content.trim() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/comments/[id] — suppression logique (auteur ou admin)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const friend = await getFriendFromRequest(req);
  if (!friend) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supabase = getServerSupabase();

  const { data: comment } = await supabase
    .from("comments")
    .select("friend_id")
    .eq("id", id)
    .single();

  if (!comment) {
    return NextResponse.json({ error: "Commentaire introuvable." }, { status: 404 });
  }
  if (comment.friend_id !== friend.id && !isAdmin(friend)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { error } = await supabase
    .from("comments")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
