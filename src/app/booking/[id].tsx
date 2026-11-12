import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '../../components/action-button';
import { ScreenHeader } from '../../components/screen-header';
import { StatusPill } from '../../components/status-pill';
import { useToast } from '../../components/toast';
import { useRooms } from '../../store/rooms';
import { colors, fonts, layout, radii } from '../../theme';
import { plural } from '../../utils/format';

type MemberDraft = {
  name: string;
  age: string;
};

type FieldErrors = Record<string, string>;

const MAX_MEMBERS = 8;

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { rooms, hydrated, bookRoom } = useRooms();
  const { showToast } = useToast();

  const room = rooms.find((item) => item.id === id);

  const [members, setMembers] = useState<MemberDraft[]>(() => [
    { name: room?.guest ?? '', age: '' },
  ]);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const updateMember = (
    index: number,
    field: 'name' | 'age',
    value: string,
  ) => {
    setMembers((current) =>
      current.map((member, position) =>
        position === index ? { ...member, [field]: value } : member,
      ),
    );
    setErrors((current) => {
      const next = { ...current };
      delete next[`${field}-${index}`];
      return next;
    });
  };

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return;
    setMembers((current) => [...current, { name: '', age: '' }]);
  };

  const removeMember = () => {
    if (members.length <= 1) return;
    setMembers((current) => current.slice(0, -1));
    setErrors({});
  };

  const validate = () => {
    const next: FieldErrors = {};

    members.forEach((member, index) => {
      if (!member.name.trim()) {
        next[`name-${index}`] = 'Enter the name';
      }

      const ageText = member.age.trim();
      const age = Number(ageText);
      if (!ageText) {
        next[`age-${index}`] = 'Required';
      } else if (!Number.isInteger(age) || age < 0 || age > 120) {
        next[`age-${index}`] = 'Invalid age';
      }
    });

    const digits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      next.phone = 'Enter a phone number';
    } else if (digits.length < 7 || digits.length > 15) {
      next.phone = 'Enter a valid phone number';
    }

    if (!address.trim()) {
      next.address = 'Enter the address';
    } else if (address.trim().length < 5) {
      next.address = 'Address looks too short';
    }

    return next;
  };

  const handleSubmit = () => {
    if (!room) return;

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      Keyboard.dismiss();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
      }
      return;
    }

    const primary = members[0].name.trim();
    const booked = bookRoom(room.id, {
      members: members.map((member) => ({
        name: member.name.trim(),
        age: Number(member.age),
      })),
      phone: phone.trim(),
      address: address.trim(),
    });

    if (!booked) {
      showToast('This room can no longer be booked');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    }
    showToast(`Room ${room.number} booked for ${primary}`);

    if (router.canDismiss()) {
      router.dismissAll();
    } else {
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 34,
        }}
      >
        <View style={styles.column}>
          <ScreenHeader title="Booking" />

          {!hydrated ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.brand} />
            </View>
          ) : !room ? (
            <View style={styles.center}>
              <Text style={styles.missingTitle}>Room not found</Text>
              <Text style={styles.missingText}>
                This room is not available for booking.
              </Text>
              <ActionButton
                label="Back to rooms"
                variant="primary"
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace('/')
                }
              />
            </View>
          ) : room.status === 'booked' ? (
            <View style={styles.center}>
              <Ionicons
                name="checkmark-circle-outline"
                size={30}
                color={colors.brand}
              />
              <Text style={styles.missingTitle}>Already booked</Text>
              <Text style={styles.missingText}>
                Room {room.number} is already booked. Release it first to create
                a new booking.
              </Text>
              <ActionButton
                label="Back to rooms"
                variant="primary"
                onPress={() =>
                  router.canDismiss() ? router.dismissAll() : router.replace('/')
                }
              />
            </View>
          ) : (
            <>
              <View style={styles.intro}>
                <Text style={styles.title}>New booking</Text>
                <Text style={styles.subtitle}>
                  Capture the guest party and contact details before confirming.
                </Text>
              </View>

              <View style={styles.roomCard}>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomNumber}>{room.number}</Text>
                  <Text style={styles.roomMeta}>
                    {room.type} · Floor {room.floor}
                  </Text>
                </View>
                <View style={styles.roomRight}>
                  <StatusPill status={room.status} size="sm" />
                  <Text style={styles.roomRate}>
                    ${room.rate}
                    <Text style={styles.roomRateUnit}> /night</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <View style={styles.sectionHeadText}>
                    <Text style={styles.sectionTitle}>Members</Text>
                    <Text style={styles.sectionHint}>
                      Who is staying in the room?
                    </Text>
                  </View>
                  <View style={styles.stepper}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remove member"
                      accessibilityState={{
                        disabled: members.length <= 1,
                      }}
                      disabled={members.length <= 1}
                      onPress={removeMember}
                      style={({ pressed }) => [
                        styles.stepButton,
                        members.length <= 1 && styles.stepButtonDisabled,
                        pressed && styles.stepButtonPressed,
                      ]}
                    >
                      <Ionicons name="remove" size={18} color={colors.ink} />
                    </Pressable>
                    <Text style={styles.stepValue}>{members.length}</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Add member"
                      accessibilityState={{
                        disabled: members.length >= MAX_MEMBERS,
                      }}
                      disabled={members.length >= MAX_MEMBERS}
                      onPress={addMember}
                      style={({ pressed }) => [
                        styles.stepButton,
                        members.length >= MAX_MEMBERS &&
                          styles.stepButtonDisabled,
                        pressed && styles.stepButtonPressed,
                      ]}
                    >
                      <Ionicons name="add" size={18} color={colors.ink} />
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.countHint}>
                  {plural(members.length, 'member')} · up to {MAX_MEMBERS}
                </Text>

                {members.map((member, index) => (
                  <View key={index} style={styles.memberCard}>
                    <View style={styles.memberHead}>
                      <Text style={styles.memberTitle}>Member {index + 1}</Text>
                      {index === 0 ? (
                        <View style={styles.primaryTag}>
                          <Text style={styles.primaryTagText}>Primary guest</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.memberFields}>
                      <View style={styles.nameField}>
                        <Text style={styles.fieldLabel}>Full name</Text>
                        <TextInput
                          accessibilityLabel={`Member ${index + 1} name`}
                          value={member.name}
                          onChangeText={(value) =>
                            updateMember(index, 'name', value)
                          }
                          placeholder="e.g. Amara Silva"
                          placeholderTextColor={colors.muted}
                          autoCorrect={false}
                          style={[
                            styles.input,
                            errors[`name-${index}`] && styles.inputError,
                          ]}
                        />
                        {errors[`name-${index}`] ? (
                          <Text style={styles.error}>
                            {errors[`name-${index}`]}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.ageField}>
                        <Text style={styles.fieldLabel}>Age</Text>
                        <TextInput
                          accessibilityLabel={`Member ${index + 1} age`}
                          value={member.age}
                          onChangeText={(value) =>
                            updateMember(index, 'age', value.replace(/\D/g, ''))
                          }
                          placeholder="00"
                          placeholderTextColor={colors.muted}
                          keyboardType="number-pad"
                          maxLength={3}
                          style={[
                            styles.input,
                            styles.ageInput,
                            errors[`age-${index}`] && styles.inputError,
                          ]}
                        />
                        {errors[`age-${index}`] ? (
                          <Text style={styles.error}>
                            {errors[`age-${index}`]}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact</Text>
                <Text style={styles.sectionHint}>
                  One phone number and the guest address.
                </Text>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Phone number</Text>
                  <TextInput
                    accessibilityLabel="Phone number"
                    value={phone}
                    onChangeText={(value) => {
                      setPhone(value);
                      setErrors((current) => {
                        const next = { ...current };
                        delete next.phone;
                        return next;
                      });
                    }}
                    placeholder="+1 555 014 2280"
                    placeholderTextColor={colors.muted}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    style={[styles.input, errors.phone && styles.inputError]}
                  />
                  {errors.phone ? (
                    <Text style={styles.error}>{errors.phone}</Text>
                  ) : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Home address</Text>
                  <TextInput
                    accessibilityLabel="Home address"
                    value={address}
                    onChangeText={(value) => {
                      setAddress(value);
                      setErrors((current) => {
                        const next = { ...current };
                        delete next.address;
                        return next;
                      });
                    }}
                    placeholder="Street, city, postal code"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    style={[
                      styles.input,
                      styles.textArea,
                      errors.address && styles.inputError,
                    ]}
                  />
                  {errors.address ? (
                    <Text style={styles.error}>{errors.address}</Text>
                  ) : null}
                </View>
              </View>

              <ActionButton
                label="Confirm booking"
                variant="primary"
                icon="checkmark-circle-outline"
                size="lg"
                onPress={handleSubmit}
              />

              <View style={styles.footerNote}>
                <Ionicons
                  name="lock-closed-outline"
                  size={13}
                  color={colors.muted}
                />
                <Text style={styles.footerText}>
                  Guest details are saved with this booking on the device.
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 10,
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
  roomCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  roomInfo: {
    flexShrink: 1,
  },
  roomNumber: {
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  roomMeta: {
    marginTop: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.inkSoft,
  },
  roomRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  roomRate: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  roomRateUnit: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
  },
  section: {
    marginTop: 24,
    gap: 10,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionHeadText: {
    flexShrink: 1,
    gap: 2,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.muted,
  },
  countHint: {
    marginTop: -4,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    opacity: 0.35,
  },
  stepButtonPressed: {
    opacity: 0.7,
  },
  stepValue: {
    minWidth: 22,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
  },
  memberCard: {
    marginTop: 2,
    padding: 14,
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  memberHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.ink,
  },
  primaryTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
  },
  primaryTagText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: 0.4,
    color: colors.brand,
    textTransform: 'uppercase',
  },
  memberFields: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  nameField: {
    flex: 1,
    gap: 5,
  },
  ageField: {
    width: 86,
    gap: 5,
  },
  field: {
    gap: 5,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.inkSoft,
  },
  input: {
    height: 46,
    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: colors.ink,
  },
  ageInput: {
    textAlign: 'center',
  },
  textArea: {
    height: 92,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#FFFCFB',
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.danger,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.muted,
  },
});
