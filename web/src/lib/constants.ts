import type { ColumnDefinition } from "./types";

// Board columns, order, display metadata
export const COLUMNS: ColumnDefinition[] = [
  {
    id: "todo",
    title: "To Do",
    accent: "var(--todo-accent)",
    description: "Planned work that is ready to be picked up.",
  },
  {
    id: "in_progress",
    title: "In Progress",
    accent: "var(--progress-accent)",
    description: "Tasks actively being worked on right now.",
  },
  {
    id: "in_review",
    title: "In Review",
    accent: "var(--review-accent)",
    description: "Work awaiting feedback, approval, or QA.",
  },
  {
    id: "done",
    title: "Done",
    accent: "var(--done-accent)",
    description: "Finished work that has been fully completed.",
  },
];

