import { formatDistanceToNowStrict, isPast, isToday, parseISO } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import type { Task } from "../lib/types";

type TaskCardProps = {
  task: Task;
};

function dueLabel(dueDate: string | null) {
  if (!dueDate) {
    return null;
  }

  const parsed = parseISO(dueDate);
  if (isToday(parsed)) {
    return "Due today";
  }

  if (isPast(parsed)) {
    return "Overdue";
  }

  return `Due in ${formatDistanceToNowStrict(parsed)}`;
}

function TaskCardBody({ task, dragging = false }: TaskCardProps & { dragging?: boolean }) {
  const due = dueLabel(task.due_date);

  return (
    <article
      className={clsx("task-card", {
        dragging,
        overdue: due === "Overdue",
      })}
    >
      <div className="task-card-top">
        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
        {due ? <span className="due-pill">{due}</span> : null}
      </div>
      <h3>{task.title}</h3>
      {task.description ? <p>{task.description}</p> : <p className="muted">No description yet. Add details to reduce back-and-forth later.</p>}
    </article>
  );
}

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardBody task={task} dragging={isDragging} />
    </div>
  );
}

export function TaskCardPreview({ task }: TaskCardProps) {
  return <TaskCardBody task={task} dragging />;
}
