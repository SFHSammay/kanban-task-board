import { useState } from "react";
import type { FormEvent } from "react";
import type { TaskInput, TaskPriority } from "../lib/types";

type TaskComposerProps = {
  onCreate: (payload: TaskInput) => Promise<void>;
  open: boolean;
  onClose: () => void;
  disabled?: boolean;
};

const priorities: TaskPriority[] = ["low", "normal", "high"];

export function TaskComposer({ onCreate, open, onClose, disabled }: TaskComposerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("A task title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
      });
      setTitle("");
      setDescription("");
      setPriority("normal");
      setDueDate("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create task.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="composer-overlay">
      <section className="composer card-shell">
        <form className="composer-form" onSubmit={handleSubmit}>
          <div className="composer-heading">
            <button className="composer-close" type="button" aria-label="Close task form" onClick={onClose}>
              x
            </button>
            <h2>Create a new task</h2>
          </div>
          <label>
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Design the onboarding empty state"
              disabled={disabled || submitting}
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional context, acceptance criteria, or handoff notes"
              rows={4}
              disabled={disabled || submitting}
            />
          </label>
          <div className="composer-grid">
            <label>
              Priority
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
                disabled={disabled || submitting}
              >
                {priorities.map((level) => (
                  <option key={level} value={level}>
                    {level[0].toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Due date
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                disabled={disabled || submitting}
              />
            </label>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={disabled || submitting}>
            {submitting ? "Creating..." : "Create task"}
          </button>
        </form>
      </section>
    </div>
  );
}
