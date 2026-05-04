import { DimensionValue, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Client, WorkEvent } from "../types";
import { formatHours, minutesBetween, monthTitle } from "../utils/date";
import { privateMoney } from "../utils/money";

type Props = {
  clients: Client[];
  events: WorkEvent[];
  showMoney: boolean;
  visibleDate: Date;
  onToggleMoney: () => void;
};

export function SettlementScreen({ clients, events, showMoney, visibleDate, onToggleMoney }: Props) {
  const monthEvents = events.filter((event) => {
    const date = new Date(`${event.date}T00:00:00`);
    return date.getFullYear() === visibleDate.getFullYear() && date.getMonth() === visibleDate.getMonth();
  });
  const monthTotal = monthEvents.reduce((sum, event) => sum + event.amount, 0);
  const paidTotal = monthEvents.filter((event) => event.paymentStatus === "paid").reduce((sum, event) => sum + event.amount, 0);
  const unpaidTotal = monthTotal - paidTotal;
  const totalMinutes = monthEvents.reduce((sum, event) => sum + Math.max(0, minutesBetween(event.startTime, event.endTime)), 0);

  const byClient = clients
    .map((client) => {
      const clientEvents = monthEvents.filter((event) => event.clientId === client.id);
      const paid = clientEvents.filter((event) => event.paymentStatus === "paid").reduce((sum, event) => sum + event.amount, 0);
      const unpaid = clientEvents.filter((event) => event.paymentStatus === "unpaid").reduce((sum, event) => sum + event.amount, 0);
      return { ...client, paid, unpaid, total: paid + unpaid };
    })
    .filter((client) => client.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.panel}>
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.title}>{monthTitle(visibleDate)} 정산</Text>
            <Text style={styles.subtle}>금액은 명시적으로 보기 전까지 숨겨집니다.</Text>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={onToggleMoney}>
            <Text style={styles.secondaryButtonText}>{showMoney ? "금액 숨기기" : "금액 보기"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          <Summary label="이번 달" value={`${monthEvents.length}건`} />
          <Summary label="근무시간" value={formatHours(totalMinutes)} />
          <Summary label="총액" value={privateMoney(monthTotal, showMoney)} />
          <Summary label="미지급" value={privateMoney(unpaidTotal, showMoney)} />
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownText}>지급 {privateMoney(paidTotal, showMoney)}</Text>
          <Text style={styles.breakdownText}>미지급 {privateMoney(unpaidTotal, showMoney)}</Text>
        </View>

      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>업체별 정산</Text>
        {byClient.length ? (
          byClient.map((client) => {
            const paidWidth: DimensionValue = client.total ? `${(client.paid / client.total) * 100}%` : "0%";
            const unpaidWidth: DimensionValue = client.total ? `${(client.unpaid / client.total) * 100}%` : "0%";
            return (
              <View key={client.id} style={styles.clientCard}>
                <View style={styles.headingRow}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientTotal}>{privateMoney(client.total, showMoney)}</Text>
                </View>
                <View style={styles.bar}>
                  <View style={[styles.paidSegment, { width: paidWidth }]} />
                  <View style={[styles.unpaidSegment, { width: unpaidWidth }]} />
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownText}>지급 {privateMoney(client.paid, showMoney)}</Text>
                  <Text style={styles.breakdownText}>미지급 {privateMoney(client.unpaid, showMoney)}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>이번 달 정산할 일정이 없습니다.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: "#eef1f4", borderRadius: 999, flexDirection: "row", height: 10, overflow: "hidden" },
  breakdownRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 10 },
  breakdownText: { color: "#6f7782", fontSize: 13, fontWeight: "800" },
  clientCard: { borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, gap: 10, marginTop: 12, padding: 14 },
  clientName: { color: "#171a1f", fontSize: 16, fontWeight: "900" },
  clientTotal: { color: "#171a1f", fontSize: 15, fontWeight: "900" },
  content: { flex: 1 },
  contentInner: { padding: 18, paddingBottom: 24 },
  emptyText: { color: "#6f7782", fontSize: 14, marginTop: 14 },
  headingRow: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  paidSegment: { backgroundColor: "#4fa37a", height: "100%" },
  panel: { backgroundColor: "#fff", borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, marginBottom: 16, padding: 16 },
  secondaryButton: { backgroundColor: "#fff", borderColor: "#dbe1e7", borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  secondaryButtonText: { color: "#171a1f", fontWeight: "900" },
  sectionTitle: { color: "#171a1f", fontSize: 17, fontWeight: "900" },
  subtle: { color: "#6f7782", fontSize: 13, marginTop: 4 },
  summaryCard: { backgroundColor: "#f7f8fa", borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, flexBasis: "48%", flexGrow: 1, padding: 14 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  summaryLabel: { color: "#6f7782", fontSize: 13 },
  summaryValue: { color: "#171a1f", fontSize: 18, fontWeight: "900", marginTop: 6 },
  title: { color: "#171a1f", fontSize: 22, fontWeight: "900" },
  unpaidSegment: { backgroundColor: "#d15b4f", height: "100%" },
});
