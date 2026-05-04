import { Client, Location, UserSettings, WorkEvent } from "../types";

export const seedLocations: Location[] = [
  { id: "loc-1", name: "상암 스튜디오" },
  { id: "loc-2", name: "목동 방송센터" },
  { id: "loc-3", name: "강남 키친스튜디오" },
];

export const seedClients: Client[] = [
  { id: "client-1", name: "CJ온스타일" },
  { id: "client-2", name: "현대홈쇼핑" },
  { id: "client-3", name: "GS SHOP" },
];

export const seedEvents: WorkEvent[] = [
  {
    id: "event-1",
    date: "2026-04-12",
    startTime: "08:30",
    endTime: "13:30",
    locationId: "loc-1",
    clientId: "client-1",
    amount: 280000,
    paymentStatus: "paid",
    memo: "갈비찜 촬영",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "event-2",
    date: "2026-04-18",
    startTime: "14:00",
    endTime: "19:00",
    locationId: "loc-2",
    clientId: "client-2",
    amount: 320000,
    paymentStatus: "unpaid",
    memo: "반찬 세트",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "event-3",
    date: "2026-04-29",
    startTime: "10:00",
    endTime: "16:00",
    locationId: "loc-3",
    clientId: "client-3",
    amount: 350000,
    paymentStatus: "unpaid",
    memo: "밀키트 구성",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "event-4",
    date: "2026-04-25",
    startTime: "09:00",
    endTime: "12:00",
    locationId: "loc-1",
    clientId: "client-3",
    amount: 150000,
    paymentStatus: "paid",
    memo: "소스 촬영",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
];

export const seedSettings: UserSettings = {
  googleConnected: false,
  hideMoneyByDefault: true,
  syncToGoogleCalendar: false,
  selectedGoogleCalendarId: "mom-work",
};
