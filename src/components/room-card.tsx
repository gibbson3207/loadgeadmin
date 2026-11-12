import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  STATUS_ACTIONS,
  STATUS_META,
  type Room,
  type RoomStatus,
} from '../domain/rooms';
import { cardShadow, colors, fonts, radii } from '../theme';
import { formatRange, plural } from '../utils/format';
import { ActionButton } from './action-button';
import { StatusPill } from './status-pill';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  room: Room;
  onOpen: () => void;
  onAction: (to: RoomStatus) => void;
};

function actionIcon(from: RoomStatus, to: RoomStatus): IconName {
  if (to === 'booked') return 'checkmark-circle-outline';
  if (to === 'reserved') return 'calendar-outline';
  return from === 'booked' ? 'log-out-outline' : 'close-circle-outline';
}

function Fact({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={13} color={colors.muted} />
      <Text style={styles.factText}>{label}</Text>
    </View>
  );
}

export function RoomCard({ room, onOpen, onAction }: Props) {
  const status = STATUS_META[room.status];
  const actions = STATUS_ACTIONS[room.status];
  const hasDates = Boolean(room.guest && room.checkIn && room.checkOut);
  const supportText = room.guest
    ? room.guest
    : room.status === 'available'
      ? 'Ready for the next guest'
      : 'Guest details pending';

  return (
    <View style={[styles.card, cardShadow]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Room ${room.number}, ${status.label}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <View style={styles.headRow}>
          <View style={styles.headText}>
            <Text style={styles.number}>{room.number}</Text>
            <Text style={styles.type}>
              {room.type} · Floor {room.floor}
            </Text>
          </View>
          <StatusPill status={room.status} />
        </View>

        <View style={styles.guestRow}>
          <View style={styles.guestTextWrap}>
            <Ionicons
              name={room.guest ? 'person-outline' : 'sparkles-outline'}
              size={14}
              color={room.guest ? colors.inkSoft : colors.muted}
            />
            <Text
              numberOfLines={1}
              style={[styles.guest, !room.guest && styles.guestMuted]}
            >
              {supportText}
              {hasDates ? (
                <Text style={styles.dates}>
                  {'  ·  '}
                  {formatRange(room.checkIn!, room.checkOut!)}
                </Text>
              ) : null}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </View>

        <View style={styles.factsRow}>
          <Fact icon="bed-outline" label={plural(room.beds, 'bed')} />
          <Fact icon="water-outline" label={plural(room.baths, 'bath')} />
          <Fact icon="resize-outline" label={`${room.sqm} m²`} />
          <View style={styles.rateWrap}>
            <Text style={styles.rate}>${room.rate}</Text>
            <Text style={styles.perNight}>/night</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.actions}>
        {actions.map((action) => (
          <ActionButton
            key={action.to}
            label={action.shortLabel}
            accessibilityLabel={`${action.shortLabel} room ${room.number}`}
            variant={action.variant}
            icon={actionIcon(room.status, action.to)}
            onPress={() => onAction(action.to)}
            flex
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  body: {
    padding: 16,
    gap: 11,
  },
  pressed: {
    opacity: 0.75,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headText: {
    flexShrink: 1,
  },
  number: {
    fontFamily: fonts.display,
    fontSize: 29,
    lineHeight: 33,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  type: {
    marginTop: 1,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  guestTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  guest: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  guestMuted: {
    color: colors.muted,
    fontFamily: fonts.body,
  },
  dates: {
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 12,
  },
  factsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 1,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  factText: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  rateWrap: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  rate: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.ink,
  },
  perNight: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: '#FCFAF6',
  },
});
