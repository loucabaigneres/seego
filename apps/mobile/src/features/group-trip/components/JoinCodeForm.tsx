import { useState } from 'react';
import { View } from 'react-native';

import { Button, Notice, Text, TextField } from '@/ui';

import { useJoinGroupTrip } from '../hooks/useJoinGroupTrip';
import { parseInviteCode } from '../lib/invite';

/** "Groupés" tab: join a friend's trip with the code (or the whole link) they sent. */
export function JoinCodeForm() {
  const [value, setValue] = useState('');
  const { join, isJoining, error, reset } = useJoinGroupTrip();
  const code = parseInviteCode(value);
  const submit = () => code && join(code);

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
          onChangeText={(next) => {
            setValue(next);
            reset();
          }}
          editable={!isJoining}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={submit}
          className="flex-1"
        />
        <Button label="Rejoindre" loading={isJoining} disabled={!code} onPress={submit} />
      </View>
      {error && <Notice message={error} />}
    </View>
  );
}
