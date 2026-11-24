import { router } from 'expo-router';
import { View } from 'react-native';

import { IconButton, Text } from '@/ui';
import { ArrowLeftIcon } from '@/ui/icons';

export function SettingsHeader() {
  return (
    <View className="gap-4">
      <IconButton
        label="Retour"
        icon={ArrowLeftIcon}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
        className="-ml-2.5"
      />
      <Text variant="title" role="heading" className="text-[42px] leading-[44px]">
        Réglages
      </Text>
    </View>
  );
}
