import { router } from 'expo-router';

import { Button } from '@/ui';
import { UsersThreeIcon } from '@/ui/icons';

/** "Groupés" tab, under the list: opens the group trip creation screen. */
export function CreateGroupTripButton() {
  return (
    <Button
      label="Créer un voyage de groupe"
      variant="outline"
      icon={UsersThreeIcon}
      onPress={() => router.push('/group/create')}
    />
  );
}
