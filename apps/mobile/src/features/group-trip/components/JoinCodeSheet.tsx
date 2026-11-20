import { useState } from 'react';
import { View } from 'react-native';

import { Button, Notice, Sheet, Text, TextField } from '@/ui';

import { useJoinGroupTrip } from '../hooks/useJoinGroupTrip';
import { parseInviteCode } from '../lib/invite';

/** "Rejoindre avec un code": the code a friend sent, or the whole link pasted. */
export function JoinCodeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [value, setValue] = useState('');
  const { join, isJoining, error, reset } = useJoinGroupTrip();
  const code = parseInviteCode(value);

  const close = () => {
    if (isJoining) return;
    setValue('');
    reset();
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={close} title="Rejoindre un voyage">
      <View className="gap-4">
        <Text tone="secondary">Saisis le code reçu, ou colle le lien d’invitation.</Text>
        <TextField
          label="Code d’invitation"
          value={value}
          onChangeText={(next) => {
            setValue(next);
            reset();
          }}
          editable={!isJoining}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          returnKeyType="go"
          onSubmitEditing={() => code && join(code)}
        />
        {error && <Notice message={error} />}
        <Button
          label="Rejoindre"
          loading={isJoining}
          disabled={!code}
          onPress={() => code && join(code)}
        />
      </View>
    </Sheet>
  );
}
