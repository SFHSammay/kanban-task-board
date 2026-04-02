type BoardHeaderProps = {
  total: number;
  completed: number;
  overdue: number;
  search: string;
  priority: string;
  composerOpen: boolean;
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onComposerToggle: () => void;
};

export function BoardHeader({
  total,
  completed,
  overdue,
  search,
  priority,
  composerOpen,
  onSearchChange,
  onPriorityChange,
  onComposerToggle,
}: BoardHeaderProps) {
  return (
    <section className="topbar card-shell">
      <div className="topbar-brand">
        <h1>Kanban Board</h1>
      </div>
      <div className="topbar-controls">
        <label className="search-control">
          <input
            aria-label="Search tasks"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Find a task by title"
          />
        </label>
        <label className="priority-control">
          <select aria-label="Filter by priority" value={priority} onChange={(event) => onPriorityChange(event.target.value)}>
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </label>
        <button className="primary-button topbar-action" type="button" onClick={onComposerToggle}>
          {composerOpen ? "Close" : "Add task"}
        </button>
      </div>
      <div className="topbar-stats">
        <article className="stat-card">
          <span>Total tasks</span>
          <strong>{total}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{completed}</strong>
        </article>
        <article className="stat-card">
          <span>Overdue</span>
          <strong>{overdue}</strong>
        </article>
      </div>
    </section>
  );
}
