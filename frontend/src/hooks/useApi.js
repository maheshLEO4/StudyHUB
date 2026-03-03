/**
 * useApi — lightweight wrapper around API calls with loading/error state
 */
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (apiFn, { successMsg, errorMsg } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      if (successMsg) toast.success(successMsg);
      return result?.data?.data;
    } catch (err) {
      const msg = err?.response?.data?.message || errorMsg || 'Something went wrong';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};
