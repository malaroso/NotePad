import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './constants';
import { Alert } from 'react-native';

const TOKEN_KEY = 'auth_token';

console.log('Creating axios instance with baseURL:', API_URL);

let logoutCallback: (() => void) | null = null;
let isTokenErrorHandled = false;

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

const handleTokenError = async () => {
    if (isTokenErrorHandled) return;
    
    isTokenErrorHandled = true;
    
    Alert.alert(
        "Oturum Süresi Doldu",
        "Güvenliğiniz için oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.",
        [
            {
                text: "Tamam",
                onPress: async () => {
                    await handleLogout();
                    isTokenErrorHandled = false;
                }
            }
        ]
    );
};

axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data?.status === false && response.data?.message?.includes('Token')) {
            handleTokenError();
        }
        return response;
    },
    async (error) => {
        if (
            error.response?.status === 401 || 
            error.response?.data?.message?.includes('Token') ||
            error.response?.data?.message?.includes('token')
        ) {
            handleTokenError();
            return Promise.reject(error);
        }

        console.log('Response error full details:', {
            message: error.message,
            code: error.code,
            response: error.response,
            request: error.request,
            config: error.config
        });

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