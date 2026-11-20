import { View } from 'react-native';

import { Text } from '@/ui';

/** Title of the timeline while the planning is being edited. */
export function PlanningEditHeader({ tripTitle }: { tripTitle: string }) {
  return (
    <View className="gap-0.5">
      <Text variant="overline" tone="brand" numberOfLines={1}>
        {tripTitle} · édition
      </Text>
      <Text variant="section" role="heading">
        Modifier le planning
      </Text>
    </View>
  );
}
