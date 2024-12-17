import axiosInstance from '../config/axios';
import { TodoResponse } from '../types/todo';

export const getAllTodos = async (): Promise<TodoResponse> => {
    const response = await axiosInstance.get('/getAllTodo');
    return response.data;
};
