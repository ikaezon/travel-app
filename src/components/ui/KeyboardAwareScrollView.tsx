import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  KeyboardAwareScrollView as RNKeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

interface KeyboardAwareScrollViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bottomOffset?: number;
  showsVerticalScrollIndicator?: boolean;
  scrollViewRef?: React.Ref<any>;
}

export function KeyboardAwareScrollView({
  children,
  style,
  contentContainerStyle,
  bottomOffset = 40,
  showsVerticalScrollIndicator = false,
  scrollViewRef,
}: KeyboardAwareScrollViewProps) {
  return (
    <RNKeyboardAwareScrollView
      ref={scrollViewRef}
      style={style}
      contentContainerStyle={contentContainerStyle}
      bottomOffset={bottomOffset}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </RNKeyboardAwareScrollView>
  );
}
