import { track } from '@/lib/analytics';
import { trpc } from '@/lib/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

/** Updates the display name and flags the success for a few seconds. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const mutation = useMutation(
    trpc.user.updateProfile.mutationOptions({
      onSuccess: () => {
        track('profile_updated');
        setUpdateSuccess(true);
        queryClient.invalidateQueries(trpc.user.getProfile.queryFilter());
        setTimeout(() => setUpdateSuccess(false), 3000);
      },
    }),
  );

  return {
    updateName: (name: string) => mutation.mutate({ name }),
    isSaving: mutation.isPending,
    updateSuccess,
  };
}
