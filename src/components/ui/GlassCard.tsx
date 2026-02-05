import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { GlassView } from './GlassView';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GlassCard({ children, style }: GlassCardProps) {
  return <GlassView style={style}>{children}</GlassView>;
}
