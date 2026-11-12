import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '../theme';

export function ScreenHeader({ title }: { title: string }) {
  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={close}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Ionicons name="close" size={20} color={colors.ink} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 14.5,
    color: colors.inkSoft,
    letterSpacing: 0.3,
  },
  spacer: {
    width: 42,
    height: 42,
  },
});
