import { Task, TaskCreate, TaskUpdate } from '../types';
import { parseApiError } from '../utils/apiErrors';
import { convertDateToISO } from '../utils/date';

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
    const errorMessage = await parseApiError(response);
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export const api = {
  getTasks: () => apiRequest<Task[]>('/tasks'),

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
