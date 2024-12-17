import axios from 'axios';
import { API_URL } from '../config/constants';

export const checkApiConnection = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log('API connection test response:', response.status);
        return true;
    } catch (error) {
        console.log('API connection test error:', error);
        return false;
    }
}; 