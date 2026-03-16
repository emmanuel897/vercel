"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/supabase";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  async function fetchTasks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      setTasks(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to create task");
      }
      setTitle("");
      setDescription("");
      await fetchTasks();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDone(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    await fetchTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await fetchTasks();
  }

  async function saveEdit(id: number) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDescription }),
    });
    setEditId(null);
    await fetchTasks();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Task Manager{" "}
          <span className="text-sm font-normal text-gray-400">(Supabase CRUD)</span>
        </h1>

        {/* Create form */}
        <form
          onSubmit={createTask}
          className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-700">New task</h2>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add task"}
          </button>
        </form>

        {/* Task list */}
        {loading && <p className="text-gray-500 text-sm">Loading…</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {!loading && tasks.length === 0 && (
          <p className="text-gray-400 text-sm">No tasks yet. Create one above!</p>
        )}

        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-xl bg-white p-4 shadow-sm border border-gray-100"
            >
              {editId === task.id ? (
                /* Edit mode */
                <div>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(task.id)}
                      className="rounded-lg bg-green-600 px-4 py-1 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="rounded-lg bg-gray-200 px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleDone(task)}
                    className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-gray-800 ${
                        task.done ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-0.5 text-sm text-gray-500">{task.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-300">
                      {new Date(task.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditId(task.id);
                        setEditTitle(task.title);
                        setEditDescription(task.description ?? "");
                      }}
                      className="rounded-lg bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
