import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET /api/tasks — list all tasks
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/tasks — create a task
export async function POST(request: Request) {
  const supabase = getSupabase();
  const body = await request.json();
  const { title, description } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({ title: title.trim(), description: description ?? null, done: false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
