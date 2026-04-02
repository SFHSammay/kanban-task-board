export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "normal" | "high";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
};

export type TaskInput = {
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
};

export type ColumnDefinition = {
  id: TaskStatus; //Using TaskStatus as the type for id ensures that it can only be one of the defined statuses
  title: string;
  accent: string; // Accent color for the column header
  description: string;
};

