import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { cn } from './cn';
import { Text } from './Text';

/** Decelerates in, accelerates out: no bounce, like the system sheets. */
const OPEN_TIMING = { duration: 320, easing: Easing.out(Easing.cubic) };
const CLOSE_TIMING = { duration: 240, easing: Easing.in(Easing.cubic) };

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Sheet({ visible, onClose, title, children, className }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Stays mounted while the closing animation plays, then the modal goes away.
  const [isMounted, setIsMounted] = useState(visible);
  /** 0 hidden, 1 open: drives both the backdrop and the sheet. */
  const progress = useSharedValue(0);
  if (visible && !isMounted) setIsMounted(true);

  useEffect(() => {
    if (visible) {
      progress.set(withTiming(1, OPEN_TIMING));
    } else {
      progress.set(
        withTiming(0, CLOSE_TIMING, (finished) => {
          if (finished) scheduleOnRN(setIsMounted, false);
        }),
      );
    }
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.get()) * height }],
  }));

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <Animated.View style={backdropStyle} className="absolute inset-0 bg-scrim">
        <Pressable role="button" aria-label="Fermer" onPress={onClose} className="flex-1" />
      </Animated.View>
      <View className="flex-1 justify-end" pointerEvents="box-none">
        <Animated.View
          className={cn('max-h-[92%] rounded-t-sheet bg-background px-6 pt-3', className)}
          style={[{ paddingBottom: insets.bottom + 16 }, sheetStyle]}
        >
          <View className="mb-3 h-1.5 w-10 self-center rounded-full bg-surface" />
          {title && (
            <Text variant="section" className="mb-3">
              {title}
            </Text>
          )}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
