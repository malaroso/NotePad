import axiosInstance from '../config/axios';

export interface UserDetail {
    user_id: number;
    username: string;
    email: string;
    role_description: string;
    permissions: string;
}

export interface UserDetailResponse {
    status: boolean;
    data: UserDetail[];
}

export const getUserDetail = async (): Promise<UserDetailResponse> => {
    const response = await axiosInstance.get('/getuserdetail');
    return response.data;
}; 