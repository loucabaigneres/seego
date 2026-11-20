import { Redirect, useLocalSearchParams } from 'expo-router';

import { JoinInvitation } from '@/features/group-trip/components/JoinInvitation';
import { parseInviteCode } from '@/features/group-trip/lib/invite';
import { Screen } from '@/ui';

/** `seego://join/<code>` (and later the web link, once universal links are set up). */
export default function JoinScreen() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode?: string }>();
  const code = parseInviteCode(inviteCode ?? '');
  if (!code) return <Redirect href="/" />;

  return (
    <Screen>
      <JoinInvitation code={code} />
    </Screen>
  );
}
