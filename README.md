# Travel App

A React Native (Expo) travel itinerary app backed by Supabase. Create trips, add reservations (flights, hotels, trains), import from screenshots, and manage everything in one place.

## Running

```bash
npm start
```

Copy `.env.example` to `.env` and fill in your Supabase and API keys.

## Project Structure

```
src/
├── components/
│   ├── domain/       # Feature components (TripCard, TimelineCard, etc.)
│   ├── navigation/   # TabBar, GlassNavHeader
│   └── ui/           # Shared UI (FormInput, AdaptiveGlassView, etc.)
├── config/           # App configuration
├── contexts/         # AuthContext, ThemeContext
├── data/
│   ├── mocks/        # Mock data for development
│   ├── services/     # API layer (tripService, reservationService)
│   └── supabase/     # Database client, mappers, error handling
├── hooks/            # Custom hooks (useTrips, useReservations, etc.)
├── native/           # Expo API wrappers (image picker)
├── navigation/       # React Navigation setup
├── screens/          # Feature-grouped screens
├── theme/            # Design tokens and theming
├── types/            # TypeScript interfaces
└── utils/            # Utility functions
```

## Architecture

```
Screen → Hook → Service → Supabase
```

| Layer   | Responsibility                                |
|---------|-----------------------------------------------|
| Screen  | UI composition, navigation, calls hooks       |
| Hook    | Data fetching, loading/error state, mutations |
| Service | Database access, type mapping, error wrapping |

**State management:** UI state is local `useState`. Server state flows through hooks with `useAsyncData`. Auth state lives in `AuthContext`. Theme state lives in `ThemeContext`.

## Theming

The app supports dark and light mode through a single, centralized theming system.

### How It Works

One context (`ThemeContext`) provides all resolved theme values. Components never compute colors from raw palettes or check `isDark` for color decisions.

```tsx
const { colors, glass } = useTheme();

// Colors resolve automatically per mode
<Text style={{ color: colors.text.primary }}>Hello</Text>

// Glass styles include pre-computed border, shadow, and background
<View style={[styles.card, glass.cardWrapperStyle]}>
  <View style={[styles.overlay, { backgroundColor: glass.overlay }]} />
</View>
```

### Theme API

| Property | Type | Description |
|----------|------|-------------|
| `colors` | `ResolvedColors` | Semantic colors (text, background, status, etc.) |
| `glass` | `ResolvedGlass` | Glass effect values + pre-computed style objects |
| `gradient` | `[string, string, string]` | Background gradient colors |
| `blurTint` | `'light' \| 'dark'` | Blur tint for BlurView |
| `isDark` | `boolean` | Current mode (use sparingly — for platform APIs) |
| `setDarkMode` | `(value: boolean) => Promise<void>` | Toggle dark mode |

### Pre-computed Glass Styles

The `glass` object includes style objects that eliminate per-component dark/light conditionals:

- `glass.cardWrapperStyle` — border width, color, and box shadow for glass cards
- `glass.iconContainerStyle` — border, background for icon containers
- `glass.navWrapperStyle` — border and shadow for navigation bars
- `glass.pillContainerStyle` — border for pill/badge containers

### When `isDark` Is Appropriate

Use `isDark` only for:
- Platform APIs (`StatusBar style`, `MapView userInterfaceStyle`)
- Animation strategy (`isNativeGlassActive` — native glass vs BlurView)
- Dark-mode-only visual effects (gradient borders, highlights)

### Theme Files

```
src/theme/
├── colors.ts        # Color palettes + getThemeColors(isDark)
├── glassStyles.ts   # Glass constants, structural styles, getResolvedGlass(isDark)
├── spacing.ts       # Spacing scale + layout constants
├── typography.ts    # Font families (Outfit)
├── borderRadius.ts  # Border radius scale
├── shadows.ts       # Native shadow presets
└── index.ts         # Barrel exports
```

## Screens

| Screen | File |
|--------|------|
| Splash | `screens/auth/SplashScreen.tsx` |
| Trip Dashboard | `screens/home/TripDashboardScreen.tsx` |
| Profile | `screens/settings/ProfileScreen.tsx` |
| Trip List | `screens/trip/TripListScreen.tsx` |
| Trip Overview | `screens/trip/TripOverviewScreen.tsx` |
| Create Trip | `screens/trip/CreateTripScreen.tsx` |
| Map Expand | `screens/trip/MapExpandScreen.tsx` |
| Reservation Detail | `screens/reservation/ReservationDetailScreen.tsx` |
| Edit Reservation | `screens/reservation/EditReservationScreen.tsx` |
| Attachments | `screens/reservation/ReservationAttachmentsScreen.tsx` |
| Screenshot Upload | `screens/import/ScreenshotUploadScreen.tsx` |
| Review Details | `screens/import/ReviewDetailsScreen.tsx` |
| Manual Entry | `screens/manual/ManualEntryOptionsScreen.tsx` |
| Flight Entry | `screens/manual/FlightEntryScreen.tsx` |
| Lodging Entry | `screens/manual/LodgingEntryScreen.tsx` |
| Train Entry | `screens/manual/TrainEntryScreen.tsx` |

## Engineering Principles

- Optimize for readability and long-term maintainability.
- Components render UI and call hooks. Business logic lives in services.
- Every abstraction must earn its existence. Prefer boring, explicit code.
- Delete unused code aggressively. If code needs a comment to be understood, simplify it.

See `.cursor/rules/react-best-practices.mdc` for detailed coding standards.
