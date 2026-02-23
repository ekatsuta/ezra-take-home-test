export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  created_by: number;
  created_at: string;
  updated_at: string;
  due_by: string | null;
  deleted_at: string | null;
}

export interface TaskCreate {
  title: string;
  description?: string;
  due_by?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
  due_by?: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}
