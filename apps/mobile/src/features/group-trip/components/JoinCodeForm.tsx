import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Text, TextField } from '@/ui';

import { parseInviteCode } from '../lib/invite';

/** "Groupés" tab: a friend's code (or the whole link they sent) opens its invitation. */
export function JoinCodeForm() {
  const [value, setValue] = useState('');
  const code = parseInviteCode(value);
  const submit = () => {
    if (!code) return;
    router.push({ pathname: '/join/[inviteCode]', params: { inviteCode: code } });
    setValue('');
  };

  return (
    <View className="gap-2.5 rounded-card bg-surface p-4">
      <Text variant="label" role="heading">
        Rejoindre un voyage
      </Text>
      <View className="flex-row items-end gap-2">
        <TextField
          label="Entre le code reçu de ton ami"
          placeholder="Ex. AZ7KQ2MP"
          value={value}
          onChangeText={setValue}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={submit}
          className="flex-1"
        />
        <Button label="Rejoindre" disabled={!code} onPress={submit} />
      </View>
    </View>
  );
}
