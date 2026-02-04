declare module 'react-native-calendars' {
  import { Component, ReactNode } from 'react';
  import { ViewStyle } from 'react-native';

  export interface DateData {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
  }

  export interface MarkedDate {
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
    textColor?: string;
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    customStyles?: {
      container?: ViewStyle;
      text?: ViewStyle;
    };
  }

  export interface Theme {
    backgroundColor?: string;
    calendarBackground?: string;
    textSectionTitleColor?: string;
    selectedDayBackgroundColor?: string;
    selectedDayTextColor?: string;
    todayTextColor?: string;
    dayTextColor?: string;
    textDisabledColor?: string;
    arrowColor?: string;
    monthTextColor?: string;
    textDayFontSize?: number;
    textMonthFontSize?: number;
    textDayHeaderFontSize?: number;
  }

  export interface CalendarProps {
    initialDate?: string;
    onDayPress?: (date: DateData) => void;
    markedDates?: { [date: string]: MarkedDate };
    markingType?: 'period' | 'custom' | 'multi-dot' | 'multi-period';
    enableSwipeMonths?: boolean;
    theme?: Theme;
    renderArrow?: (direction: 'left' | 'right') => ReactNode;
  }

  export class Calendar extends Component<CalendarProps> {}
}
