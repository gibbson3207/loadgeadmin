import { StyleSheet, Text, View } from 'react-native';

import { STATUS_META, type RoomStatus } from '../domain/rooms';
import { fonts, radii } from '../theme';

type Props = {
  status: RoomStatus;
  size?: 'sm' | 'md';
};

export function StatusPill({ status, size = 'md' }: Props) {
  const meta = STATUS_META[status];
  const compact = size === 'sm';

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: meta.bg,
          paddingVertical: compact ? 5 : 7,
          paddingHorizontal: compact ? 9 : 11,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: meta.dot, width: compact ? 5 : 6, height: compact ? 5 : 6 },
        ]}
      />
      <Text
        style={[
          styles.label,
          { color: meta.fg, fontSize: compact ? 10.5 : 11.5 },
        ]}
      >
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: radii.pill,
  },
  label: {
    fontFamily: fonts.semibold,
    letterSpacing: 0.2,
  },
});
