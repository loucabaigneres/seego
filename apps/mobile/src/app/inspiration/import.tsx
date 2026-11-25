import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AddToTripSheet,
  type AddToTripSheetProps,
} from '@/features/inspirations/components/AddToTripSheet';
import { ImportInspirationForm } from '@/features/inspirations/components/ImportInspirationForm';
import { ImportResult } from '@/features/inspirations/components/ImportResult';
import { useImportInspiration } from '@/features/inspirations/hooks/useImportInspiration';
import { useLinkParam } from '@/features/inspirations/hooks/useLinkParam';
import { useSharedLink } from '@/features/inspirations/hooks/useSharedLink';
import { shortUrl } from '@/features/inspirations/lib/inspiration';
import { useAuthSession } from '@/hooks/useAuthSession';
import { EmptyState, IconButton, LoadingState, Screen, Text } from '@/ui';
import { ArrowLeftIcon, LockSimpleIcon } from '@/ui/icons';

export default function ImportInspirationScreen() {
  const session = useAuthSession();
  const form = useImportInspiration({ canAnalyze: session.isSignedIn });
  const [adding, setAdding] = useState<AddToTripSheetProps['inspiration']>(null);
  useSharedLink(form.receiveSharedLink);
  useLinkParam(form.receiveSharedLink);

  return (
    <Screen scroll contentClassName="gap-6">
      {!form.result && (
        <View className="gap-6">
          <IconButton
            label="Retour"
            icon={ArrowLeftIcon}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
            className="-ml-2.5"
          />
          <View className="gap-2">
            <Text variant="overline" tone="brand">
              Mes inspirations
            </Text>
            <Text variant="title" role="heading">
              Importer une inspiration
            </Text>
          </View>
        </View>
      )}

      {session.isPending ? (
        <LoadingState />
      ) : !session.isSignedIn ? (
        <EmptyState
          icon={LockSimpleIcon}
          title="Connecte-toi pour importer"
          description={
            form.url
              ? `On analysera ${shortUrl(form.url)} dès ta connexion.`
              : 'Ton compte garde tes inspirations et les lieux repérés.'
          }
          action={{ label: 'Se connecter', onPress: () => router.push('/auth/sign-in') }}
        />
      ) : form.result ? (
        <ImportResult
          result={form.result}
          onAddToTrip={() => setAdding(form.result!.inspiration)}
          onImportAnother={form.reset}
        />
      ) : (
        <ImportInspirationForm form={form} />
      )}

      <AddToTripSheet inspiration={adding} onClose={() => setAdding(null)} />
    </Screen>
  );
}
