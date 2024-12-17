import axiosInstance from '../config/axios';
import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import eventEmitter from '../utils/eventEmitter';
import { API_URL } from '../config/constants';
import { checkApiConnection } from '../utils/networkUtils';

interface AuthProps {
    authState?: { 
        token: string | null;
        authenticated: boolean | null;
    };
    onLogin?: (username: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'auth_token';
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}: any) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
    }>({
        token: null,
        authenticated: null
    });
    
    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            console.log('Token:', token);
            if (token) {
                setAuthState({
                    token: token,
                    authenticated: true
                });
            }
        }
        loadToken();

        // Auth hatalarını dinle
        const handleAuthError = () => {
            setAuthState({
                token: null,
                authenticated: false
            });
        };

        eventEmitter.addListener('auth_error', handleAuthError);

        return () => {
            eventEmitter.removeListener('auth_error', handleAuthError);
        };
    }, []);

    const login = async (username: string, password: string) => {
        try {
            console.log('Login attempt with:', { username, password });
            
            const response = await axiosInstance.post('/login', {
                username,
                password
            });

            console.log('Login response:', response.data);

            if (response.data.status && response.data.token) {
                const token = response.data.token;
                await SecureStore.setItemAsync(TOKEN_KEY, token);
                
                setAuthState({
                    token: token,
                    authenticated: true
                });

                return {
                    success: true,
                    data: response.data
                };
            }
            
            return {
                success: false,
                message: "Giriş başarısız"
            };

        } catch (error: any) {
            // Hata detaylarını daha ayrıntılı loglayalım
            console.log('Login error full details:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
                config: error.config,
                request: error.request
            });

            if (!error.response) {
                return {
                    success: false,
                    message: "Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin."
                };
            }

            // Sunucudan gelen hata mesajını gösterelim
            const errorMessage = error.response?.data?.message || error.message || "Bir hata oluştu";
            console.log('Error message:', errorMessage);

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setAuthState({
                token: null,
                authenticated: false
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const value = {
        onLogin: login,
        onLogout: logout,
        authState
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}