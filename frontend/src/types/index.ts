import { TaskStatus } from '../constants';

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
  status: TaskStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
  due_by: string | null;
  deleted_at: string | null;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  due_by?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  due_by?: string | null;
}
