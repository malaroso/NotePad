export interface Todo {
    id: number;
    task: string;
    status: 'completed' | 'not_completed';
    owner_id: number;
    created_at: string;
    updated_at: string;
}

export interface TodoResponse {
    status: boolean;
    data: Todo[];
} 