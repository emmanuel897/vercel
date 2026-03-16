import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/tasks/:id — update title, description or done
export async function PATCH(request: Request, { params }: Params) {
  const supabase = getSupabase();
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("tasks")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/tasks/:id — delete a task
export async function DELETE(_: Request, { params }: Params) {
  const supabase = getSupabase();
  const { id } = await params;

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
