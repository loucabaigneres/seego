import { router } from 'expo-router';
import { View } from 'react-native';

import { IconButton, Text } from '@/ui';
import { ArrowLeftIcon } from '@/ui/icons';

export function SettingsHeader() {
  return (
    <View className="flex-row items-center gap-2">
      <IconButton
        label="Retour"
        icon={ArrowLeftIcon}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
        className="-ml-2"
      />
      <Text variant="section" role="heading">
        Paramètres
      </Text>
    </View>
  );
}
