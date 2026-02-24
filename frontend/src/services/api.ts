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

type ApiTask = {
  id: number;
  title: string;
  description: string | null;
  status: Task['status'];
  createdBy?: number;
  created_by?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  dueBy?: string | null;
  due_by?: string | null;
  deletedAt?: string | null;
  deleted_at?: string | null;
};

const mapApiTaskToTask = (task: ApiTask): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  created_by: task.created_by ?? task.createdBy ?? 0,
  created_at: task.created_at ?? task.createdAt ?? '',
  updated_at: task.updated_at ?? task.updatedAt ?? '',
  due_by: task.due_by ?? task.dueBy ?? null,
  deleted_at: task.deleted_at ?? task.deletedAt ?? null,
});

export const api = {
  getTasks: () =>
    apiRequest<ApiTask[]>('/tasks').then(tasks => tasks.map(mapApiTaskToTask)),

  createTask: (task: TaskCreate) =>
    apiRequest<ApiTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        dueBy: task.due_by ? convertDateToISO(task.due_by) : undefined,
      }),
    }).then(mapApiTaskToTask),

  updateTask: (id: number, task: TaskUpdate) =>
    apiRequest<ApiTask>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        status: task.status,
        dueBy: task.due_by ? convertDateToISO(task.due_by) : undefined,
      }),
    }).then(mapApiTaskToTask),

  deleteTask: (id: number) =>
    apiRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
