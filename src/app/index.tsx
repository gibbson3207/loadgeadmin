import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoomCard } from '../components/room-card';
import { useToast } from '../components/toast';
import {
  STATUS_ACTIONS,
  STATUS_META,
  STATUS_ORDER,
  type Room,
  type RoomStatus,
} from '../domain/rooms';
import { useRooms } from '../store/rooms';
import { colors, fonts, layout, radii } from '../theme';
import { formatLongDate, plural } from '../utils/format';

type Filter = RoomStatus | 'all';

function FilterChip({
  label,
  count,
  dotColor,
  active,
  onPress,
}: {
  label: string;
  count: number;
  dotColor?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
    >
      {dotColor ? (
        <View style={[styles.chipDot, { backgroundColor: dotColor }]} />
      ) : null}
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
        {label}
      </Text>
      <View style={[styles.chipCount, active && styles.chipCountActive]}>
        <Text style={[styles.chipCountText, active && styles.chipCountTextActive]}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { rooms, hydrated, changeStatus } = useRooms();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () =>
      rooms.reduce(
        (totals, room) => {
          totals[room.status] += 1;
          return totals;
        },
        { available: 0, reserved: 0, booked: 0 },
      ),
    [rooms],
  );

  const occupiedShare = rooms.length
    ? Math.round((counts.booked / rooms.length) * 100)
    : 0;

  const floorGroups = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = rooms.filter((room) => {
      const matchesStatus = filter === 'all' || room.status === filter;
      const matchesQuery =
        !term ||
        [room.number, room.type, room.guest ?? ''].some((value) =>
          value.toLowerCase().includes(term),
        );
      return matchesStatus && matchesQuery;
    });

    const grouped = new Map<number, Room[]>();
    filtered.forEach((room) => {
      const bucket = grouped.get(room.floor) ?? [];
      bucket.push(room);
      grouped.set(room.floor, bucket);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([floor, items]) => ({
        floor,
        items: items.sort((a, b) =>
          a.number.localeCompare(b.number, undefined, { numeric: true }),
        ),
      }));
  }, [rooms, filter, query]);

  const visibleCount = floorGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  const handleAction = (room: Room, to: RoomStatus) => {
    if (to === 'booked') {
      router.push({
        pathname: '/booking/[id]',
        params: { id: room.id },
      });
      return;
    }

    const action = STATUS_ACTIONS[room.status].find((item) => item.to === to);
    if (!action) return;
    if (!changeStatus(room.id, to)) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    showToast(action.toast(room));
  };

  if (!hydrated) {
    return (
      <View style={[styles.screen, styles.loading]}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <View style={styles.column}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <View style={styles.brandRow}>
                <View style={styles.logo}>
                  <Ionicons name="leaf" size={12} color={colors.canvas} />
                </View>
                <Text style={styles.brand}>ARBOR HOUSE</Text>
              </View>
              <Text style={styles.title}>Front desk</Text>
              <Text style={styles.date}>{formatLongDate()}</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View recent activity"
                onPress={() => router.push('/activity')}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="time-outline" size={20} color={colors.ink} />
              </Pressable>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AH</Text>
              </View>
            </View>
          </View>

          <LinearGradient
            colors={['#27523F', '#173327']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View pointerEvents="none" style={styles.heroGlow} />

            <View style={styles.heroTop}>
              <Text style={styles.heroEyebrow}>OCCUPANCY TODAY</Text>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            <View style={styles.heroValueRow}>
              <Text style={styles.heroValue}>
                {occupiedShare}
                <Text style={styles.heroPercent}>%</Text>
              </Text>
              <Text style={styles.heroCaption}>
                {counts.booked} of {plural(rooms.length, 'room')} booked
              </Text>
            </View>

            <View style={styles.track}>
              <View
                style={[
                  styles.trackSegment,
                  {
                    flex: Math.max(counts.booked, 0.35),
                    backgroundColor: '#9AC8A9',
                  },
                ]}
              />
              <View
                style={[
                  styles.trackSegment,
                  {
                    flex: Math.max(counts.reserved, 0.35),
                    backgroundColor: '#DDB172',
                  },
                ]}
              />
              <View style={{ flex: Math.max(counts.available, 0.35) }} />
            </View>

            <View style={styles.heroStats}>
              {STATUS_ORDER.map((status, index) => (
                <View
                  key={status}
                  style={[
                    styles.heroStat,
                    index > 0 && styles.heroStatBordered,
                  ]}
                >
                  <View style={styles.heroStatLabelRow}>
                    <View
                      style={[
                        styles.heroStatDot,
                        { backgroundColor: STATUS_META[status].dot },
                      ]}
                    />
                    <Text style={styles.heroStatLabel}>
                      {STATUS_META[status].label}
                    </Text>
                  </View>
                  <Text style={styles.heroStatValue}>{counts[status]}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              accessibilityLabel="Search rooms"
              value={query}
              onChangeText={setQuery}
              placeholder="Search room, type or guest"
              placeholderTextColor={colors.muted}
              autoCorrect={false}
              returnKeyType="search"
              style={styles.input}
            />
            {query ? (
              <Pressable
                accessibilityLabel="Clear search"
                hitSlop={10}
                onPress={() => setQuery('')}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <FilterChip
              label="All rooms"
              count={rooms.length}
              active={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            {STATUS_ORDER.map((status) => (
              <FilterChip
                key={status}
                label={STATUS_META[status].label}
                count={counts[status]}
                dotColor={STATUS_META[status].dot}
                active={filter === status}
                onPress={() => setFilter(status)}
              />
            ))}
          </ScrollView>

          {floorGroups.length ? (
            <View style={styles.groups}>
              {floorGroups.map(({ floor, items }) => (
                <View key={floor} style={styles.section}>
                  <View style={styles.sectionHead}>
                    <Text style={styles.sectionTitle}>Floor {floor}</Text>
                    <Text style={styles.sectionCount}>
                      {plural(items.length, 'room')}
                    </Text>
                  </View>
                  <View style={styles.cards}>
                    {items.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        onOpen={() =>
                          router.push({
                            pathname: '/room/[id]',
                            params: { id: room.id },
                          })
                        }
                        onAction={(to) => handleAction(room, to)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="bed-outline" size={22} color={colors.brand} />
              </View>
              <Text style={styles.emptyTitle}>No rooms found</Text>
              <Text style={styles.emptyText}>
                {query
                  ? `Nothing matches “${query.trim()}”. Try a room number or guest name.`
                  : 'No rooms with this status right now.'}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <Ionicons
              name="cloud-done-outline"
              size={14}
              color={colors.muted}
            />
            <Text style={styles.footerText}>
              Showing {visibleCount} of {rooms.length} rooms · changes save
              automatically
            </Text>
          </View>
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
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logo: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 2.4,
    color: colors.inkSoft,
  },
  title: {
    marginTop: 10,
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  date: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.muted,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingTop: 4,
  },
  iconButton: {
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
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.white,
    letterSpacing: 0.5,
  },
  hero: {
    marginTop: 22,
    borderRadius: radii.xl,
    padding: 20,
    overflow: 'hidden',
    backgroundColor: colors.brandDeep,
  },
  heroGlow: {
    position: 'absolute',
    top: -110,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.62)',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#9AC8A9',
  },
  liveText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  heroValue: {
    fontFamily: fonts.display,
    fontSize: 54,
    lineHeight: 58,
    color: colors.white,
    letterSpacing: -2,
  },
  heroPercent: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  heroCaption: {
    paddingBottom: 8,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.66)',
    textAlign: 'right',
    flexShrink: 1,
  },
  track: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    gap: 2,
  },
  trackSegment: {
    height: 6,
    borderRadius: 999,
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroStat: {
    flex: 1,
    gap: 3,
  },
  heroStatBordered: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    paddingLeft: 14,
  },
  heroStatLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroStatDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  heroStatLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.4,
    color: 'rgba(255, 255, 255, 0.62)',
    textTransform: 'uppercase',
  },
  heroStatValue: {
    fontFamily: fonts.display,
    fontSize: 23,
    color: colors.white,
    lineHeight: 26,
  },
  searchBox: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: colors.ink,
    paddingVertical: 0,
  },
  chips: {
    gap: 8,
    paddingVertical: 14,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  chipLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.inkSoft,
  },
  chipLabelActive: {
    color: colors.white,
  },
  chipCount: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 999,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  chipCountText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.inkSoft,
  },
  chipCountTextActive: {
    color: colors.white,
  },
  groups: {
    gap: 22,
    marginTop: 6,
  },
  section: {
    gap: 10,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.muted,
  },
  cards: {
    gap: 11,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.muted,
  },
});
