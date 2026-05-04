import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WorkEvent = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  client: string;
  location: string;
  paymentStatus: "paid" | "unpaid";
  memo?: string;
};

const events: WorkEvent[] = [
  {
    id: "event-1",
    date: "2026-04-25",
    startTime: "09:00",
    endTime: "12:00",
    client: "GS SHOP",
    location: "상암 스튜디오",
    paymentStatus: "paid",
    memo: "소스 촬영",
  },
  {
    id: "event-2",
    date: "2026-04-29",
    startTime: "10:00",
    endTime: "16:00",
    client: "GS SHOP",
    location: "강남 키친스튜디오",
    paymentStatus: "unpaid",
    memo: "밀키트 구성",
  },
];

const calendarDays = [29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2];
const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export default function App() {
  const selectedEvent = events.find((event) => event.date === "2026-04-29");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appFrame}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>근무 캘린더</Text>
              <Text style={styles.subtle}>2026년 4월 29일 수요일</Text>
            </View>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>퇴근 공유</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>오늘 일정</Text>
              <Text style={styles.summaryValue}>1건</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>다음 근무</Text>
              <Text style={styles.summaryValue}>없음</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <View style={styles.monthRow}>
            <TouchableOpacity style={styles.squareButton}>
              <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>2026년 4월</Text>
            <TouchableOpacity style={styles.squareButton}>
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
            {calendarDays.map((day, index) => {
              const isSelected = index === 31;
              const hasEvent = [14, 20, 27, 31, 32].includes(index);
              return (
                <TouchableOpacity key={`${day}-${index}`} style={[styles.dayCell, isSelected && styles.selectedDayCell]}>
                  <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                  {hasEvent ? <View style={[styles.eventDot, isSelected && styles.selectedEventDot]} /> : <View style={styles.emptyDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.panel}>
            <View style={styles.panelTitleRow}>
              <Text style={styles.panelTitle}>4월 29일 일정</Text>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>추가</Text>
              </TouchableOpacity>
            </View>

            {selectedEvent ? (
              <View style={styles.eventCard}>
                <View style={styles.eventTopRow}>
                  <View>
                    <Text style={styles.eventClient}>{selectedEvent.client}</Text>
                    <Text style={styles.eventLocation}>{selectedEvent.location}</Text>
                  </View>
                  <Text style={styles.timeBadge}>
                    {selectedEvent.startTime}-{selectedEvent.endTime}
                  </Text>
                </View>
                <View style={styles.badgeRow}>
                  <Text style={[styles.badge, selectedEvent.paymentStatus === "paid" ? styles.paidBadge : styles.unpaidBadge]}>
                    {selectedEvent.paymentStatus === "paid" ? "지급완료" : "미지급"}
                  </Text>
                  {selectedEvent.memo ? <Text style={styles.badge}>{selectedEvent.memo}</Text> : null}
                </View>
              </View>
            ) : (
              <Text style={styles.subtle}>등록된 일정이 없습니다.</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          {["캘린더", "추가", "정산", "설정"].map((label, index) => (
            <TouchableOpacity key={label} style={[styles.navItem, index === 0 && styles.activeNavItem]}>
              <Text style={[styles.navText, index === 0 && styles.activeNavText]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef1f4",
  },
  appFrame: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    backgroundColor: "#fff",
    borderBottomColor: "#e3e7ec",
    borderBottomWidth: 1,
    paddingHorizontal: 22,
    paddingBottom: 16,
    paddingTop: 14,
    gap: 16,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "#171a1f",
    fontSize: 26,
    fontWeight: "900",
  },
  subtle: {
    color: "#6f7782",
    fontSize: 13,
    marginTop: 2,
  },
  headerButton: {
    backgroundColor: "#e8eefc",
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  headerButtonText: {
    color: "#315fbd",
    fontSize: 13,
    fontWeight: "900",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    backgroundColor: "#f7f8fa",
    borderColor: "#e3e7ec",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  summaryLabel: {
    color: "#6f7782",
    fontSize: 13,
  },
  summaryValue: {
    color: "#171a1f",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 7,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 18,
    paddingBottom: 24,
  },
  monthRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  squareButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e3e7ec",
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  arrowText: {
    color: "#171a1f",
    fontSize: 30,
    lineHeight: 32,
  },
  monthTitle: {
    color: "#171a1f",
    fontSize: 22,
    fontWeight: "900",
  },
  weekdayGrid: {
    flexDirection: "row",
    marginBottom: 7,
    marginTop: 14,
  },
  weekdayText: {
    color: "#6f7782",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dayCell: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderColor: "#e3e7ec",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "space-between",
    paddingVertical: 7,
    width: "13.08%",
  },
  selectedDayCell: {
    backgroundColor: "#315fbd",
    borderColor: "#315fbd",
  },
  dayText: {
    color: "#171a1f",
    fontSize: 16,
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "900",
  },
  eventDot: {
    backgroundColor: "#d15b4f",
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  selectedEventDot: {
    backgroundColor: "#f4b4ad",
  },
  emptyDot: {
    height: 6,
    width: 6,
  },
  panel: {
    backgroundColor: "#fff",
    borderColor: "#e3e7ec",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  panelTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  panelTitle: {
    color: "#171a1f",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderColor: "#e3e7ec",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: "#171a1f",
    fontWeight: "900",
  },
  eventCard: {
    borderColor: "#e3e7ec",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
    padding: 15,
  },
  eventTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventClient: {
    color: "#171a1f",
    fontSize: 16,
    fontWeight: "900",
  },
  eventLocation: {
    color: "#6f7782",
    fontSize: 13,
    marginTop: 2,
  },
  timeBadge: {
    backgroundColor: "#e8eefc",
    borderRadius: 8,
    color: "#315fbd",
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    backgroundColor: "#e8eefc",
    borderRadius: 999,
    color: "#285783",
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  paidBadge: {
    backgroundColor: "#e5f5ee",
    color: "#236043",
  },
  unpaidBadge: {
    backgroundColor: "#fde9e6",
    color: "#914336",
  },
  bottomNav: {
    backgroundColor: "#fff",
    borderTopColor: "#e3e7ec",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingBottom: 10,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  navItem: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    minHeight: 54,
    justifyContent: "center",
  },
  activeNavItem: {
    backgroundColor: "#315fbd",
  },
  navText: {
    color: "#6f7782",
    fontSize: 12,
    fontWeight: "900",
  },
  activeNavText: {
    color: "#fff",
  },
});
