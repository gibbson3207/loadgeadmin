import { Ionicons } from '@expo/vector-icons';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cardShadow, colors, fonts, radii } from '../theme';

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [animation] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMessage(null);
    });
  }, [animation]);

  const showToast = useCallback(
    (nextMessage: string) => {
      if (timer.current) clearTimeout(timer.current);

      setMessage(nextMessage);
      animation.stopAnimation();
      animation.setValue(0);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 90,
      }).start();

      timer.current = setTimeout(hide, 2400);
    },
    [animation, hide],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.root}>
        {children}
        {message ? (
          <View
            pointerEvents="none"
            style={[
              styles.overlay,
              { paddingBottom: insets.bottom + 22 },
            ]}
          >
            <Animated.View
              style={[
                styles.toast,
                cardShadow,
                {
                  opacity: animation,
                  transform: [
                    {
                      translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [14, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={colors.brandDeep}
                />
              </View>
              <Text style={styles.text} numberOfLines={2}>
                {message}
              </Text>
            </Animated.View>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 440,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.white,
    letterSpacing: 0.1,
  },
});
