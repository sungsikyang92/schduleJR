# Progress

Last updated: 2026-05-04

## Current Status

The repository has moved from a static prototype to an Expo React Native project.

The current app has a local-state React Native MVP. It includes calendar navigation, date selection, event add/edit, payment toggling, settlement summaries, money privacy behavior, and settings toggles. Firebase and Google Calendar integration still need to be implemented.

The app is also runnable in Expo web for quick iPhone/Safari preview through the Mac mini's Tailscale address.

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
- Split the React Native app into `src/` screens, typed seed data, and utility modules.
- Implemented local-state MVP behavior in React Native:
  - Bottom tab switching.
  - Calendar date/month selection.
  - Event add/edit form.
  - Payment status toggle.
  - Location/client selection and add-new flows.
  - Settlement calculations with paid/unpaid split.
  - Money hide/show behavior.
  - Settings toggles for Google connection, calendar sync, calendar selection, and money privacy.
- Fixed mobile web calendar layout so all 7 weekday columns fit on narrow iPhone-sized screens.
- Changed initial selected calendar date to today's date instead of the previous hardcoded prototype date.
- Added Expo web dependencies (`react-dom`, `react-native-web`) so the React Native app can be previewed in Chrome/Safari.
- Improved the add-event form:
  - Save now applies placeholder defaults for start time, end time, and amount when those fields are left untouched.
  - Start/end time inputs are now dropdown-style selectors instead of free-text inputs.
  - Missing required selections now show a direct validation alert.
- Removed the settlement screen's `금액 제외 일정 공유` button and related share logic.
- Fixed the settings `정산 금액 기본 숨김` control so it actually changes settlement money visibility behavior.
- Replaced settings boolean action buttons with switch controls for clearer on/off behavior.
- Pushed all work to `origin/main`.

## Current Repository Shape

```text
App.tsx                  Expo mobile app shell
app.json                 Expo configuration
index.ts                 Expo entry point
package.json             npm scripts and dependencies
package-lock.json        Locked npm dependency graph including Expo web dependencies
docs/architecture.md     Firebase / Google Calendar architecture notes
prototype/               Preserved static HTML prototype
src/data/seed.ts         Local seed clients, locations, events, settings
src/screens/             Calendar, form, settlement, and settings screens
src/types/index.ts       Shared app data models
src/utils/               Date and money formatting helpers
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

For web preview:

```sh
cd /Users/ssiky/Projects/schduleJR
npx expo start --web --port 8082
```

Current local web URL:

```text
http://localhost:8082
```

When Tailscale is connected on the Mac mini and iPhone, the iPhone can open the Mac mini's Tailscale IP with the same port.

For Galaxy testing:

- Install Expo Go on the Galaxy phone.
- Keep the Mac and Galaxy phone on the same Wi-Fi.
- Scan the Expo QR code or open the Expo URL shown by the dev server.

## Next Work

### 1. Polish Local MVP UX

Needed before backend integration:

- Add delete event behavior.
- Add stronger date and amount validation.
- Polish dropdown behavior on native Expo Go if needed.
- Add persistent local storage or a temporary storage service boundary.
- Test on Galaxy via Expo Go and tune mobile layout spacing.

### 2. Prepare Firebase Integration

After local MVP works:

- Add Firebase config placeholder.
- Add Firebase Auth.
- Add Firestore service layer.
- Store user-specific events, clients, locations, and settings.

### 3. Prepare Google Calendar Integration

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
Polish local MVP validation and persistence boundary
```

Then:

```text
Add Firebase Auth and Firestore service layer
```
