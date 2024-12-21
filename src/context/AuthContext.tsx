import axiosInstance from '../config/axios';
import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import eventEmitter from '../utils/eventEmitter';

// Sadece kullanılan prop'ları tutalım
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
        console.log('AuthContext Token:', authState.token);
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                setAuthState({
                    token: token,
                    authenticated: true
                });
            }
        };
        loadToken();

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
            const response = await axiosInstance.post('/login', {
                username,
                password
            });

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
            return {
                success: false,
                message: error.response?.data?.message || "Bir hata oluştu"
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