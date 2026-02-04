# Travel App – Architecture & Conventions

This document describes the current architecture, boundaries, and how to scale the app for offline support, collaboration, and new features.

---

## 1. Folder Structure (Current vs Target)

### Current layout

```
src/
├── components/     # Tech-based: domain vs ui vs navigation
├── config/
├── constants/
├── data/           # services, supabase, mocks
├── hooks/
├── navigation/
├── screens/        # Feature-grouped: auth, home, trip, reservation, etc.
├── theme/
├── types/
└── utils/
```

**What works well**

- **Screens** are already grouped by feature (auth, home, trip, reservation, import, manual, settings). This scales: add new screens under the right feature folder.
- **Data layer** is clear: `data/services` for API calls, `data/supabase` for client/mappers/errors, `data/mocks` for static/seed data. No business logic in components.
- **Hooks** sit between screens and services; they own loading/error/refetch. Same pattern for trips and reservations.
- **Theme** is centralized (colors, spacing, typography, borderRadius, shadows). Use it everywhere; avoid hardcoded hex values in screens.

**Anti-patterns to avoid**

- **Tech-based component folders** (`components/domain`, `components/ui`) can become dumping grounds. Prefer:
  - **Shared primitives** in `components/ui` (Button, Text, Card, Spacer, FormInput, etc.).
  - **Feature-specific components** colocated with the feature (e.g. under the feature that owns the screen) or in `components/domain` only when reused across features.
- **Global “helpers”** in `utils/`: keep utils small and focused; move feature-specific helpers next to the feature or in the data layer.
- **Leaking navigation into domain logic**: navigation is “go to screen X with params”; domain logic is “delete trip”, “create reservation”. Keep them separate so domain can be tested and reused (e.g. from an action queue for offline).

### Target (feature-based scaling)

As the app grows, you can evolve toward this without a big-bang move:

```
src/
├── core/                    # Shared, non-feature-specific
│   ├── config/
│   ├── theme/
│   ├── types/               # Shared domain types only
│   └── utils/
├── shared/                  # Shared across features
│   ├── components/          # ui primitives + domain components (TripCard, etc.)
│   └── navigation/
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── context/         # AuthContext
│   │   └── index.ts
│   ├── trip/
│   │   ├── screens/
│   │   ├── hooks/
│   │   └── index.ts
│   ├── reservation/
│   ├── home/
│   ├── settings/
│   ├── import/
│   └── manual-entry/
└── data/                    # Data access only
    ├── supabase/
    ├── services/
    └── mocks/
```

**Migration strategy**: Introduce new code in the target locations (e.g. `features/auth/context`) and re-export from existing paths if needed. Move one feature at a time. Do not move everything in one go.

---

## 2. Boundaries

| Layer            | Responsibility |
|-----------------|-----------------|
| **Screens**     | Compose UI, handle navigation (e.g. `navigation.navigate`), call hooks and shared components. No direct `tripService` or Supabase calls; use hooks or dedicated action hooks. |
| **Hooks**       | Server state: fetch, loading, error, refetch. Optionally mutate (e.g. `useDeleteTrip`). No navigation. |
| **Services**    | Data access only: Supabase queries, mappers, error wrapping. No React, no navigation. |
| **Supabase**    | Client, RLS (when used), types, mappers, errors. Services depend on this. |
| **Navigation**  | Route definitions, param lists, auth/main switch. No business logic. |
| **Theme / UI**  | Tokens and primitives. Screens use theme; no one-off hex values in screens. |

---

## 3. State Management

- **UI state**: Local `useState` (e.g. modal open, segment selection). Keep it in the component or lift only as far as needed.
- **Server state**: In hooks backed by `useAsyncData` + services. No global server-state store yet; add one (e.g. React Query or a small cache) when you need caching or offline.
- **Auth state**: In `AuthContext` (see below). RootNavigator only reads from context.
- **Domain state**: Encapsulated in hooks (e.g. “delete trip” returns a function that calls service and then navigates or invalidates; navigation stays in the screen).

---

## 4. Navigation

- **Auth vs Main**: Root navigator switches between Auth and Main based on `AuthContext`. No auth state in navigator components.
- **Nested stacks**: Tabs → Stack (TripList, TripOverview, CreateTrip, ReservationDetail, etc.). Param lists are typed in `navigation/types.ts`.
- **Params**: Reservation flow uses a single param that can be a **timeline item id** (from TripOverview) or **reservation id** (from deep links or future flows). Screens that need a reservation use `useReservationByTimelineId` or `useReservationById` as appropriate. See `MainStackParamList` and screen comments.
- **No prop drilling**: Use `useNavigation()` and `useRoute()`; for auth, use `useAuth()`.

---

## 5. Supabase & Data Layer

- **Single client**: `data/supabase/client.ts`. Config from env.
- **Services**: `tripService`, `reservationService`, `userService`, place autocomplete. They call Supabase and map DB ↔ domain types. All errors go through `wrapDatabaseError` so production gets safe, generic messages.
- **No auth/RLS yet**: User id is fixed for now. When you add Supabase Auth, switch to `auth.uid()` and add RLS; the service layer stays the same.
- **Offline readiness**: Services are pure async functions. You can later add a cache layer (e.g. in hooks or a small store) and optimistic updates without changing service signatures.

---

## 6. Offline-First Readiness

- **Where it breaks today**: Any screen that fetches on focus or load will show loading/error when offline. No local cache, no optimistic writes.
- **Enabling offline later**:
  - Keep services as the “source of truth” interface; add a cache (e.g. in-memory or persisted) that hooks read from and that services update.
  - Optimistic updates: hooks can expose `mutate(data)` that updates local state and enqueues a sync; services stay the same.
  - Do not put offline logic inside UI components; keep it in hooks or a dedicated sync layer.

---

## 7. Error Handling

- **Data layer**: All Supabase errors wrapped in `DatabaseError`; production messages are generic.
- **UI**: Use shared `ErrorView` (and `LoadingView`) where possible so behavior and copy are consistent. For mutations (e.g. delete trip), show an alert or inline message; avoid silent failures.
- **Central place**: `data/supabase/errors.ts` for mapping and messages. Add network-level handling (e.g. “You’re offline”) in hooks or a small error handler when you add offline support.

---

## 8. Expo & Native APIs

- **Abstraction**: Image picking, SecureStore, Haptics, etc. are behind a small `native/` (or `platform/`) module. UI calls `native.pickImage()` instead of `expo-image-picker` directly so tests can mock and behavior is consistent (e.g. permissions, errors).
- **Constraints**: Expo Go–compatible; no custom native code. Choose Expo APIs that work in managed workflow.

---

## 9. Naming & Imports

- **Components**: PascalCase; one main component per file; default export for screens, named for shared components if preferred.
- **Hooks**: `use` prefix; colocate with feature or in `hooks/` when shared.
- **Services**: `xService`; live in `data/services/`.
- **Imports**: Prefer `@/` or `../../` consistently; avoid deep relative paths for shared code (use barrel exports from `theme`, `hooks`, etc.).

---

## 10. Technical Debt & Decisions

- **Route param naming**: `ReservationDetail` (and Edit/Attachments) accept a param that is often a timeline item id. Type and param name are kept as `reservationId` for API stability; hooks like `useReservationByTimelineId` document the dual use. When you add deep links, consider separate params if needed.
- **MainStackNavigator**: All screens imported in one file; no lazy loading. When bundle size matters, switch to `React.lazy` + `Suspense` for heavy screens.
- **TEST_USER_ID**: In `data/supabase/constants.ts`. Replace with `auth.uid()` when Supabase Auth is enabled.
