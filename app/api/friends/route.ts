import { NextResponse } from "next/server";
import { getServerSupabase, getFriendFromRequest, isAdmin } from "@/lib/auth";

// GET /api/friends — liste des amis (admin uniquement)
export async function GET(req: Request) {
  const friend = await getFriendFromRequest(req);
  if (!isAdmin(friend)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/friends — créer un ami + invitation (admin uniquement)
export async function POST(req: Request) {
  const admin = await getFriendFromRequest(req);
  if (!isAdmin(admin)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { display_name, bio, email } = await req.json();
  if (!display_name?.trim()) {
    return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
  }

  const supabase = getServerSupabase();

  // Créer le profil ami
  const { data: newFriend, error: friendError } = await supabase
    .from("friends")
    .insert({ display_name: display_name.trim(), bio: bio?.trim() ?? null })
    .select()
    .single();

  if (friendError || !newFriend) {
    return NextResponse.json({ error: friendError?.message ?? "Erreur" }, { status: 500 });
  }

  // Créer le token d'invitation
  const { data: invitation, error: inviteError } = await supabase
    .from("invitations")
    .insert({ friend_id: newFriend.id, email: email?.trim() ?? null })
    .select()
    .single();

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  return NextResponse.json({ friend: newFriend, invitation }, { status: 201 });
}
