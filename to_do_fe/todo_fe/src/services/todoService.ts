import apiClient from './api';
import type { ApiResponse } from '../types/todo'; 
import type { Todo, NewTodoData } from '../types/todo';

/**
 * Fetches ALL todos from the backend at once.
 */
export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await apiClient.get<ApiResponse<Todo[]>>('/tasks/');
  return response.data.data;
};

/**
 * Creates a new todo item.
 */
export const createTodo = async (data: NewTodoData): Promise<Todo> => {
  // THE FIX: Expect the ApiResponse wrapper and return response.data.data
  const response = await apiClient.post<ApiResponse<Todo>>('/tasks/', data);
  return response.data.data;
};

/**
 * Updates an existing todo item.
 */
export const updateTodo = async (id: number, data: Partial<NewTodoData | { is_completed: boolean }>): Promise<Todo> => {
  // THE FIX: Expect the ApiResponse wrapper and return response.data.data
  const response = await apiClient.patch<ApiResponse<Todo>>(`/tasks/${id}/`, data);
  return response.data.data;
};

/**
 * Deletes a todo item.
 */
export const deleteTodo = async (id: number): Promise<void> => {
  await apiClient.delete(`/tasks/${id}/`);
};
