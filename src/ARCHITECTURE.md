# Travel App – Architecture

## Folder Structure

```
src/
├── components/
│   ├── domain/       # Feature-specific components (TripCard, TimelineCard, etc.)
│   ├── navigation/   # Navigation components (TabBar, GlassNavHeader)
│   └── ui/           # Shared UI primitives (FormInput, LoadingView, etc.)
├── config/           # App configuration (env, feature flags)
├── contexts/         # React contexts (AuthContext)
├── data/
│   ├── mocks/        # Mock data for development
│   ├── services/     # API layer (tripService, reservationService)
│   └── supabase/     # Database client, mappers, error handling
├── hooks/            # Custom React hooks (useTrips, useReservations, etc.)
├── native/           # Expo API wrappers (image picker)
├── navigation/       # React Navigation setup
├── screens/          # Feature-grouped screens
├── theme/            # Design tokens (colors, spacing, typography)
├── types/            # TypeScript interfaces
└── utils/            # Utility functions
```

## Data Flow

```
Screen → Hook → Service → Supabase
```

- **Screens** call hooks and compose UI
- **Hooks** manage loading/error/data state
- **Services** handle database queries and mapping
- **Supabase** provides persistence

## Boundaries

| Layer     | Responsibility                                    |
|-----------|---------------------------------------------------|
| Screen    | UI composition, navigation, calls hooks           |
| Hook      | Data fetching, loading/error state, mutations     |
| Service   | Database access, type mapping, error wrapping     |
| Theme/UI  | Design tokens and reusable components             |

## State Management

- **UI state**: Local `useState`
- **Server state**: Hooks with `useAsyncData`
- **Auth state**: `AuthContext`

## Error Handling

All database errors are wrapped in `DatabaseError` with generic production messages.
UI uses shared `LoadingView` and `ErrorView` components.
