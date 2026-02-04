# Source Architecture

For detailed boundaries, scaling, and offline readiness see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

```
src/
├── components/
│   ├── domain/       (TripCard, QuickActionCard, TimelineCard)
│   ├── navigation/   (TabBar)
│   └── ui/           (FormInput, LoadingView, ErrorView, etc.)
├── config/           (Env validation)
├── constants/        (Feature config: tabs, timeline filters, etc.)
├── contexts/        (AuthContext — auth state for RootNavigator)
├── data/
│   ├── mocks/        (JSON mock data)
│   ├── services/     (tripService, reservationService, userService, placeAutocomplete)
│   └── supabase/     (client, mappers, errors, types)
├── hooks/            (useTrips, useReservations, useUser, useDeleteTrip, useAsyncData)
├── native/           (Expo API wrappers: pickImageFromLibrary — mockable)
├── navigation/       (RootNavigator, AuthNavigator, MainStack, MainTab, types)
├── screens/          (Feature-grouped: auth, home, trip, reservation, import, manual, settings)
├── theme/            (colors, spacing, typography, borderRadius, shadows)
├── types/            (Domain TypeScript interfaces)
└── utils/            (dateFormat, etc.)
```

## Data Flow Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Screen    │ ──> │    Hook     │ ──> │   Service   │
│ (Component) │     │ (useTrips)  │     │ (tripService│
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               v
                                        ┌─────────────┐
                                        │  Supabase   │
                                        │  (Postgres) │
                                        └─────────────┘
```

### Key Benefits
- **Separation of concerns**: UI components don't know where data comes from
- **Easy testing**: Mock services for unit tests
- **Production-ready**: Swap mock data for real API with minimal changes
- **Type safety**: Shared interfaces ensure consistency

## Data Types

```typescript
interface Trip {
  id: string;
  destination: string; // e.g. "Paris, France" (single display field)
  dateRange: string;
  durationLabel: string;
  imageUrl: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  iconName: 'airplane-ticket' | 'hotel' | 'train';
}

interface Reservation {
  id: string;
  tripId: string;
  type: 'flight' | 'hotel' | 'train' | 'car';
  providerName: string;
  route: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  confirmationCode: string;
  // ...more fields
}

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  title: string;
  memberSince: string;
  isPro: boolean;
}
```

## Custom Hooks

```typescript
// User hooks
useCurrentUser()     // Dashboard user
useProfileUser()     // Profile screen user
useAppSettings()     // App settings with update function

// Trip hooks
useTrips()           // All trips
useUpcomingTrips()   // Non-completed trips only
useTripById(id)      // Single trip
useTripTimeline(id)  // Timeline items for a trip
useQuickActions()    // Dashboard quick actions
useDeleteTrip()      // { deleteTrip(tripId), isDeleting } for mutations

// Reservation hooks
useReservations()              // All reservations
useReservationsByTrip(id)      // Reservations for a trip
useReservationById(id)         // Single reservation
useReservationByTimelineId(id) // Reservation from timeline
```

## Usage Example

```tsx
import { useUpcomingTrips, useCurrentUser } from '../hooks';

function TripDashboardScreen() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { trips, isLoading: tripsLoading } = useUpcomingTrips();

  if (userLoading || tripsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      {trips.map(trip => (
        <TripCard key={trip.id} {...trip} />
      ))}
    </View>
  );
}
```

## Backend

Trips and reservations use **Supabase** (see `data/supabase` and `data/services`). Auth and RLS are not yet used; `TEST_USER_ID` is fixed. When you add Supabase Auth, switch to `auth.uid()` and add RLS—services stay the same. **Components and hooks stay unchanged**; they only call services.

## Navigation Flow

Auth state is provided by `AuthProvider`; `RootNavigator` uses `useAuth()` to switch stacks.

```
App (AuthProvider)
├── Auth Stack (not logged in)
│   └── SplashScreen → Login buttons → signIn()
│
└── Main Stack (logged in)
    ├── Tabs (MainTabNavigator)
    │   ├── Home → TripDashboardScreen
    │   └── Profile → ProfileScreen (signOut via useAuth)
    ├── TripListScreen, TripOverviewScreen, CreateTripScreen
    ├── ReservationDetailScreen, EditReservationScreen, ReservationAttachmentsScreen
    ├── ScreenshotUploadScreen (modal), ReviewDetailsScreen
    └── ManualEntryOptionsScreen, FlightEntryScreen, LodgingEntryScreen, TrainEntryScreen
```

## Running the App

```bash
npm start
```
