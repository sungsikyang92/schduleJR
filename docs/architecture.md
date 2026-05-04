# Architecture

## Product Direction

The app should help manage freelance work schedules and settlement records while keeping money private.

The core rule is:

- Google Calendar stores schedule-safe information only.
- Firebase stores app data, money, settlement status, and sync metadata.

## Data Ownership

### Google Calendar

Google Calendar is used for schedule visibility across iPhone, Android, and family calendar sharing.

Calendar events should include:

- Client name
- Location name
- Start and end time
- Optional schedule memo

Calendar events should not include:

- Amount
- Payment status
- Settlement notes

### Firebase Firestore

Firestore is the source of truth for app-specific data.

Firestore stores:

- Work events
- Amounts
- Payment status
- Client list
- Location list
- User settings
- Google Calendar event IDs

## Collections

```text
users/{userId}
users/{userId}/workEvents/{eventId}
users/{userId}/clients/{clientId}
users/{userId}/locations/{locationId}
users/{userId}/settings/app
```

## Work Event

```ts
type WorkEvent = {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  clientId: string;
  locationId: string;
  amount: number;
  paymentStatus: "unpaid" | "paid";
  memo?: string;
  googleCalendarEventId?: string;
  createdAt: string;
  updatedAt: string;
};
```

## Settings

```ts
type UserSettings = {
  hideMoneyByDefault: boolean;
  syncToGoogleCalendar: boolean;
  selectedGoogleCalendarId?: string;
  reminderMinutesBefore?: number;
};
```

## Save Flow

1. User creates a work event in the app.
2. App saves the full work event to Firestore.
3. If Google Calendar sync is enabled, app creates a Google Calendar event without money fields.
4. App updates the Firestore work event with `googleCalendarEventId`.

## Update Flow

1. User edits date, time, client, location, memo, amount, or payment status.
2. App updates Firestore.
3. If the event has `googleCalendarEventId`, app updates only schedule-safe fields in Google Calendar.
4. Payment status and amount never sync to Google Calendar.

## Delete Flow

1. User deletes a work event.
2. App deletes or marks the Firestore event as deleted.
3. If the event has `googleCalendarEventId`, app deletes the Google Calendar event.

## Privacy Defaults

- Main calendar screen must not show money.
- Settlement screen must hide money by default.
- Leaving the settlement screen should hide money again.
- Shared messages should not include money.
- Google Calendar events should not include money.

