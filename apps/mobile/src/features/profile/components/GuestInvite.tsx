import { router } from 'expo-router';
import { View, type ViewStyle } from 'react-native';

import { colors } from '@seego/ui';
import { Button, cn, Text } from '@/ui';
import { CompassIcon, MapTrifoldIcon, SuitcaseRollingIcon, type AppIcon } from '@/ui/icons';

interface Postcard {
  icon: AppIcon;
  card: string;
  iconColor: string;
  style: ViewStyle;
}

/** Three postcards fanned out, the front one last: a hint of the trips an account keeps. */
const POSTCARDS: Postcard[] = [
  {
    icon: CompassIcon,
    card: 'bg-accent',
    iconColor: colors.brand,
    style: { left: '6%', top: 18, transform: [{ rotate: '-9deg' }] },
  },
  {
    icon: SuitcaseRollingIcon,
    card: 'bg-success',
    iconColor: colors.ink.inverse,
    style: { left: '56%', top: 22, transform: [{ rotate: '8deg' }] },
  },
  {
    icon: MapTrifoldIcon,
    card: 'border border-line bg-background',
    iconColor: colors.brand,
    style: { left: '31%', top: 0, transform: [{ rotate: '-2deg' }] },
  },
];

function Postcards() {
  return (
    <View aria-hidden className="h-56">
      {POSTCARDS.map(({ icon: Icon, card, iconColor, style }) => (
        <View
          key={card}
          className={cn('absolute h-48 w-[38%] items-center justify-center rounded-lg', card)}
          style={style}
        >
          <Icon size={40} color={iconColor} />
        </View>
      ))}
    </View>
  );
}

/** Signed-out Trips and Profile tabs: what an account brings, then sign in or sign up. */
export function GuestInvite({ overline = 'Ton profil' }: { overline?: string }) {
  return (
    <View className="flex-1 gap-8">
      <View className="flex-1 justify-center gap-10">
        <Postcards />
        <View className="gap-3">
          <Text variant="overline">{overline}</Text>
          <Text variant="title" role="heading" className="text-[36px] leading-[38px]">
            Garde tes voyages sous la main
          </Text>
          <Text tone="muted">
            Crée un compte pour enregistrer tes itinéraires et les retrouver sur tous tes appareils.
          </Text>
        </View>
      </View>

      <View className="gap-2.5">
        <Button label="Se connecter" variant="cta" onPress={() => router.push('/auth/sign-in')} />
        <Button
          label="Créer un compte"
          variant="outline"
          onPress={() => router.push('/auth/sign-up')}
        />
      </View>
    </View>
  );
}
