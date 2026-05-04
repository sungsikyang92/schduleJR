import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { seedClients, seedEvents, seedLocations, seedSettings } from "./src/data/seed";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { EventFormScreen } from "./src/screens/EventFormScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SettlementScreen } from "./src/screens/SettlementScreen";
import { AppTab, Client, Location, UserSettings, WorkEvent } from "./src/types";
import { dateKey, formatFullDate, parseDateKey, todayKey } from "./src/utils/date";

const tabLabels: Record<AppTab, string> = {
  calendar: "캘린더",
  add: "추가",
  settlement: "정산",
  settings: "설정",
};

export default function App() {
  const initialDate = todayKey();
  const initialVisibleDate = parseDateKey(initialDate);
  const [activeTab, setActiveTabState] = useState<AppTab>("calendar");
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [editingEventId, setEditingEventId] = useState<string | undefined>();
  const [events, setEvents] = useState<WorkEvent[]>(seedEvents);
  const [locations, setLocations] = useState<Location[]>(seedLocations);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [settings, setSettings] = useState<UserSettings>(seedSettings);
  const [showMoney, setShowMoney] = useState(false);
  const [visibleDate, setVisibleDate] = useState(new Date(initialVisibleDate.getFullYear(), initialVisibleDate.getMonth(), 1));

  const editingEvent = events.find((event) => event.id === editingEventId);

  const setActiveTab = (tab: AppTab) => {
    if (activeTab === "settlement" && tab !== "settlement" && settings.hideMoneyByDefault) {
      setShowMoney(false);
    }
    if (tab === "settlement") {
      setShowMoney(!settings.hideMoneyByDefault);
    }
    if (tab === "add" && activeTab !== "add") {
      setEditingEventId(undefined);
    }
    setActiveTabState(tab);
  };

  const selectDate = (value: string) => {
    const date = parseDateKey(value);
    setSelectedDate(value);
    setVisibleDate(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const changeMonth = (offset: number) => {
    setVisibleDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const addLocation = (name: string) => {
    const location = { id: `loc-${Date.now()}`, name };
    setLocations((current) => [...current, location]);
    return location.id;
  };

  const addClient = (name: string) => {
    const client = { id: `client-${Date.now()}`, name };
    setClients((current) => [...current, client]);
    return client.id;
  };

  const saveEvent = (draft: Omit<WorkEvent, "id" | "createdAt" | "updatedAt">, eventId?: string) => {
    const now = new Date().toISOString();
    setEvents((current) => {
      const existing = current.find((event) => event.id === eventId);
      if (!existing) {
        return [...current, { ...draft, id: `event-${Date.now()}`, createdAt: now, updatedAt: now }];
      }
      return current.map((event) => (event.id === eventId ? { ...event, ...draft, updatedAt: now } : event));
    });
    selectDate(draft.date);
    setEditingEventId(undefined);
    setActiveTabState("calendar");
  };

  const editEvent = (eventId: string) => {
    setEditingEventId(eventId);
    setActiveTabState("add");
  };

  const togglePayment = (eventId: string) => {
    const now = new Date().toISOString();
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              paymentStatus: event.paymentStatus === "paid" ? "unpaid" : "paid",
              updatedAt: now,
            }
          : event,
      ),
    );
  };

  const updateSettings = (next: Partial<UserSettings>) => {
    setSettings((current) => {
      const updated = { ...current, ...next };
      if (!updated.googleConnected) {
        updated.syncToGoogleCalendar = false;
      }
      if (typeof next.hideMoneyByDefault === "boolean") {
        setShowMoney(!next.hideMoneyByDefault);
      }
      return updated;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appFrame}>
        <View style={styles.header}>
          <Text style={styles.title}>근무 캘린더</Text>
          <Text style={styles.subtle}>{formatFullDate(selectedDate)}</Text>
        </View>

        {activeTab === "calendar" ? (
          <CalendarScreen
            clients={clients}
            events={events}
            locations={locations}
            selectedDate={selectedDate}
            visibleDate={visibleDate}
            onAdd={() => setActiveTab("add")}
            onEdit={editEvent}
            onMonthChange={changeMonth}
            onSelectDate={selectDate}
            onTogglePayment={togglePayment}
          />
        ) : null}

        {activeTab === "add" ? (
          <EventFormScreen
            clients={clients}
            editingEvent={editingEvent}
            locations={locations}
            selectedDate={selectedDate}
            onAddClient={addClient}
            onAddLocation={addLocation}
            onCancel={() => {
              setEditingEventId(undefined);
              setActiveTab("calendar");
            }}
            onSave={saveEvent}
          />
        ) : null}

        {activeTab === "settlement" ? (
          <SettlementScreen clients={clients} events={events} showMoney={showMoney} visibleDate={visibleDate} onToggleMoney={() => setShowMoney((current) => !current)} />
        ) : null}

        {activeTab === "settings" ? (
          <SettingsScreen
            settings={settings}
            onSelectCalendar={(selectedGoogleCalendarId) => updateSettings({ selectedGoogleCalendarId })}
            onToggleGoogle={() => updateSettings({ googleConnected: !settings.googleConnected })}
            onToggleHideMoney={() => updateSettings({ hideMoneyByDefault: !settings.hideMoneyByDefault })}
            onToggleSync={() => updateSettings({ googleConnected: true, syncToGoogleCalendar: !settings.syncToGoogleCalendar })}
          />
        ) : null}

        <View style={styles.bottomNav}>
          {(Object.keys(tabLabels) as AppTab[]).map((tab) => (
            <TouchableOpacity key={tab} style={[styles.navItem, activeTab === tab && styles.activeNavItem]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.navText, activeTab === tab && styles.activeNavText]}>{tabLabels[tab]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeNavItem: { backgroundColor: "#315fbd" },
  activeNavText: { color: "#fff" },
  appFrame: { backgroundColor: "#f7f8fa", flex: 1 },
  bottomNav: { backgroundColor: "#fff", borderTopColor: "#e3e7ec", borderTopWidth: 1, flexDirection: "row", gap: 8, paddingBottom: 10, paddingHorizontal: 10, paddingTop: 8 },
  header: { backgroundColor: "#fff", borderBottomColor: "#e3e7ec", borderBottomWidth: 1, paddingBottom: 16, paddingHorizontal: 22, paddingTop: 14 },
  navItem: { alignItems: "center", borderRadius: 8, flex: 1, justifyContent: "center", minHeight: 54 },
  navText: { color: "#6f7782", fontSize: 12, fontWeight: "900" },
  safeArea: { backgroundColor: "#eef1f4", flex: 1 },
  subtle: { color: "#6f7782", fontSize: 13, marginTop: 2 },
  title: { color: "#171a1f", fontSize: 26, fontWeight: "900" },
});
