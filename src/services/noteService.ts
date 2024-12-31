import axios from '../config/axios';
import { Note } from '../types/note';

type NotesResponse = {
  status: boolean;
  data: Note[];
};

type NoteDetailResponse = {
  status: boolean;
  data: Note;
};

export type AddNoteRequest = {
  title: string;
  content: string;
  category_id?: number | null;
  is_public: number;
};

type AddNoteResponse = {
  status: boolean;
  message?: string;
  data?: Note;
};

type UpdateNoteRequest = {
  note_id: number;
  title: string;
  content: string;
  category_id?: number | null;
  is_public: number;
};

type UpdateNoteResponse = {
  status: boolean;
  message?: string;
  data?: Note;
};

type DeleteNoteResponse = {
  status: boolean;
  message?: string;
};

export const getAllNotes = async (): Promise<NotesResponse> => {
  try {
    const response = await axios.get<NotesResponse>('/getNotes');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNoteDetail = async (noteId: number): Promise<NoteDetailResponse> => {
  try {
    const response = await axios.get<NoteDetailResponse>(`/getNotes/${noteId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addNote = async (noteData: AddNoteRequest) => {
  try {
    console.log('API isteği verisi:', {
      title: noteData.title,
      content: noteData.content,
      category_id: noteData.category_id,
      is_public: noteData.is_public
    });

    const response = await axios.post('/addNote', {
      title: noteData.title,
      content: noteData.content,
      category_id: noteData.category_id,
      is_public: noteData.is_public
    });

    console.log('API yanıtı:', response.data);

    return response.data;
  } catch (error) {
    console.error('Not ekleme hatası:', error);
    throw error;
  }
};

export const updateNote = async (noteData: UpdateNoteRequest): Promise<UpdateNoteResponse> => {
  try {
    const response = await axios.put<UpdateNoteResponse>('/notes', noteData);
    return response.data;
  } catch (error) {
    console.error('Not güncelleme hatası:', error);
    throw error;
  }
};

export const deleteNote = async (noteId: number): Promise<DeleteNoteResponse> => {
  try {
    const response = await axios.delete<DeleteNoteResponse>('/notes', {
      data: { note_id: noteId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 