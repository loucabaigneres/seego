import { usePathname } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@seego/ui';
import { Button, IconButton, Text } from '@/ui';
import { SparkleIcon, XIcon } from '@/ui/icons';

import { useClipboardLink } from '../hooks/useClipboardLink';
import { shortUrl } from '../lib/inspiration';

/** Screens where the banner would get in the way (the import itself, sign-in). */
const HIDDEN_ON = ['/inspiration/import', '/auth'];

/** "Lien TikTok copié : importer ?" floating at the top, over every screen. */
export function ClipboardLinkBanner() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isHidden = HIDDEN_ON.some((path) => pathname.startsWith(path));
  const clipboard = useClipboardLink({ enabled: !isHidden });

  if (isHidden || !clipboard.suggestion) return null;
  const { suggestion } = clipboard;

  return (
    <View
      role="alert"
      className="absolute inset-x-4 gap-3 rounded-card border border-brand/30 bg-background p-4"
      style={{ top: insets.top + 8 }}
    >
      <View className="flex-row items-start gap-3">
        <SparkleIcon size={24} color={colors.brand} />
        <View className="flex-1 gap-0.5">
          <Text variant="label">
            {suggestion.kind === 'link' ? 'Tu as copié une vidéo' : 'Tu as copié un lien ?'}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {suggestion.kind === 'link'
              ? shortUrl(suggestion.url)
              : 'Importe ton TikTok ou ton Reel dans Seego.'}
          </Text>
          {clipboard.error && (
            <Text variant="caption" tone="brand">
              {clipboard.error}
            </Text>
          )}
        </View>
        <IconButton label="Ignorer" icon={XIcon} onPress={clipboard.dismiss} className="-m-2" />
      </View>
      <Button label="Importer ce lien" variant="cta" size="sm" onPress={clipboard.importLink} />
    </View>
  );
}
