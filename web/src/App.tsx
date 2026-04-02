import { useEffect, useMemo, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createTask, listTasks, updateTaskStatus } from "./lib/api";
import { COLUMNS } from "./lib/constants";
import type { Task, TaskInput, TaskStatus } from "./lib/types";
import { useGuestSession } from "./hooks/useGuestSession";
import { BoardColumn } from "./components/BoardColumn";
import { BoardHeader } from "./components/BoardHeader";
import { TaskComposer } from "./components/TaskComposer";
import { TaskCardPreview } from "./components/TaskCard";
import { parseISO, isPast, startOfDay } from "date-fns";

function groupTasks(tasks: Task[]) {
  return COLUMNS.reduce<Record<TaskStatus, Task[]>>(
    (accumulator, column) => {
      accumulator[column.id] = tasks.filter((task) => task.status === column.id);
      return accumulator;
    },
    {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    },
  );
}

export default function App() {
  const { ready, error: sessionError } = useGuestSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (!ready) {
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        setError(null);
        setTasks(await listTasks());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load tasks.");
      } finally {
        setLoading(false);
      }
    })();
  }, [ready]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [priorityFilter, search, tasks]);

  const groupedTasks = useMemo(() => groupTasks(filteredTasks), [filteredTasks]);
  const overdueCount = useMemo(
    () =>
      tasks.filter((task) => {
        if (!task.due_date || task.status === "done") {
          return false;
        }
        return isPast(startOfDay(parseISO(task.due_date)));
      }).length,
    [tasks],
  );

  async function handleCreateTask(payload: TaskInput) {
    const createdTask = await createTask(payload);
    setTasks((current) => [createdTask, ...current]);
    setComposerOpen(false);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const draggedTask = event.active.data.current?.task as Task | undefined;
    if (!draggedTask) {
      return;
    }

    const overData = event.over?.data.current;
    const dropStatus =
      (overData?.status as TaskStatus | undefined) ??
      ((overData?.task as Task | undefined)?.status as TaskStatus | undefined);
    if (!dropStatus || dropStatus === draggedTask.status) {
      return;
    }

    const previousStatus = draggedTask.status;
    setTasks((current) =>
      current.map((task) => (task.id === draggedTask.id ? { ...task, status: dropStatus } : task)),
    );

    try {
      const updated = await updateTaskStatus(draggedTask.id, dropStatus);
      setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
    } catch (updateError) {
      setTasks((current) =>
        current.map((task) => (task.id === draggedTask.id ? { ...task, status: previousStatus } : task)),
      );
      setError(updateError instanceof Error ? updateError.message : "Could not move task.");
    }
  }

  const content = (() => {
    if (sessionError) {
      return <section className="status-panel error">Guest authentication failed: {sessionError}</section>;
    }

    if (!ready || loading) {
      return (
        <section className="status-panel">
          <div className="spinner" />
          <p>Preparing your private guest workspace...</p>
        </section>
      );
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <section className="board-grid">
          {COLUMNS.map((column) => (
            <BoardColumn key={column.id} column={column} tasks={groupedTasks[column.id]} />
          ))}
        </section>
        <DragOverlay>{activeTask ? <TaskCardPreview task={activeTask} /> : null}</DragOverlay>
      </DndContext>
    );
  })();

  return (
    <main className="app-shell">
      <BoardHeader
        total={tasks.length}
        completed={tasks.filter((task) => task.status === "done").length}
        overdue={overdueCount}
        search={search}
        priority={priorityFilter}
        composerOpen={composerOpen}
        onSearchChange={setSearch}
        onPriorityChange={setPriorityFilter}
        onComposerToggle={() => setComposerOpen((current) => !current)}
      />
      <TaskComposer
        onCreate={handleCreateTask}
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        disabled={!ready}
      />
      {error ? <section className="status-panel error">{error}</section> : null}
      {content}
    </main>
  );
}
