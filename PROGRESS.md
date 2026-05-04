# Progress

Last updated: 2026-04-30

## Current Status

The repository has moved from a static prototype to an Expo React Native project.

The current app is not feature-complete yet. It has an initial mobile shell that visually ports the calendar home screen from the prototype, while the full add/edit, settlement, settings, Firebase, and Google Calendar flows still need to be implemented in React Native.

## Completed

- Created static HTML prototype for the work calendar app.
- Added calendar view, add/edit flow, settlement view, and settings view in the static prototype.
- Added privacy behavior:
  - Main calendar screen does not show money.
  - Settlement screen hides money by default.
  - Leaving settlement hides money again.
  - Shared schedules exclude money.
- Added payment status behavior:
  - New events default to unpaid.
  - Events can be toggled between paid and unpaid.
  - Settlement shows paid/unpaid totals.
  - Client settlement bars show paid/unpaid split.
- Added schedule sharing behavior in the prototype:
  - Today's end time share.
  - Monthly schedule share without money.
- Documented planned Firebase and Google Calendar architecture in `docs/architecture.md`.
- Preserved the static prototype under `prototype/`.
- Scaffolded Expo React Native TypeScript app at the repository root.
- Added first React Native mobile shell in `App.tsx`.
- Pushed all work to `origin/main`.

## Current Repository Shape

```text
App.tsx                  Expo mobile app shell
app.json                 Expo configuration
index.ts                 Expo entry point
package.json             npm scripts and dependencies
docs/architecture.md     Firebase / Google Calendar architecture notes
prototype/               Preserved static HTML prototype
```

## Latest Commits

```text
8fe5aaa Add initial mobile app shell
465503b Scaffold Expo app
225bd34 Move static prototype
081e77d Split prototype assets
0d05f8d Add settings prototype
8e29369 Document app architecture
c7a0549 Add work calendar prototype
```

## How To Run

```sh
cd /Users/ssiky/Projects/schduleJR
npm start
```

For Galaxy testing:

- Install Expo Go on the Galaxy phone.
- Keep the Mac and Galaxy phone on the same Wi-Fi.
- Scan the Expo QR code or open the Expo URL shown by the dev server.

## Next Work

### 1. Split React Native App Structure

Move the current single-file `App.tsx` into a maintainable source structure.

Target structure:

```text
src/
  data/
    seed.ts
  screens/
    CalendarScreen.tsx
    EventFormScreen.tsx
    SettlementScreen.tsx
    SettingsScreen.tsx
  types/
    index.ts
  utils/
    date.ts
    money.ts
```

### 2. Add Local State MVP

Implement the prototype behavior in React Native without Firebase first.

Needed:

- Bottom tab switching.
- Calendar date selection.
- Event add form.
- Event edit form.
- Payment status toggle.
- Location/client selection.
- Add new location/client.
- Settlement calculations.
- Money hide/show behavior.
- Settings toggles.

### 3. Add Data Types

Add typed models:

```ts
WorkEvent
Client
Location
UserSettings
PaymentStatus
```

### 4. Prepare Firebase Integration

After local MVP works:

- Add Firebase config placeholder.
- Add Firebase Auth.
- Add Firestore service layer.
- Store user-specific events, clients, locations, and settings.

### 5. Prepare Google Calendar Integration

After Firebase works:

- Add Google login flow.
- Add calendar selection.
- Create/update/delete Google Calendar events.
- Store `googleCalendarEventId` on app events.
- Never sync amount or payment status to Google Calendar.

## Important Product Decisions

- Firebase is the source of truth for app data and settlement records.
- Google Calendar is only for schedule visibility and sharing.
- Money must not be stored in Google Calendar events.
- Calendar/main screen should avoid exposing money.
- Settlement screen can show money only after explicit user action.

## Immediate Next Commit Recommendation

```text
Refactor mobile app into screens and shared types
```

Then:

```text
Implement local event state in mobile app
```

