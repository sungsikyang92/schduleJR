import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { addClient, addLocation, saveEvent, saveSettings, subscribeClients, subscribeEvents, subscribeLocations, subscribeSettings, toggleEventPayment } from "./src/services/db";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { EventFormScreen } from "./src/screens/EventFormScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SettlementScreen } from "./src/screens/SettlementScreen";
import { AppTab, Client, Location, UserSettings, WorkEvent } from "./src/types";
import { dateKey, formatFullDate, parseDateKey, todayKey } from "./src/utils/date";

const DEFAULT_SETTINGS: UserSettings = {
  googleConnected: false,
  hideMoneyByDefault: true,
  syncToGoogleCalendar: false,
};

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
  const [clients, setClients] = useState<Client[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | undefined>();
  const [events, setEvents] = useState<WorkEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [showMoney, setShowMoney] = useState(false);
  const [visibleDate, setVisibleDate] = useState(new Date(initialVisibleDate.getFullYear(), initialVisibleDate.getMonth(), 1));

  useEffect(() => {
    let resolved = 0;
    const tryResolve = () => {
      resolved += 1;
      if (resolved >= 4) setLoading(false);
    };

    const unsubEvents = subscribeEvents((data) => { setEvents(data); tryResolve(); });
    const unsubClients = subscribeClients((data) => { setClients(data); tryResolve(); });
    const unsubLocations = subscribeLocations((data) => { setLocations(data); tryResolve(); });
    const unsubSettings = subscribeSettings((data) => { setSettings(data); tryResolve(); });

    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubEvents();
      unsubClients();
      unsubLocations();
      unsubSettings();
      clearTimeout(timeout);
    };
  }, []);

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

  const handleSaveEvent = (draft: Omit<WorkEvent, "id" | "createdAt" | "updatedAt">, eventId?: string) => {
    selectDate(draft.date);
    setEditingEventId(undefined);
    setActiveTabState("calendar");
    saveEvent(draft, eventId);
  };

  const editEvent = (eventId: string) => {
    setEditingEventId(eventId);
    setActiveTabState("add");
  };

  const handleTogglePayment = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) await toggleEventPayment(event);
  };

  const handleUpdateSettings = async (next: Partial<UserSettings>) => {
    const updated = { ...settings, ...next };
    if (!updated.googleConnected) updated.syncToGoogleCalendar = false;
    if (typeof next.hideMoneyByDefault === "boolean") setShowMoney(!next.hideMoneyByDefault);
    setSettings(updated);
    await saveSettings(updated);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#315fbd" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            onTogglePayment={handleTogglePayment}
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
            onSave={handleSaveEvent}
          />
        ) : null}

        {activeTab === "settlement" ? (
          <SettlementScreen clients={clients} events={events} showMoney={showMoney} visibleDate={visibleDate} onToggleMoney={() => setShowMoney((current) => !current)} />
        ) : null}

        {activeTab === "settings" ? (
          <SettingsScreen
            settings={settings}
            onSelectCalendar={(selectedGoogleCalendarId) => handleUpdateSettings({ selectedGoogleCalendarId })}
            onToggleGoogle={() => handleUpdateSettings({ googleConnected: !settings.googleConnected })}
            onToggleHideMoney={() => handleUpdateSettings({ hideMoneyByDefault: !settings.hideMoneyByDefault })}
            onToggleSync={() => handleUpdateSettings({ googleConnected: true, syncToGoogleCalendar: !settings.syncToGoogleCalendar })}
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
  loadingContainer: { alignItems: "center", flex: 1, gap: 16, justifyContent: "center" },
  loadingText: { color: "#6f7782", fontSize: 15 },
  navItem: { alignItems: "center", borderRadius: 8, flex: 1, justifyContent: "center", minHeight: 54 },
  navText: { color: "#6f7782", fontSize: 12, fontWeight: "900" },
  safeArea: { backgroundColor: "#eef1f4", flex: 1 },
  subtle: { color: "#6f7782", fontSize: 13, marginTop: 2 },
  title: { color: "#171a1f", fontSize: 26, fontWeight: "900" },
});
