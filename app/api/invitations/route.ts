import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/auth";

// POST /api/invitations — valider un token d'invitation et créer le compte
export async function POST(req: Request) {
  const { token, email, password } = await req.json();

  if (!token || !email || !password) {
    return NextResponse.json(
      { error: "Token, email et mot de passe requis." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  const adminSupabase = getAdminSupabase();

  // Vérifier le token via le client admin (bypasse RLS pour avoir un message précis)
  const { data: invitation } = await adminSupabase
    .from("invitations")
    .select("id, friend_id, used, expires_at")
    .eq("token", token)
    .single();

  if (!invitation) {
    return NextResponse.json(
      { error: "Token d'invitation introuvable." },
      { status: 400 }
    );
  }
  if (invitation.used) {
    return NextResponse.json(
      { error: "Cette invitation a déjà été utilisée." },
      { status: 400 }
    );
  }
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Cette invitation a expiré. Contactez l'administrateur pour un nouveau lien." },
      { status: 400 }
    );
  }

  // Créer le compte avec email déjà confirmé (bypasse l'email de confirmation)
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Erreur lors de la création du compte." },
      { status: 400 }
    );
  }

  // Lier l'utilisateur à son profil ami via la fonction SQL
  const { data: linked } = await adminSupabase.rpc("use_invitation", {
    p_token: token,
    p_user_id: authData.user.id,
  });

  if (!linked) {
    return NextResponse.json(
      { error: "Impossible d'activer l'invitation." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
