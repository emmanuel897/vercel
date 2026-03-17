import { NextResponse } from "next/server";
import { getServerSupabase, getFriendFromRequest } from "@/lib/auth";

// GET /api/podcasts/[id]/comments — lecture publique
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: podcast_id } = await params;
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from("comments")
    .select("*, friend:friends(id, display_name)")
    .eq("podcast_id", podcast_id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/podcasts/[id]/comments — création (amis uniquement)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: podcast_id } = await params;
  const friend = await getFriendFromRequest(req);
  if (!friend) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Le contenu est requis." }, { status: 400 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("comments")
    .insert({ podcast_id, friend_id: friend.id, content: content.trim() })
    .select("*, friend:friends(id, display_name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
