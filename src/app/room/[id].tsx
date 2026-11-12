import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '../../components/action-button';
import { ScreenHeader } from '../../components/screen-header';
import { useToast } from '../../components/toast';
import {
  STATUS_ACTIONS,
  STATUS_META,
  type RoomStatus,
  type StatusAction,
} from '../../domain/rooms';
import { useRooms } from '../../store/rooms';
import { cardShadow, colors, fonts, layout, radii } from '../../theme';
import { formatRange, initials, plural } from '../../utils/format';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function actionIcon(from: RoomStatus, to: RoomStatus): IconName {
  if (to === 'booked') return 'checkmark-circle-outline';
  if (to === 'reserved') return 'calendar-outline';
  return from === 'booked' ? 'log-out-outline' : 'close-circle-outline';
}

function HeroFact({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.heroFact}>
      <Ionicons name={icon} size={14} color="rgba(255, 255, 255, 0.78)" />
      <Text style={styles.heroFactText}>{label}</Text>
    </View>
  );
}

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { rooms, hydrated, changeStatus } = useRooms();
  const { showToast } = useToast();

  const room = rooms.find((item) => item.id === id);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleAction = (action: StatusAction) => {
    if (!room) return;

    if (action.to === 'booked') {
      router.push({
        pathname: '/booking/[id]',
        params: { id: room.id },
      });
      return;
    }

    if (!changeStatus(room.id, action.to)) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    showToast(action.toast(room));
    goBack();
  };

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
          <ScreenHeader title="Room details" />

          {!hydrated ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.brand} />
            </View>
          ) : !room ? (
            <View style={styles.center}>
              <Text style={styles.missingTitle}>Room not found</Text>
              <Text style={styles.missingText}>
                This room may have been removed from the property list.
              </Text>
              <ActionButton
                label="Back to rooms"
                variant="primary"
                onPress={goBack}
              />
            </View>
          ) : (
            <>
              <LinearGradient
                colors={['#27523F', '#173327']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View pointerEvents="none" style={styles.heroGlow} />

                <View style={styles.heroTop}>
                  <View style={styles.heroStatus}>
                    <View
                      style={[
                        styles.heroStatusDot,
                        { backgroundColor: STATUS_META[room.status].dot },
                      ]}
                    />
                    <Text style={styles.heroStatusText}>
                      {STATUS_META[room.status].label}
                    </Text>
                  </View>
                  <Text style={styles.heroRate}>
                    ${room.rate}
                    <Text style={styles.heroRateUnit}> /night</Text>
                  </Text>
                </View>

                <Text style={styles.heroNumber}>{room.number}</Text>
                <Text style={styles.heroType}>
                  {room.type} · Floor {room.floor}
                </Text>

                <View style={styles.heroFacts}>
                  <HeroFact icon="bed-outline" label={plural(room.beds, 'bed')} />
                  <HeroFact
                    icon="water-outline"
                    label={plural(room.baths, 'bath')}
                  />
                  <HeroFact
                    icon="resize-outline"
                    label={`${room.sqm} m²`}
                  />
                </View>
              </LinearGradient>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Guest</Text>
                {room.guest ? (
                  <View style={[styles.guestCard, cardShadow]}>
                    <View style={styles.guestAvatar}>
                      <Text style={styles.guestInitials}>
                        {initials(room.guest)}
                      </Text>
                    </View>
                    <View style={styles.guestInfo}>
                      <Text style={styles.guestName}>{room.guest}</Text>
                      {room.checkIn && room.checkOut ? (
                        <View style={styles.dateRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={13}
                            color={colors.inkSoft}
                          />
                          <Text style={styles.dateText}>
                            {formatRange(room.checkIn, room.checkOut)}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.dateMuted}>Stay dates not set</Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.noGuest}>
                    <View style={styles.noGuestIcon}>
                      <Ionicons
                        name="person-add-outline"
                        size={18}
                        color={colors.brand}
                      />
                    </View>
                    <View style={styles.noGuestBody}>
                      <Text style={styles.noGuestTitle}>No guest assigned</Text>
                      <Text style={styles.noGuestText}>
                        {room.status === 'available'
                          ? 'This room is ready to be reserved or booked.'
                          : 'Add a booking to attach guest details to this room.'}
                      </Text>
                    </View>
                  </View>
                )}

                {room.phone || room.address || room.members?.length ? (
                  <View style={[styles.detailsCard, cardShadow]}>
                    {room.phone ? (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                          <Ionicons
                            name="call-outline"
                            size={15}
                            color={colors.brand}
                          />
                        </View>
                        <View style={styles.detailBody}>
                          <Text style={styles.detailLabel}>Phone</Text>
                          <Text style={styles.detailValue}>{room.phone}</Text>
                        </View>
                      </View>
                    ) : null}

                    {room.phone && (room.address || room.members?.length) ? (
                      <View style={styles.detailDivider} />
                    ) : null}

                    {room.address ? (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                          <Ionicons
                            name="location-outline"
                            size={15}
                            color={colors.brand}
                          />
                        </View>
                        <View style={styles.detailBody}>
                          <Text style={styles.detailLabel}>Address</Text>
                          <Text style={styles.detailValue}>{room.address}</Text>
                        </View>
                      </View>
                    ) : null}

                    {room.address && room.members?.length ? (
                      <View style={styles.detailDivider} />
                    ) : null}

                    {room.members?.length ? (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                          <Ionicons
                            name="people-outline"
                            size={15}
                            color={colors.brand}
                          />
                        </View>
                        <View style={styles.detailBody}>
                          <Text style={styles.detailLabel}>
                            Party · {plural(room.members.length, 'member')}
                          </Text>
                          <View style={styles.memberList}>
                            {room.members.map((member, index) => (
                              <View
                                key={`${member.name}-${index}`}
                                style={styles.memberListRow}
                              >
                                <Text style={styles.memberListName}>
                                  {member.name}
                                </Text>
                                <Text style={styles.memberListAge}>
                                  {member.age} yrs
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {room.note ? (
                  <View style={styles.note}>
                    <Ionicons
                      name="information-circle-outline"
                      size={17}
                      color={colors.gold}
                    />
                    <Text style={styles.noteText}>{room.note}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Update status</Text>
                <Text style={styles.sectionHint}>
                  Changes are saved instantly and appear in the activity log.
                </Text>
                <View style={styles.actions}>
                  {STATUS_ACTIONS[room.status].map((action) => (
                    <ActionButton
                      key={action.to}
                      label={action.label}
                      variant={action.variant}
                      icon={actionIcon(room.status, action.to)}
                      size="lg"
                      onPress={() => handleAction(action)}
                    />
                  ))}
                </View>
              </View>
            </>
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 80,
  },
  missingTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
  },
  missingText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 6,
  },
  hero: {
    marginTop: 16,
    borderRadius: radii.xl,
    padding: 20,
    overflow: 'hidden',
    backgroundColor: colors.brandDeep,
  },
  heroGlow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  heroStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  heroStatusText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.white,
    letterSpacing: 0.3,
  },
  heroRate: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.white,
  },
  heroRateUnit: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  heroNumber: {
    marginTop: 18,
    fontFamily: fonts.display,
    fontSize: 62,
    lineHeight: 66,
    letterSpacing: -2,
    color: colors.white,
  },
  heroType: {
    marginTop: -2,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.68)',
  },
  heroFacts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  heroFact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.pill,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  heroFactText: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.86)',
  },
  section: {
    marginTop: 24,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  sectionHint: {
    marginTop: -4,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.muted,
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  guestAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestInitials: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.brand,
    letterSpacing: 0.4,
  },
  guestInfo: {
    flex: 1,
    gap: 4,
  },
  guestName: {
    fontFamily: fonts.semibold,
    fontSize: 14.5,
    color: colors.ink,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  dateMuted: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
  },
  detailIcon: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBody: {
    flex: 1,
    gap: 3,
    paddingTop: 1,
  },
  detailLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: 0.7,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.ink,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginLeft: 40,
  },
  memberList: {
    gap: 5,
    marginTop: 2,
  },
  memberListRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
  },
  memberListName: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.ink,
  },
  memberListAge: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  noGuest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  noGuestIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noGuestBody: {
    flex: 1,
    gap: 2,
  },
  noGuestTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  noGuestText: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16.5,
    color: colors.inkSoft,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 13,
    borderRadius: radii.md,
    backgroundColor: '#FBF6EC',
    borderWidth: 1,
    borderColor: '#F0E4CC',
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17.5,
    color: '#7A5A23',
  },
  actions: {
    gap: 9,
    marginTop: 2,
  },
});
