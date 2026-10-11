import { View } from 'react-native';

import { Skeleton } from '@/ui';

/** Placeholder with the shape of a card while the feed loads. */
export function SkeletonCard() {
  return (
    <View aria-busy className="flex-1 justify-end gap-3 rounded-card bg-surface-raised p-5">
      <Skeleton className="h-3 w-28 rounded-full" />
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <View className="flex-row gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </View>
    </View>
  );
}
