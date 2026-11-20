import { Pressable, View } from 'react-native';

import type { RouterOutputs } from '@/lib/trpc';
import { Text } from '@/ui';

type Stats = RouterOutputs['user']['getProfile']['stats'];

const TILE = 'flex-1 gap-0.5 rounded-card bg-surface px-[18px] py-4';

interface StatProps {
  value: number;
  label: { singular: string; plural: string };
  onPress?: () => void;
}

function Stat({ value, label, onPress }: StatProps) {
  const text = value > 1 ? label.plural : label.singular;
  const content = (
    <>
      <Text variant="title" tone="brand" className="text-[52px] leading-[52px]">
        {value}
      </Text>
      <Text variant="caption" tone="default" className="font-sans-medium">
        {text}
      </Text>
    </>
  );

  if (!onPress) return <View className={TILE}>{content}</View>;

  return (
    <Pressable
      role="button"
      aria-label={`${value} ${text}`}
      onPress={onPress}
      className={`${TILE} active:opacity-80`}
    >
      {content}
    </Pressable>
  );
}

export function ProfileStats({ stats, onPressTrips }: { stats: Stats; onPressTrips?: () => void }) {
  return (
    <View className="flex-row gap-3">
      <Stat
        value={stats.tripsCount}
        label={{ singular: 'Voyage créé', plural: 'Voyages créés' }}
        onPress={onPressTrips}
      />
      <Stat
        value={stats.likedPlacesCount}
        label={{ singular: 'Lieu liké', plural: 'Lieux likés' }}
      />
    </View>
  );
}
