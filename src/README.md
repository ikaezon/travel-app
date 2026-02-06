# Source Structure

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for boundaries and data flow.

```
src/
├── components/      (domain, navigation, ui)
├── config/          (app configuration)
├── contexts/        (AuthContext)
├── data/            (mocks, services, supabase)
├── hooks/           (useTrips, useReservations, etc.)
├── native/          (Expo API wrappers)
├── navigation/      (routes and navigators)
├── screens/         (feature-grouped screens)
├── theme/           (colors, spacing, typography)
├── types/           (domain interfaces)
└── utils/           (dateFormat, addressFormat)
```

## Running

```bash
npm start
```
