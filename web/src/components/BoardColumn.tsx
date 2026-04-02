import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import clsx from "clsx";
import type { CSSProperties } from "react";
import type { ColumnDefinition, Task } from "../lib/types";
import { TaskCard } from "./TaskCard";

type BoardColumnProps = {
  column: ColumnDefinition;
  tasks: Task[];
};

export function BoardColumn({ column, tasks }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", status: column.id },
  });

  return (
    <section
      ref={setNodeRef}
      className={clsx("board-column", { over: isOver })}
      style={{ "--column-accent": column.accent } as CSSProperties}
    >
      <header className="board-column-header">
        <div>
          <p>{column.title}</p>
          <span>{column.description}</span>
        </div>
        <strong>{tasks.length}</strong>
      </header>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className={clsx("column-body", { sparse: tasks.length > 0 && tasks.length <= 2 })}>
          {tasks.length ? (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="empty-column">
              <p>Nothing here yet.</p>
              <span>Drop a task into {column.title.toLowerCase()} to keep the workstream moving.</span>
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
