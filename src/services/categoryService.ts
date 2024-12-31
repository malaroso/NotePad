import axiosInstance from '../config/axios';

export type Category = {
  category_id: number;
  user_id: number;
  name: string;
  created_at: string;
};

type CategoryResponse = {
  status: boolean;
  data: Category[];
};

export const getCategories = async (): Promise<CategoryResponse> => {
  try {
    const response = await axiosInstance.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    throw error;
  }
};

// Kategori ekleme fonksiyonu
export const addCategory = async (name: string) => {
  try {
    const response = await axiosInstance.post('/categories', {
      name: name
    });
    return response.data;
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    throw error;
  }
};

// Kategoriye ait notları getiren fonksiyon
export const getCategoryNotes = async (categoryId: number) => {
  try {
    const response = await axiosInstance.get(`/categories/${categoryId}/notes`);
    return response.data;
  } catch (error) {
    console.error('Kategori notları getirme hatası:', error);
    throw error;
  }
};

type DeleteCategoryResponse = {
  status: boolean;
  message?: string;
};

export const deleteCategory = async (categoryId: number): Promise<DeleteCategoryResponse> => {
  try {
    const response = await axiosInstance.delete('/categories', {
      data: { category_id: categoryId }
    });
    return response.data;
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    throw error;
  }
};

type CategoryNameResponse = {
  status: boolean;
  data: {
    name: string;
  };
};

export const getCategoryName = async (categoryId: number): Promise<CategoryNameResponse> => {
  try {
    const response = await axiosInstance.get(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Kategori adı getirme hatası:', error);
    throw error;
  }
}; 