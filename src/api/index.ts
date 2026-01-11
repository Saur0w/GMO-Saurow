import axios from 'axios';
import type { ApiResponse } from '../types/index.types.ts';

const API_URL = 'https://api.artic.edu/api/v1/artworks';

export const fetchData = async (page: number = 1, limit: number = 12): Promise<ApiResponse> => {
    try {
        const response = await axios.get<ApiResponse>(API_URL, {
            params: {
                page,
                limit
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error fetching Data:', error.response?.data || error.message);
            throw new Error(`Failed to fetch Data: ${error.message}?.status} ${error.response?.statusText}`);
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred.');
        }
    }
};
