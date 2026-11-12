import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/screen-header';
import { STATUS_META, type ActivityEntry } from '../domain/rooms';
import { useRooms } from '../store/rooms';
import { colors, fonts, layout, radii } from '../theme';
import { relativeTime } from '../utils/format';

function dayLabel(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const diffDays = Math.round((startOfToday - startOfDay) / 86_400_000);

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return 'Earlier';
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const destination = STATUS_META[entry.to];

  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: destination.bg }]}>
        <Ionicons
          name="swap-horizontal"
          size={17}
          color={destination.fg}
        />
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>Room {entry.roomNumber}</Text>
        <View style={styles.transitionRow}>
          <View
            style={[
              styles.miniDot,
              { backgroundColor: STATUS_META[entry.from].dot },
            ]}
          />
          <Text style={styles.rowSub}>{STATUS_META[entry.from].label}</Text>
          <Ionicons name="arrow-forward" size={10} color={colors.muted} />
          <View
            style={[
              styles.miniDot,
              { backgroundColor: STATUS_META[entry.to].dot },
            ]}
          />
          <Text style={[styles.rowSub, styles.rowSubTo]}>
            {destination.label}
          </Text>
        </View>
        {entry.guest ? (
          <Text style={styles.guest} numberOfLines={1}>
            {entry.guest}
          </Text>
        ) : null}
      </View>

      <Text style={styles.time}>{relativeTime(entry.at)}</Text>
    </View>
  );
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { activity, hydrated } = useRooms();

  const groups: { label: string; entries: ActivityEntry[] }[] = [];
  activity.forEach((entry) => {
    const label = dayLabel(entry.at);
    const current = groups[groups.length - 1];
    if (current && current.label === label) {
      current.entries.push(entry);
    } else {
      groups.push({ label, entries: [entry] });
    }
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 34,
        }}
      >
        <View style={styles.column}>
          <ScreenHeader title="Status log" />

          <View style={styles.intro}>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.subtitle}>
              Every room status change made from this device.
            </Text>
          </View>

          {!hydrated ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.brand} />
            </View>
          ) : activity.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="time-outline"
                  size={22}
                  color={colors.brand}
                />
              </View>
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptyText}>
                Status changes will appear here as soon as you update a room.
              </Text>
            </View>
          ) : (
            <View style={styles.groups}>
              {groups.map((group) => (
                <View key={group.label} style={styles.group}>
                  <View style={styles.groupHead}>
                    <Text style={styles.groupLabel}>{group.label}</Text>
                    <Text style={styles.groupCount}>
                      {group.entries.length}{' '}
                      {group.entries.length === 1 ? 'update' : 'updates'}
                    </Text>
                  </View>
                  <View style={styles.card}>
                    {group.entries.map((entry, index) => (
                      <View key={entry.id}>
                        {index > 0 ? <View style={styles.divider} /> : null}
                        <ActivityRow entry={entry} />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  intro: {
    marginTop: 20,
    gap: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  groups: {
    marginTop: 20,
    gap: 20,
  },
  group: {
    gap: 8,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  groupLabel: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.ink,
  },
  groupCount: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  transitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  rowSub: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.inkSoft,
  },
  rowSubTo: {
    fontFamily: fonts.semibold,
  },
  guest: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  time: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.muted,
    paddingTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginLeft: 61,
  },
  empty: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 38,
    paddingHorizontal: 26,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    gap: 8,
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
