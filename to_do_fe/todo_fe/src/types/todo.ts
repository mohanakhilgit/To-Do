export interface Todo {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null; // Added due_date
    is_completed: boolean;
    created_at: string;
    updated_at: string;
    created_by: number;
    created_by_username: string;
}

// Type for creating a new todo (id is not needed)
export type NewTodoData = Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_username' | 'is_completed'>;


export interface ApiResponse {
    success: boolean;
    status_code: number;
    message: string;
    data: Todo | Todo[]; // Can be a single Todo or an array of Todos
}
