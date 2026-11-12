import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { ActionVariant } from '../domain/rooms';
import { colors, fonts, radii } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  onPress: () => void;
  variant?: ActionVariant;
  icon?: IconName;
  size?: 'sm' | 'lg';
  flex?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
};

const VARIANTS: Record<
  ActionVariant,
  { background: string; border: string; text: string; icon: string }
> = {
  primary: {
    background: colors.brand,
    border: colors.brand,
    text: colors.white,
    icon: colors.white,
  },
  outline: {
    background: colors.surface,
    border: colors.line,
    text: colors.ink,
    icon: colors.inkSoft,
  },
  danger: {
    background: colors.dangerSoft,
    border: colors.dangerSoft,
    text: colors.danger,
    icon: colors.danger,
  },
};

export function ActionButton({
  label,
  onPress,
  variant = 'outline',
  icon,
  size = 'sm',
  flex,
  disabled,
  accessibilityLabel,
}: Props) {
  const palette = VARIANTS[variant];
  const large = size === 'lg';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          height: large ? 50 : 38,
          paddingHorizontal: large ? 18 : 12,
        },
        flex && styles.flex,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={large ? 18 : 15} color={palette.icon} />
      ) : null}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: palette.text,
            fontSize: large ? 14.5 : 12.5,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: fonts.semibold,
    letterSpacing: 0.1,
  },
});
