import axiosInstance from '../config/axios';

export interface UserDetail {
    id: number;
    username: string;
    email: string;
    phone_number: string;
    role_description: string;
    permissions: string[];
    is_active: number;
}

export interface UserDetailResponse {
    status: boolean;
    data: {
        id: number;
        username: string;
        email: string;
        phone_number: string;
        role_description: string;
        permissions: string[];
        is_active: number;
    };
}

export const getUserDetail = async (): Promise<UserDetailResponse> => {
    const response = await axiosInstance.get('/profile');
    return response.data;
};

type UpdateProfileRequest = {
  username: string;
  email: string;
  phone_number: string;
};

type UpdateProfileResponse = {
  status: boolean;
  message?: string;
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  try {
    const response = await axiosInstance.put('/profile', data);
    return response.data;
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    throw error;
  }
};

type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

type ChangePasswordResponse = {
  status: boolean;
  message?: string;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  try {
    const response = await axiosInstance.put('/profile/password', data);
    return response.data;
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    throw error;
  }
}; 