'use client';

import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useCallback } from 'react';

type ApiQueryOptions<TData> = {
  enabled?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
};

type ApiMutationOptions = {
  invalidateQueries?: QueryKey[];
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
};

// ✅ Hook for fetching data (GET-like)
export function useApiQuery<TData>(
  key: QueryKey,
  queryFn: () => Promise<TData>,
  options: ApiQueryOptions<TData> = {}
) {
  const { enabled = true, onSuccess, onError } = options;

  const { data, isLoading, isError, error, refetch } = useQuery<TData>({
    queryKey: key,
    queryFn,
    enabled,


  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// ✅ Hook for mutating data (POST/PUT/DELETE-like)
export function useApiMutation<TParams = unknown, TResult = unknown>(
  mutationFn: (params: TParams) => Promise<TResult>,
  options: ApiMutationOptions = {}
) {
  const queryClient = useQueryClient();
  const { invalidateQueries = [], onSuccess, onError } = options;

  const mutation = useMutation<TResult, unknown, TParams>({
    mutationFn,
    onSuccess: async (data:TResult) => {
      // invalidate all queries listed
      await Promise.all(
        invalidateQueries.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey })
        )
      );
      onSuccess?.(data);
    },
    onError,
  });

  return {
    ...mutation,
    mutateAsync: useCallback((params: TParams) => mutation.mutateAsync(params), [mutation]),
  };
}
