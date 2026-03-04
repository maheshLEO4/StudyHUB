import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (apiCall, options = {}) => {
        const { successMsg, errorMsg, showToast = true } = options;
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall();
            // Axios stores data in .data, our backend wraps it in .data.data or .data
            const data = response.data?.data || response.data;

            if (showToast && successMsg) {
                toast.success(successMsg);
            }
            return data;
        } catch (err) {
            const msg = err.response?.data?.message || errorMsg || 'Something went wrong';
            setError(msg);
            if (showToast) {
                toast.error(msg);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { execute, loading, error };
};
