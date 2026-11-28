import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { IconButton, Screen, SegmentedControl, Text, Wordmark } from '@/ui';
import { ArrowLeftIcon, XIcon } from '@/ui/icons';

import { closeAuth } from '../lib/navigation';
import { SocialSignIn } from './SocialSignIn';

export type AuthTab = 'sign-in' | 'sign-up';

const TABS = [
  { value: 'sign-in', label: 'Connexion' },
  { value: 'sign-up', label: 'Inscription' },
] as const;

const TAB_HREFS = { 'sign-in': '/auth/sign-in', 'sign-up': '/auth/sign-up' } as const;

export interface AuthLayoutProps {
  title: string;
  /** Sign-in and sign-up: tabs between the two, Apple/Google and a close button. Without it, a back arrow. */
  tab?: AuthTab;
  overline?: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, tab, overline, subtitle, children }: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll contentClassName="gap-5 pt-2">
        {tab ? (
          <View className="-mr-2 flex-row items-center justify-between">
            <Wordmark />
            <IconButton label="Fermer" icon={XIcon} onPress={closeAuth} />
          </View>
        ) : (
          <IconButton
            label="Retour"
            icon={ArrowLeftIcon}
            // Back to sign-in when it is under this screen, else swap to it.
            onPress={() => router.dismissTo('/auth/sign-in')}
            className="-ml-2.5"
          />
        )}

        <View className="gap-2.5">
          {overline && <Text variant="overline">{overline}</Text>}
          <Text variant="title" role="heading">
            {title}
          </Text>
          {subtitle && <Text tone="muted">{subtitle}</Text>}
        </View>

        {tab && (
          <>
            <SegmentedControl
              segments={TABS}
              value={tab}
              variant="soft"
              // Back to that screen when it is under this one, else swap.
              onChange={(next) => next !== tab && router.dismissTo(TAB_HREFS[next])}
            />
            <SocialSignIn />
          </>
        )}

        <View className="flex-1">{children}</View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
