import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  KeyboardAwareScrollView as RNKeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface KeyboardScrollContextValue {
  scrollToInput: (containerRef: React.RefObject<any>) => void;
}

const KeyboardScrollContext = createContext<KeyboardScrollContextValue>({
  scrollToInput: () => {},
});

export function useKeyboardScroll() {
  return useContext(KeyboardScrollContext);
}

interface KeyboardAwareScrollViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bottomOffset?: number;
  showsVerticalScrollIndicator?: boolean;
}

export function KeyboardAwareScrollView({
  children,
  style,
  contentContainerStyle,
  bottomOffset = 40,
  showsVerticalScrollIndicator = false,
}: KeyboardAwareScrollViewProps) {
  const scrollRef = useRef<any>(null);
  const scrollOffsetRef = useRef(0);
  const keyboardHeightRef = useRef(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      keyboardHeightRef.current = e.endCoordinates.height;
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
  }, []);

  const scrollToInput = useCallback((containerRef: React.RefObject<any>) => {
    const kbHeight = keyboardHeightRef.current;
    if (kbHeight === 0) return;

    containerRef.current?.measureInWindow(
      (_x: number, y: number, _width: number, height: number) => {
        const keyboardTop = SCREEN_HEIGHT - kbHeight;
        const desiredTop = keyboardTop - bottomOffset - height;
        const delta = y - desiredTop;

        if (delta < -10) {
          scrollRef.current?.scrollTo({
            y: Math.max(0, scrollOffsetRef.current + delta - 30),
            animated: true,
          });
        }
      },
    );
  }, [bottomOffset]);

  const contextValue = useMemo(() => ({ scrollToInput }), [scrollToInput]);

  return (
    <KeyboardScrollContext.Provider value={contextValue}>
      <RNKeyboardAwareScrollView
        ref={scrollRef}
        style={style}
        contentContainerStyle={contentContainerStyle}
        bottomOffset={bottomOffset}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {children}
      </RNKeyboardAwareScrollView>
    </KeyboardScrollContext.Provider>
  );
}
