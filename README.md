# 근무캘린더앱

Calendar-based work schedule and settlement demo for freelance home-shopping food styling work.

This repository keeps shared agent instructions in `CLAUDE.md` for Claude and `~/.codex/AGENTS.md` for Codex.

## Expo App

This project is now scaffolded as an Expo React Native app.

```sh
npm install
npm start
```

For Galaxy testing, install Expo Go on the phone, keep the Mac and phone on the same Wi-Fi, then scan the QR code from the Expo dev server.

## Static Prototype

The first static HTML prototype is preserved under `prototype/`. It can be opened directly in a browser or served locally.

```sh
cd prototype
python3 -m http.server 8787
```

Then open:

```text
http://127.0.0.1:8787
```

## Implemented Prototype Features

- Calendar view with daily work events
- Add and edit work events
- Selectable clients and locations with add-new flows
- Default payment status as unpaid
- Toggle event payment status between paid and unpaid
- Privacy-focused main screen with no money shown
- Settlement tab with money hidden by default
- Auto-hide money after leaving the settlement tab
- Paid/unpaid breakdown by client with segmented bars
- Share today's end time without exposing money
- Share monthly schedules without exposing money
- Settings tab for Google account, Google Calendar sync, calendar selection, and money privacy defaults

## Planned Architecture

- App data and settlement records: Firebase Firestore
- Login: Google login, backed by Firebase Auth
- Schedule sync: Google Calendar API
- Calendar events should store only schedule-safe fields such as client, location, date, and time
- Money and payment status should remain in the app database, not in Google Calendar
