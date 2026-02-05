import {
  MapPinPlus,
  ImagePlus,
  PenSquare,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react-native';

export const QUICK_ACTION_ICON_MAP = {
  'map-pin-plus': MapPinPlus,
  'image-plus': ImagePlus,
  'pen-square': PenSquare,
} as const satisfies Record<string, LucideIcon>;

export type QuickActionIconKey = keyof typeof QUICK_ACTION_ICON_MAP;
export { ChevronRight };
