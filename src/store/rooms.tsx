import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getStatusAction,
  SEED_ACTIVITY,
  SEED_ROOMS,
  type ActivityEntry,
  type BookingDetails,
  type Room,
  type RoomStatus,
} from '../domain/rooms';

const STORAGE_KEY = 'arbor-house-admin/v1';

type Snapshot = {
  rooms: Room[];
  activity: ActivityEntry[];
};

type RoomsContextValue = {
  rooms: Room[];
  activity: ActivityEntry[];
  hydrated: boolean;
  changeStatus: (roomId: string, to: RoomStatus) => boolean;
  bookRoom: (roomId: string, details: BookingDetails) => boolean;
};

const RoomsContext = createContext<RoomsContextValue | null>(null);

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    rooms: SEED_ROOMS,
    activity: SEED_ACTIVITY,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Snapshot>;
          if (
            Array.isArray(parsed.rooms) &&
            Array.isArray(parsed.activity) &&
            !cancelled
          ) {
            setSnapshot({ rooms: parsed.rooms, activity: parsed.activity });
          }
        }
      } catch {
        // Corrupt or unavailable storage falls back to the demo dataset.
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => {
      // Persistence is best-effort; the in-memory state stays usable.
    });
  }, [snapshot, hydrated]);

  const changeStatus = useCallback(
    (roomId: string, to: RoomStatus) => {
      const room = snapshot.rooms.find((item) => item.id === roomId);
      if (!room || room.status === to || !getStatusAction(room.status, to)) {
        return false;
      }

      const nextRoom: Room = { ...room, status: to };
      if (to === 'available') {
        delete nextRoom.guest;
        delete nextRoom.checkIn;
        delete nextRoom.checkOut;
        delete nextRoom.phone;
        delete nextRoom.address;
        delete nextRoom.members;
      }

      const entry: ActivityEntry = {
        id: `${roomId}-${to}-${Date.now()}`,
        roomId,
        roomNumber: room.number,
        from: room.status,
        to,
        at: new Date().toISOString(),
        guest: nextRoom.guest,
      };

      setSnapshot((previous) => ({
        rooms: previous.rooms.map((item) =>
          item.id === roomId ? nextRoom : item,
        ),
        activity: [entry, ...previous.activity].slice(0, 60),
      }));

      return true;
    },
    [snapshot.rooms],
  );

  const bookRoom = useCallback(
    (roomId: string, details: BookingDetails) => {
      const room = snapshot.rooms.find((item) => item.id === roomId);
      const primary = details.members[0];
      if (
        !room ||
        !primary ||
        room.status === 'booked' ||
        !getStatusAction(room.status, 'booked')
      ) {
        return false;
      }

      const nextRoom: Room = {
        ...room,
        status: 'booked',
        guest: primary.name.trim(),
        phone: details.phone.trim(),
        address: details.address.trim(),
        members: details.members.map((member) => ({
          name: member.name.trim(),
          age: member.age,
        })),
      };

      const entry: ActivityEntry = {
        id: `${roomId}-booked-${Date.now()}`,
        roomId,
        roomNumber: room.number,
        from: room.status,
        to: 'booked',
        at: new Date().toISOString(),
        guest: nextRoom.guest,
      };

      setSnapshot((previous) => ({
        rooms: previous.rooms.map((item) =>
          item.id === roomId ? nextRoom : item,
        ),
        activity: [entry, ...previous.activity].slice(0, 60),
      }));

      return true;
    },
    [snapshot.rooms],
  );

  const value = useMemo<RoomsContextValue>(
    () => ({
      rooms: snapshot.rooms,
      activity: snapshot.activity,
      hydrated,
      changeStatus,
      bookRoom,
    }),
    [snapshot, hydrated, changeStatus, bookRoom],
  );

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
}

export function useRooms() {
  const context = useContext(RoomsContext);
  if (!context) {
    throw new Error('useRooms must be used inside RoomsProvider');
  }
  return context;
}
