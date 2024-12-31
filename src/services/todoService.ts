import axiosInstance from '../config/axios';
import { TodoResponse } from '../types/todo';

export const getAllTodos = async (): Promise<TodoResponse> => {
    const response = await axiosInstance.get('/getAllTodo');
    return response.data;
};

export const addTodo = async (todo: { task: string; owner_id: number }) => {
  try {
    const response = await axiosInstance.post('/addTodo', todo);
    return response.data;
  } catch (error) {
    console.error('Todo ekleme hatası:', error);
    throw error;
  }
};

// Todo status güncelleme fonksiyonu
export const updateTodoStatus = async (todoId: number, status: 'completed' | 'not_completed') => {
  try {
    const response = await axiosInstance.post('/updateTodoStatus', {
      todoId,
      status
    });
    return response.data;
  } catch (error) {
    console.error('Todo status güncelleme hatası:', error);
    throw error;
  }
};

// Todo silme fonksiyonu
export const deleteTodo = async (eventId: string) => {
  try {
    const response = await axiosInstance.post('/deleteTodo', {
      event_id: eventId
    });
    return response.data;
  } catch (error) {
    console.error('Todo silme hatası:', error);
    throw error;
  }
};
