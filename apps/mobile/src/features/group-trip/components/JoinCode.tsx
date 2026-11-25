import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';

import { colors } from '@seego/ui';
import { Button, cn, IconButton, Screen, Text } from '@/ui';
import { ArrowLeftIcon, ClipboardTextIcon, InfoIcon } from '@/ui/icons';

import { INVITE_CODE_LENGTH, joinErrorMessage, parseInviteCode } from '../lib/invite';

const BOXES = Array.from({ length: INVITE_CODE_LENGTH }, (_, index) => index);

/**
 * "Rejoindre un voyage": the code a friend sent (typed, or pasted with its link), then its
 * invitation. The invitation sends an unknown or expired code back here with `error`.
 */
export function JoinCode({ initialCode = '', error }: { initialCode?: string; error?: string }) {
  const [code, setValue] = useState(initialCode);
  const [rejected, setRejected] = useState(error);
  const isComplete = code.length >= INVITE_CODE_LENGTH;
  const message = rejected ? joinErrorMessage(rejected) : null;

  const change = (next: string) => {
    setValue((parseInviteCode(next) ?? '').slice(0, INVITE_CODE_LENGTH));
    setRejected(undefined);
  };
  const paste = async () => change(await Clipboard.getStringAsync());
  const submit = () => {
    if (isComplete) router.push({ pathname: '/join/[inviteCode]', params: { inviteCode: code } });
  };

  const footer = (
    <View className="items-center gap-2.5 px-6 pb-2 pt-3">
      {message ? (
        <>
          <Button
            label="Entrer un autre code"
            onPress={() => change('')}
            className="self-stretch"
          />
          <Button
            label="Revenir à mes voyages"
            variant="text"
            size="sm"
            onPress={() => router.replace('/trips')}
          />
        </>
      ) : (
        <>
          <Button
            label="Rejoindre"
            disabled={!isComplete}
            onPress={submit}
            className="self-stretch"
          />
          <Text variant="caption">Tu as reçu un lien ? Ouvre-le, ça marche aussi.</Text>
        </>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll contentClassName="gap-7" footer={footer}>
        <IconButton
          label="Retour"
          icon={ArrowLeftIcon}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/trips'))}
          className="-ml-2.5"
        />
        <View className="gap-2.5">
          <Text variant="overline" tone="brand">
            Voyage de groupe
          </Text>
          <Text variant="title" role="heading" className="text-[38px] leading-10">
            Rejoindre un voyage
          </Text>
          <Text tone="muted">Entre le code que ton ami t’a envoyé. Il est valable 24 h.</Text>
        </View>

        <View className="gap-2.5">
          <Text variant="label" className="text-[15px] leading-5">
            Code d’invitation
          </Text>
          <View className="flex-row justify-between">
            {BOXES.map((index) => {
              const isCurrent = !message && index === code.length;
              return (
                <View
                  key={index}
                  className={cn(
                    'h-[52px] w-9 items-center justify-center rounded-field border-[1.5px]',
                    message || isCurrent
                      ? 'border-brand bg-background'
                      : 'border-transparent bg-surface',
                  )}
                >
                  {code[index] ? (
                    <Text variant="section">{code[index]}</Text>
                  ) : (
                    isCurrent && <View className="h-6 w-0.5 bg-brand" />
                  )}
                </View>
              );
            })}
            {/* One invisible input over the boxes: typing and pasting a whole link both land here. */}
            <TextInput
              value={code}
              onChangeText={change}
              autoFocus={!message}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              returnKeyType="go"
              onSubmitEditing={submit}
              caretHidden
              selectionColor={colors.brand}
              aria-label={`Code à ${INVITE_CODE_LENGTH} caractères`}
              aria-invalid={!!message}
              className="absolute inset-0 opacity-0"
            />
          </View>

          {message ? (
            <View role="alert" className="flex-row gap-3 rounded-card bg-surface px-4 py-3.5">
              <InfoIcon size={20} color={colors.brand} style={{ marginTop: 2 }} />
              <View className="flex-1 gap-0.5">
                <Text variant="label" tone="brand" className="text-[15px] leading-5">
                  {message.title}
                </Text>
                <Text variant="caption" tone="secondary">
                  {message.message}
                </Text>
              </View>
            </View>
          ) : (
            <Pressable
              role="button"
              onPress={paste}
              className="flex-row items-center gap-1.5 self-start py-2.5 active:opacity-80"
            >
              <ClipboardTextIcon size={20} color={colors.brand} />
              <Text variant="caption" tone="brand" className="font-sans-semibold text-[14px]">
                Coller le code
              </Text>
            </Pressable>
          )}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
