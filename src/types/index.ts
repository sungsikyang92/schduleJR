export type PaymentStatus = "paid" | "unpaid";

export type WorkEvent = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  clientId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  memo?: string;
  googleCalendarEventId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  name: string;
};

export type Location = {
  id: string;
  name: string;
};

export type UserSettings = {
  googleConnected: boolean;
  hideMoneyByDefault: boolean;
  syncToGoogleCalendar: boolean;
  selectedGoogleCalendarId?: string;
  reminderMinutesBefore?: number;
};

export type AppTab = "calendar" | "add" | "settlement" | "settings";
