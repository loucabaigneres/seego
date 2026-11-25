import { useState } from 'react';
import { Pressable } from 'react-native';

import { Text } from '@/ui';

import { JoinCodeSheet } from './JoinCodeSheet';

/** Text link under an empty trip list: opens the "join with a code" sheet. */
export function JoinCodeLink() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable role="button" onPress={() => setIsOpen(true)} className="py-2.5 active:opacity-80">
        <Text variant="caption" tone="brand" className="font-sans-semibold">
          Un ami t’a invité ? Entre son code
        </Text>
      </Pressable>
      <JoinCodeSheet visible={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
