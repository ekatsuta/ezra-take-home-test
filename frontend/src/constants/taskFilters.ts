export const TASK_FILTERS = ['all', 'pending', 'completed'] as const;
export type TaskFilter = (typeof TASK_FILTERS)[number];

export const TASK_FILTER_LABELS: Record<TaskFilter, string> = {
  all: 'All',
  pending: 'Pending',
  completed: 'Completed',
};
