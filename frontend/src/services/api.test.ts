import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

const mockFetch = globalThis.fetch as ReturnType<typeof vi.fn>;

describe('api service mapping', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
  });

  it('sends dueBy on createTask and maps camelCase response to snake_case', async () => {
    localStorage.setItem('token', 'token-123');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 1,
        title: 'Task A',
        description: 'Desc',
        status: 'pending',
        createdBy: 7,
        createdAt: '2026-02-24T10:00:00Z',
        updatedAt: '2026-02-24T10:00:00Z',
        dueBy: '2026-06-15T00:00:00',
      }),
    });

    const result = await api.createTask({
      title: 'Task A',
      description: 'Desc',
      due_by: '2026-06-15',
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify({
        title: 'Task A',
        description: 'Desc',
        dueBy: '2026-06-15T00:00:00',
      }),
    });

    expect(result.due_by).toBe('2026-06-15T00:00:00');
    expect(result.created_by).toBe(7);
    expect(result.created_at).toBe('2026-02-24T10:00:00Z');
  });

  it('maps getTasks camelCase response fields to snake_case', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 2,
          title: 'Task B',
          description: null,
          status: 'completed',
          createdBy: 3,
          createdAt: '2026-02-23T10:00:00Z',
          updatedAt: '2026-02-24T10:00:00Z',
          dueBy: null,
          deletedAt: null,
        },
      ],
    });

    const tasks = await api.getTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      created_by: 3,
      created_at: '2026-02-23T10:00:00Z',
      updated_at: '2026-02-24T10:00:00Z',
      due_by: null,
      deleted_at: null,
    });
  });
});
