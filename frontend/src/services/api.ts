import { HealthResponse, Task, TaskCreate, TaskUpdate } from '../types';

const API_BASE_URL = '/api/v1';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const apiRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

const convertDateToISO = (dateString?: string): string | undefined => {
  if (!dateString) return undefined;
  // Convert YYYY-MM-DD to ISO datetime format
  return `${dateString}T00:00:00`;
};

export const api = {
  checkHealth: () => apiRequest<HealthResponse>('/health'),

  getTasks: () => apiRequest<Task[]>('/tasks'),

  getTask: (id: number) => apiRequest<Task>(`/tasks/${id}`),

  createTask: (task: TaskCreate) =>
    apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...task,
        due_by: convertDateToISO(task.due_by),
      }),
    }),

  updateTask: (id: number, task: TaskUpdate) =>
    apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...task,
        due_by: task.due_by ? convertDateToISO(task.due_by) : undefined,
      }),
    }),

  deleteTask: (id: number) =>
    apiRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
