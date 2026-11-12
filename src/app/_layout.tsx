import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '../components/toast';
import { RoomsProvider } from '../store/rooms';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        <RoomsProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.canvas },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen
                name="room/[id]"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="booking/[id]"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="activity"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
          </ToastProvider>
        </RoomsProvider>
      </View>
    </SafeAreaProvider>
  );
}
