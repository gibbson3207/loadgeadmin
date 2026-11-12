import { colors } from '../theme';

export type RoomStatus = 'available' | 'reserved' | 'booked';

export type GuestMember = {
  name: string;
  age: number;
};

export type Room = {
  id: string;
  number: string;
  floor: number;
  type: string;
  beds: number;
  baths: number;
  sqm: number;
  rate: number;
  status: RoomStatus;
  guest?: string;
  checkIn?: string;
  checkOut?: string;
  note?: string;
  phone?: string;
  address?: string;
  members?: GuestMember[];
};

export type BookingDetails = {
  members: GuestMember[];
  phone: string;
  address: string;
};

export type ActivityEntry = {
  id: string;
  roomId: string;
  roomNumber: string;
  from: RoomStatus;
  to: RoomStatus;
  at: string;
  guest?: string;
};

export const STATUS_META: Record<
  RoomStatus,
  { label: string; fg: string; bg: string; dot: string }
> = {
  available: { label: 'Available', ...colors.available },
  reserved: { label: 'Reserved', ...colors.reserved },
  booked: { label: 'Booked', ...colors.booked },
};

export const STATUS_ORDER: RoomStatus[] = ['available', 'reserved', 'booked'];

export type ActionVariant = 'primary' | 'outline' | 'danger';

export type StatusAction = {
  to: RoomStatus;
  label: string;
  shortLabel: string;
  variant: ActionVariant;
  toast: (room: Room) => string;
};

export const STATUS_ACTIONS: Record<RoomStatus, StatusAction[]> = {
  available: [
    {
      to: 'reserved',
      label: 'Mark as reserved',
      shortLabel: 'Reserve',
      variant: 'outline',
      toast: (room) => `Room ${room.number} is now reserved`,
    },
    {
      to: 'booked',
      label: 'Mark as booked',
      shortLabel: 'Book',
      variant: 'primary',
      toast: (room) => `Room ${room.number} is now booked`,
    },
  ],
  reserved: [
    {
      to: 'available',
      label: 'Back to available',
      shortLabel: 'Cancel',
      variant: 'danger',
      toast: (room) => `Reservation for room ${room.number} cancelled`,
    },
    {
      to: 'booked',
      label: 'Mark as booked',
      shortLabel: 'Book',
      variant: 'primary',
      toast: (room) => `Room ${room.number} is now booked`,
    },
  ],
  booked: [
    {
      to: 'available',
      label: 'Release room',
      shortLabel: 'Release',
      variant: 'outline',
      toast: (room) => `Room ${room.number} is available again`,
    },
  ],
};

const DAY = 86_400_000;
const dayOffset = (offset: number) =>
  new Date(Date.now() + offset * DAY).toISOString().slice(0, 10);
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

export const SEED_ROOMS: Room[] = [
  {
    id: 'r-101',
    number: '101',
    floor: 1,
    type: 'Studio',
    beds: 1,
    baths: 1,
    sqm: 38,
    rate: 120,
    status: 'available',
  },
  {
    id: 'r-102',
    number: '102',
    floor: 1,
    type: 'Studio',
    beds: 1,
    baths: 1,
    sqm: 38,
    rate: 125,
    status: 'reserved',
    guest: 'Maya Chen',
    checkIn: dayOffset(2),
    checkOut: dayOffset(5),
  },
  {
    id: 'r-103',
    number: '103',
    floor: 1,
    type: '1 Bedroom',
    beds: 1,
    baths: 1,
    sqm: 56,
    rate: 175,
    status: 'booked',
    guest: 'Daniel Okafor',
    checkIn: dayOffset(-2),
    checkOut: dayOffset(3),
  },
  {
    id: 'r-104',
    number: '104',
    floor: 1,
    type: '1 Bedroom',
    beds: 1,
    baths: 1,
    sqm: 56,
    rate: 170,
    status: 'available',
  },
  {
    id: 'r-105',
    number: '105',
    floor: 1,
    type: '2 Bedroom',
    beds: 2,
    baths: 2,
    sqm: 82,
    rate: 245,
    status: 'booked',
    guest: 'Sofia & Luca Marino',
    checkIn: dayOffset(-3),
    checkOut: dayOffset(1),
    note: 'Travel cot set up in the second bedroom.',
  },
  {
    id: 'r-201',
    number: '201',
    floor: 2,
    type: 'Studio',
    beds: 1,
    baths: 1,
    sqm: 40,
    rate: 135,
    status: 'booked',
    guest: 'Aisha Rahman',
    checkIn: dayOffset(-1),
    checkOut: dayOffset(2),
  },
  {
    id: 'r-202',
    number: '202',
    floor: 2,
    type: '1 Bedroom',
    beds: 1,
    baths: 1,
    sqm: 58,
    rate: 180,
    status: 'reserved',
    guest: 'Noah Bennett',
    checkIn: dayOffset(4),
    checkOut: dayOffset(8),
  },
  {
    id: 'r-203',
    number: '203',
    floor: 2,
    type: '1 Bedroom',
    beds: 1,
    baths: 1,
    sqm: 58,
    rate: 185,
    status: 'available',
  },
  {
    id: 'r-204',
    number: '204',
    floor: 2,
    type: '2 Bedroom',
    beds: 2,
    baths: 2,
    sqm: 84,
    rate: 250,
    status: 'available',
  },
  {
    id: 'r-205',
    number: '205',
    floor: 2,
    type: '2 Bedroom',
    beds: 2,
    baths: 2,
    sqm: 84,
    rate: 260,
    status: 'reserved',
    guest: 'Priya Nair',
    checkIn: dayOffset(3),
    checkOut: dayOffset(7),
  },
  {
    id: 'r-301',
    number: '301',
    floor: 3,
    type: 'Studio',
    beds: 1,
    baths: 1,
    sqm: 42,
    rate: 140,
    status: 'available',
  },
  {
    id: 'r-302',
    number: '302',
    floor: 3,
    type: '1 Bedroom',
    beds: 1,
    baths: 1,
    sqm: 60,
    rate: 190,
    status: 'booked',
    guest: 'Ethan Cole',
    checkIn: dayOffset(0),
    checkOut: dayOffset(6),
  },
  {
    id: 'r-303',
    number: '303',
    floor: 3,
    type: '1 Bedroom',
    beds: 1,
    baths: 1,
    sqm: 60,
    rate: 190,
    status: 'available',
  },
  {
    id: 'r-304',
    number: '304',
    floor: 3,
    type: 'Penthouse',
    beds: 3,
    baths: 2.5,
    sqm: 128,
    rate: 420,
    status: 'booked',
    guest: 'Grace Adeyemi',
    checkIn: dayOffset(-4),
    checkOut: dayOffset(4),
    note: 'Late check-out requested for 2:00 PM.',
  },
];

export const SEED_ACTIVITY: ActivityEntry[] = [
  {
    id: 'seed-1',
    roomId: 'r-304',
    roomNumber: '304',
    from: 'reserved',
    to: 'booked',
    at: hoursAgo(2),
    guest: 'Grace Adeyemi',
  },
  {
    id: 'seed-2',
    roomId: 'r-202',
    roomNumber: '202',
    from: 'available',
    to: 'reserved',
    at: hoursAgo(26),
    guest: 'Noah Bennett',
  },
  {
    id: 'seed-3',
    roomId: 'r-205',
    roomNumber: '205',
    from: 'available',
    to: 'reserved',
    at: hoursAgo(30),
    guest: 'Priya Nair',
  },
  {
    id: 'seed-4',
    roomId: 'r-302',
    roomNumber: '302',
    from: 'available',
    to: 'booked',
    at: hoursAgo(50),
    guest: 'Ethan Cole',
  },
  {
    id: 'seed-5',
    roomId: 'r-104',
    roomNumber: '104',
    from: 'booked',
    to: 'available',
    at: hoursAgo(76),
  },
];

export function getStatusAction(from: RoomStatus, to: RoomStatus) {
  return STATUS_ACTIONS[from].find((action) => action.to === to);
}
