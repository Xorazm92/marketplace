import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const {
    showSuccessToast = false,
    successMessage = 'Amal muvaffaqiyatli bajarildi!',
    showErrorToast = true,
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        
        setState({
          data: result,
          loading: false,
          error: null,
        });

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Xatolik yuz berdi';
        
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        if (onError) {
          onError(error);
        }

        throw error;
      }
    },
    [apiFunction, showSuccessToast, successMessage, showErrorToast, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for handling form submissions
export function useFormApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const api = useApi(apiFunction, {
    showSuccessToast: true,
    ...options,
  });

  const handleSubmit = useCallback(
    (onSubmit: (data: any) => Promise<void> | void) =>
      async (data: any) => {
        try {
          await api.execute(data);
          if (onSubmit) {
            await onSubmit(data);
          }
        } catch (error) {
          // Error is already handled by useApi
        }
      },
    [api]
  );

  return {
    ...api,
    handleSubmit,
  };
}

// Hook for loading data on component mount
export function useApiData<T = any>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const api = useApi(apiFunction, { showErrorToast: true });

  React.useEffect(() => {
    api.execute();
  }, dependencies);

  return api;
}
