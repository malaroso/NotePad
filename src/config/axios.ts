import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './constants';

const TOKEN_KEY = 'auth_token';

console.log('Creating axios instance with baseURL:', API_URL);

let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (callback: () => void) => {
    logoutCallback = callback;
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

console.log('Axios instance baseURL:', axiosInstance.defaults.baseURL);

axiosInstance.interceptors.request.use(
    async (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('Full request URL:', fullUrl);
        console.log('Request body:', config.data);
        console.log('Request config:', {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            headers: config.headers,
            data: config.data
        });
        
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.log('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data?.status === false && response.data?.message?.includes('Token')) {
            handleLogout();
        }
        console.log('Response data:', response.data);
        return response;
    },
    async (error) => {
        console.log('Response error full details:', {
            message: error.message,
            code: error.code,
            response: error.response,
            request: error.request,
            config: error.config
        });

        if (
            error.response?.status === 401 || 
            error.response?.data?.message?.includes('Token') ||
            error.response?.data?.message?.includes('token')
        ) {

            await handleLogout();
            return Promise.reject({
                message: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.'
            });
        }

        if (!error.response) {
            return Promise.reject({
                message: 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.'
            });
        }

        if (error.response.status === 429) {
            return Promise.reject({
                message: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.'
            });
        }

        if (error.response.status >= 500) {
            return Promise.reject({
                message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
            });
        }

        return Promise.reject(error);
    }
);

const handleLogout = async () => {
    try {
        await SecureStore.deleteItemAsync('auth_token');
        if (logoutCallback) { //Eğer logoutCallback atanmışsa (yani null değilse), callback tetiklenir.
            await logoutCallback();
        }
    } catch (logoutError) {
        console.error("Logout error:", logoutError);
    }
};


export default axiosInstance; 