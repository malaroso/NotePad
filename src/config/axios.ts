import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import eventEmitter from '../utils/eventEmitter';
import { API_URL } from './constants';

const TOKEN_KEY = 'auth_token';

console.log('Creating axios instance with baseURL:', API_URL);

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
            handleAuthError();
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
            await handleAuthError();
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

const handleAuthError = async () => {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        eventEmitter.emit('auth_error');
    } catch (error) {
        console.error('Auth error handling failed:', error);
    }
};

export default axiosInstance; 