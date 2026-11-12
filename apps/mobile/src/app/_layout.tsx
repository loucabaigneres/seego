import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { setupReactQueryForNative } from '@/lib/react-query-native';
import { queryClient } from '@/lib/trpc';
import { colors } from '@seego/ui';

// shortcut: NativeWind 4's css-interop touches ImageBackground on load (RN 0.88 deprecation); we never use it. Remove when NativeWind ships a fix.
LogBox.ignoreLogs(['ImageBackground is deprecated']);
setupReactQueryForNative();

export default function RootLayout() {
  // Fonts are embedded in the native build by the `expo-font` config plugin (app.json), so they are
  // available from the first frame: nothing to load or wait for here.
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
          <Stack.Screen name="auth/forgot-password" options={{ presentation: 'modal' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
