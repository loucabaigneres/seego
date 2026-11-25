import { useLocalSearchParams } from 'expo-router';

import { JoinCode } from '@/features/group-trip/components/JoinCode';

/** Typing a friend's code; `code` + `error` when its invitation was refused. */
export default function JoinCodeScreen() {
  const { code, error } = useLocalSearchParams<{ code?: string; error?: string }>();
  return <JoinCode initialCode={code} error={error} />;
}
