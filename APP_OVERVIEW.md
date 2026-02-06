# Travel App — Overview for Everyone

This document explains how this travel app is organized. No coding experience needed.

---

## What This App Does (In Plain English)

This is a **travel itinerary app**. You can:

- Create trips and see them on a map
- Add reservations (flights, hotels, trains) to your trips
- Import travel details from screenshots
- View and edit your reservations
- Manage your profile and settings

---

## The Big Picture: How the App Is Laid Out

Think of the app like a **building with floors and rooms**:

1. **First floor (Auth)** — You see this when you open the app. It’s the welcome / sign-in area.
2. **Main building (Main)** — After you sign in, you enter the main part of the app.
3. **Tabs** — At the bottom of the main area, there are two tabs: **Home** and **Profile**. You can switch between them.
4. **Screens** — Each tab and each action can open different “screens” (full-page views).

---

## Where Everything Lives: Folder Map

Here’s where each part of the app lives in the project folders.

```
travel-app/
│
├── assets/                    ← Images (app icon, splash screen)
│
├── src/                       ← All the app code lives here
│   │
│   ├── components/            ← Reusable building blocks (buttons, cards, inputs)
│   │   ├── domain/            ← Trip-specific pieces (TripCard, TripMapPreview, etc.)
│   │   ├── navigation/        ← Top bar, bottom tab bar
│   │   └── ui/                ← Generic pieces (date picker, loading spinner, etc.)
│   │
│   ├── config/                ← App settings and configuration
│   │
│   ├── contexts/              ← “Who is logged in?” — shared state
│   │
│   ├── data/                  ← Where data comes from and goes
│   │   ├── mocks/             ← Sample data for testing
│   │   ├── services/          ← Talks to the database (trips, reservations, etc.)
│   │   └── supabase/          ← Database connection and helpers
│   │
│   ├── hooks/                 ← Reusable logic (e.g. “load my trips”)
│   │
│   ├── native/                ← Phone features (camera, image picker)
│   │
│   ├── navigation/            ← How screens connect and flow
│   │
│   ├── screens/               ← Each full-page view in the app
│   │   ├── auth/              ← Sign-in / welcome
│   │   ├── home/              ← Main dashboard
│   │   ├── trip/              ← Trip list, trip details, create trip, map
│   │   ├── reservation/       ← View/edit reservations, attachments
│   │   ├── import/            ← Screenshot upload, review details
│   │   ├── manual/            ← Manually add flights, hotels, trains
│   │   └── settings/          ← Profile
│   │
│   ├── theme/                 ← Colors, fonts, spacing (the look and feel)
│   │
│   ├── types/                 ← Definitions of data shapes
│   │
│   └── utils/                 ← Helper functions (format dates, addresses, etc.)
│
└── supabase/                  ← Database rules and setup
```

---

## Every Screen in the App (And Where It Lives)

### 1. Auth (Before You Sign In)

| Screen | Folder | What It Does |
|--------|--------|--------------|
| **Splash** | `screens/auth/` | Welcome screen with sign-in options (Email, Apple, Google) |

---

### 2. Main Tabs (Always Visible at Bottom)

| Tab | Screen | Folder | What It Does |
|-----|--------|--------|--------------|
| **Home** | Trip Dashboard | `screens/home/` | Your main view: upcoming trips, quick actions |
| **Profile** | Profile | `screens/settings/` | Your account, settings, sign out |

---

### 3. Trip Screens

| Screen | Folder | What It Does |
|--------|--------|--------------|
| **Trip List** | `screens/trip/` | List of all your trips |
| **Trip Overview** | `screens/trip/` | One trip’s details and timeline |
| **Create Trip** | `screens/trip/` | Form to create a new trip |
| **Map Expand** | `screens/trip/` | Full-screen map of a trip |

---

### 4. Reservation Screens

| Screen | Folder | What It Does |
|--------|--------|--------------|
| **Reservation Detail** | `screens/reservation/` | View one reservation (flight, hotel, etc.) |
| **Edit Reservation** | `screens/reservation/` | Change reservation details |
| **Reservation Attachments** | `screens/reservation/` | Photos/documents attached to a reservation |

---

### 5. Import Screens (Adding from Screenshots)

| Screen | Folder | What It Does |
|--------|--------|--------------|
| **Screenshot Upload** | `screens/import/` | Upload a screenshot of a booking |
| **Review Details** | `screens/import/` | Review and confirm extracted details |

---

### 6. Manual Entry Screens (Typing It In)

| Screen | Folder | What It Does |
|--------|--------|--------------|
| **Manual Entry Options** | `screens/manual/` | Choose what to add: flight, hotel, or train |
| **Flight Entry** | `screens/manual/` | Form to add a flight |
| **Lodging Entry** | `screens/manual/` | Form to add a hotel |
| **Train Entry** | `screens/manual/` | Form to add a train |

---

## How Screens Connect (The Flow)

```
                    ┌─────────────────┐
                    │     SPLASH      │  ← First thing you see
                    │  (Sign in here) │
                    └────────┬────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           MAIN APP (after sign-in)                          │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    BOTTOM TABS (always visible)                      │  │
│   │                                                                      │  │
│   │   [ Home ]                    [ Profile ]                            │  │
│   │   Trip Dashboard              Profile & Settings                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   From Home you can go to:                                                  │
│   • Trip List → Trip Overview → Map Expand                                  │
│   • Create Trip                                                             │
│   • Screenshot Upload → Review Details                                      │
│   • Manual Entry Options → Flight / Lodging / Train Entry                    │
│                                                                             │
│   From Trip Overview you can go to:                                         │
│   • Reservation Detail → Edit Reservation → Reservation Attachments         │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Screen → File

| Screen | File Path |
|--------|-----------|
| Splash | `src/screens/auth/SplashScreen.tsx` |
| Trip Dashboard | `src/screens/home/TripDashboardScreen.tsx` |
| Profile | `src/screens/settings/ProfileScreen.tsx` |
| Trip List | `src/screens/trip/TripListScreen.tsx` |
| Trip Overview | `src/screens/trip/TripOverviewScreen.tsx` |
| Create Trip | `src/screens/trip/CreateTripScreen.tsx` |
| Map Expand | `src/screens/trip/MapExpandScreen.tsx` |
| Reservation Detail | `src/screens/reservation/ReservationDetailScreen.tsx` |
| Edit Reservation | `src/screens/reservation/EditReservationScreen.tsx` |
| Reservation Attachments | `src/screens/reservation/ReservationAttachmentsScreen.tsx` |
| Screenshot Upload | `src/screens/import/ScreenshotUploadScreen.tsx` |
| Review Details | `src/screens/import/ReviewDetailsScreen.tsx` |
| Manual Entry Options | `src/screens/manual/ManualEntryOptionsScreen.tsx` |
| Flight Entry | `src/screens/manual/FlightEntryScreen.tsx` |
| Lodging Entry | `src/screens/manual/LodgingEntryScreen.tsx` |
| Train Entry | `src/screens/manual/TrainEntryScreen.tsx` |

---

## Summary

- **Screens** = full pages you see in the app.
- **Components** = smaller pieces (buttons, cards, inputs) used to build screens.
- **Data** = where trips and reservations are stored and loaded from.
- **Navigation** = how you move from one screen to another.

Everything is organized by purpose: auth, home, trips, reservations, import, manual entry, and settings.
