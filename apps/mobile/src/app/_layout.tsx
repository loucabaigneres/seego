import '../global.css';

import Fraunces_400Regular from '@seego/ui/fonts/native/Fraunces-Regular.ttf';
import Fraunces_400Regular_Italic from '@seego/ui/fonts/native/Fraunces-Italic.ttf';
import HankenGrotesk_400Regular from '@seego/ui/fonts/native/HankenGrotesk-Regular.ttf';
import HankenGrotesk_500Medium from '@seego/ui/fonts/native/HankenGrotesk-Medium.ttf';
import HankenGrotesk_600SemiBold from '@seego/ui/fonts/native/HankenGrotesk-SemiBold.ttf';
import HankenGrotesk_700Bold from '@seego/ui/fonts/native/HankenGrotesk-Bold.ttf';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { setupReactQueryForNative } from '@/lib/react-query-native';
import { queryClient } from '@/lib/trpc';
import { colors } from '@seego/ui';

setupReactQueryForNative();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Keys must match the family names declared in `@seego/ui` (`fonts`).
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });
  const isReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="discovery" options={{ gestureEnabled: false }} />
          <Stack.Screen name="trip/configure" />
          <Stack.Screen name="trip/[tripId]" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="auth/sign-in" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth/sign-up" options={{ presentation: 'modal' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
