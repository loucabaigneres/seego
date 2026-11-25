import { Redirect, useLocalSearchParams } from 'expo-router';

import { JoinWelcome } from '@/features/group-trip/components/JoinWelcome';

/** Shown once, right after joining a group trip. */
export default function JoinWelcomeScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  if (!tripId) return <Redirect href="/trips" />;
  return <JoinWelcome tripId={tripId} />;
}
