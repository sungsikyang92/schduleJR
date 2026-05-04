import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Client, Location, WorkEvent } from "../types";
import { buildCalendarDays, currentTimeKey, dateKey, formatFullDate, formatShortDate, monthTitle, todayKey } from "../utils/date";

type Props = {
  clients: Client[];
  events: WorkEvent[];
  locations: Location[];
  selectedDate: string;
  visibleDate: Date;
  onAdd: () => void;
  onEdit: (eventId: string) => void;
  onMonthChange: (offset: number) => void;
  onSelectDate: (date: string) => void;
  onTogglePayment: (eventId: string) => void;
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarScreen({
  clients,
  events,
  locations,
  selectedDate,
  visibleDate,
  onAdd,
  onEdit,
  onMonthChange,
  onSelectDate,
  onTogglePayment,
}: Props) {
  const days = buildCalendarDays(visibleDate);
  const selectedEvents = events.filter((event) => event.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const todayEvents = events.filter((event) => event.date === todayKey());
  const nextEvent = events
    .filter((event) => event.date > todayKey() || (event.date === todayKey() && event.startTime > currentTimeKey()))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0];

  const getClient = (id: string) => clients.find((client) => client.id === id)?.name ?? "";
  const getLocation = (id: string) => locations.find((location) => location.id === id)?.name ?? "";

  const shareTodayEnd = async () => {
    const lastEvent = [...todayEvents].sort((a, b) => b.endTime.localeCompare(a.endTime))[0];
    if (!lastEvent) {
      Alert.alert("공유할 일정 없음", "오늘 등록된 일정이 없습니다.");
      return;
    }
    await Share.share({ message: `오늘 ${lastEvent.endTime}에 끝날 예정입니다. (${getLocation(lastEvent.locationId)})` });
  };

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>오늘 일정</Text>
          <Text style={styles.summaryValue}>{todayEvents.length}건</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>다음 근무</Text>
          <Text style={styles.summaryValue}>{nextEvent ? `${formatShortDate(nextEvent.date)} ${nextEvent.startTime}` : "없음"}</Text>
        </View>
      </View>

      <View style={styles.monthRow}>
        <TouchableOpacity style={styles.squareButton} onPress={() => onMonthChange(-1)}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthTitle(visibleDate)}</Text>
        <TouchableOpacity style={styles.squareButton} onPress={() => onMonthChange(1)}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayGrid}>
        {weekdays.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {days.map((day) => {
          const hasEvent = events.some((event) => event.date === day.key);
          const isSelected = day.key === selectedDate;
          const isToday = day.key === dateKey(new Date());
          return (
            <View key={day.key} style={styles.daySlot}>
              <TouchableOpacity
                style={[styles.dayCell, !day.isCurrentMonth && styles.outsideDayCell, isToday && styles.todayDayCell, isSelected && styles.selectedDayCell]}
                onPress={() => onSelectDate(day.key)}
              >
                <Text style={[styles.dayText, !day.isCurrentMonth && styles.outsideDayText, isToday && styles.todayDayText, isSelected && styles.selectedDayText]}>{day.day}</Text>
                <View style={[styles.eventDot, !hasEvent && styles.emptyDot, isToday && styles.todayDot, isSelected && hasEvent && styles.selectedEventDot]} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.panel}>
        <View style={styles.panelTitleRow}>
          <View>
            <Text style={styles.panelTitle}>{formatShortDate(selectedDate)} 일정</Text>
            <Text style={styles.subtle}>{formatFullDate(selectedDate)}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={shareTodayEnd}>
              <Text style={styles.secondaryButtonText}>퇴근 공유</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onAdd}>
              <Text style={styles.primaryButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {selectedEvents.length ? (
          selectedEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventTopRow}>
                <View>
                  <Text style={styles.eventClient}>{getClient(event.clientId)}</Text>
                  <Text style={styles.eventLocation}>{getLocation(event.locationId)}</Text>
                </View>
                <Text style={styles.timeBadge}>
                  {event.startTime}-{event.endTime}
                </Text>
              </View>
              <View style={styles.badgeRow}>
                <Text style={[styles.badge, event.paymentStatus === "paid" ? styles.paidBadge : styles.unpaidBadge]}>
                  {event.paymentStatus === "paid" ? "지급완료" : "미지급"}
                </Text>
                {event.memo ? <Text style={styles.badge}>{event.memo}</Text> : null}
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => onEdit(event.id)}>
                  <Text style={styles.secondaryButtonText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => onTogglePayment(event.id)}>
                  <Text style={styles.secondaryButtonText}>{event.paymentStatus === "paid" ? "미지급으로" : "지급완료"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>등록된 일정이 없습니다.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { backgroundColor: "#e8eefc", borderRadius: 999, color: "#285783", fontSize: 12, fontWeight: "800", paddingHorizontal: 9, paddingVertical: 6 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -3 },
  content: { flex: 1 },
  contentInner: { padding: 18, paddingBottom: 24 },
  dayCell: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderColor: "#e3e7ec",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "space-between",
    paddingVertical: 7,
    width: "100%",
  },
  daySlot: { padding: 3, width: "14.285714%" },
  dayText: { color: "#171a1f", fontSize: 16 },
  emptyDot: { backgroundColor: "transparent" },
  emptyText: { color: "#6f7782", fontSize: 14, marginTop: 14 },
  eventCard: { borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, gap: 12, marginTop: 12, padding: 15 },
  eventClient: { color: "#171a1f", fontSize: 16, fontWeight: "900" },
  eventDot: { backgroundColor: "#d15b4f", borderRadius: 3, height: 6, width: 6 },
  eventLocation: { color: "#6f7782", fontSize: 13, marginTop: 2 },
  eventTopRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  monthRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  monthTitle: { color: "#171a1f", fontSize: 22, fontWeight: "900" },
  outsideDayCell: { backgroundColor: "#f3f5f7" },
  outsideDayText: { color: "#a4abb4" },
  paidBadge: { backgroundColor: "#e5f5ee", color: "#236043" },
  panel: { backgroundColor: "#fff", borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, marginTop: 16, padding: 16 },
  panelTitle: { color: "#171a1f", fontSize: 16, fontWeight: "900" },
  panelTitleRow: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  primaryButton: { backgroundColor: "#315fbd", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11 },
  primaryButtonText: { color: "#fff", fontWeight: "900" },
  secondaryButton: { backgroundColor: "#fff", borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  secondaryButtonText: { color: "#171a1f", fontWeight: "900" },
  selectedDayCell: { backgroundColor: "#315fbd", borderColor: "#315fbd" },
  selectedDayText: { color: "#fff", fontWeight: "900" },
  selectedEventDot: { backgroundColor: "#f4b4ad" },
  squareButton: { alignItems: "center", backgroundColor: "#fff", borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  arrowText: { color: "#171a1f", fontSize: 30, lineHeight: 32 },
  subtle: { color: "#6f7782", fontSize: 13, marginTop: 2 },
  summaryCard: { backgroundColor: "#fff", borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, flex: 1, padding: 16 },
  summaryLabel: { color: "#6f7782", fontSize: 13 },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryValue: { color: "#171a1f", fontSize: 22, fontWeight: "900", marginTop: 7 },
  timeBadge: { backgroundColor: "#e8eefc", borderRadius: 8, color: "#315fbd", fontWeight: "900", paddingHorizontal: 8, paddingVertical: 6 },
  todayDayCell: { borderColor: "#315fbd", borderWidth: 2 },
  todayDayText: { color: "#315fbd", fontWeight: "900" },
  todayDot: { backgroundColor: "#315fbd" },
  unpaidBadge: { backgroundColor: "#fde9e6", color: "#914336" },
  weekdayGrid: { flexDirection: "row", marginBottom: 7, marginTop: 14 },
  weekdayText: { color: "#6f7782", flex: 1, fontSize: 12, fontWeight: "800", textAlign: "center" },
});
