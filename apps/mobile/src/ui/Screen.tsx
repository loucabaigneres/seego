import type { ReactElement, ReactNode, Ref } from 'react';
import { ScrollView, View, type RefreshControlProps, type ScrollViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { cn } from './cn';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentClassName?: string;
  /** Pull-to-refresh; only with `scroll`. */
  refreshControl?: ReactElement<RefreshControlProps>;
  /** Only with `scroll`: indices of the children that stick to the top once reached. */
  stickyHeaderIndices?: number[];
  /** Only with `scroll`. */
  scrollRef?: Ref<ScrollView>;
  /** Only with `scroll`. */
  onScroll?: ScrollViewProps['onScroll'];
  /** Only with `scroll`: false hands vertical drags to the content (a map, say). */
  scrollEnabled?: boolean;
  /** Pinned under the content (an action bar), outside the scroll. */
  footer?: ReactNode;
}

export function Screen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  contentClassName,
  refreshControl,
  stickyHeaderIndices,
  scrollRef,
  onScroll,
  scrollEnabled,
  footer,
}: ScreenProps) {
  const contentClasses = cn('px-6 py-6', contentClassName);

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      {scroll ? (
        <ScrollView
          contentContainerClassName={cn('grow', contentClasses)}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          stickyHeaderIndices={stickyHeaderIndices}
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={onScroll ? 16 : undefined}
          scrollEnabled={scrollEnabled}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn('flex-1', contentClasses)}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}
