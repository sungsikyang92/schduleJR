import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { UserSettings } from "../types";

type Props = {
  settings: UserSettings;
  onSelectCalendar: (calendarId: string) => void;
  onToggleGoogle: () => void;
  onToggleHideMoney: () => void;
  onToggleSync: () => void;
};

const calendars = [
  { id: "mom-work", name: "엄마 근무 캘린더" },
  { id: "family", name: "가족 캘린더" },
  { id: "personal", name: "개인 캘린더" },
];

export function SettingsScreen({ settings, onSelectCalendar, onToggleGoogle, onToggleHideMoney, onToggleSync }: Props) {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <View style={styles.panel}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.subtle}>Google Calendar에는 일정 정보만 동기화하고 금액은 저장하지 않습니다.</Text>

        <SettingRow label="Google 계정" value={settings.googleConnected ? "sungsikyang92@gmail.com" : "연결 안 됨"} action={settings.googleConnected ? "해제" : "연결"} onPress={onToggleGoogle} />
        <SwitchRow label="캘린더 동기화" value={settings.syncToGoogleCalendar} onValueChange={onToggleSync} />
        <SwitchRow label="정산 금액 기본 숨김" value={settings.hideMoneyByDefault} onValueChange={onToggleHideMoney} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Google Calendar 대상</Text>
        <View style={styles.optionGrid}>
          {calendars.map((calendar) => (
            <TouchableOpacity key={calendar.id} style={[styles.optionButton, settings.selectedGoogleCalendarId === calendar.id && styles.selectedOption]} onPress={() => onSelectCalendar(calendar.id)}>
              <Text style={[styles.optionText, settings.selectedGoogleCalendarId === calendar.id && styles.selectedOptionText]}>{calendar.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function SettingRow({ label, value, action, onPress }: { action: string; label: string; value: string; onPress: () => void }) {
  return (
    <View style={styles.settingRow}>
      <View>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value}</Text>
      </View>
      <TouchableOpacity style={styles.secondaryButton} onPress={onPress}>
        <Text style={styles.secondaryButtonText}>{action}</Text>
      </TouchableOpacity>
    </View>
  );
}

function SwitchRow({ label, onValueChange, value }: { label: string; onValueChange: () => void; value: boolean }) {
  return (
    <View style={styles.settingRow}>
      <View>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value ? "켜짐" : "꺼짐"}</Text>
      </View>
      <Switch ios_backgroundColor="#dbe1e7" onValueChange={onValueChange} thumbColor="#fff" trackColor={{ false: "#dbe1e7", true: "#315fbd" }} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  contentInner: { padding: 18, paddingBottom: 24 },
  optionButton: { backgroundColor: "#fff", borderColor: "#dbe1e7", borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12 },
  optionGrid: { gap: 8, marginTop: 12 },
  optionText: { color: "#303741", fontWeight: "800" },
  panel: { backgroundColor: "#fff", borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, marginBottom: 16, padding: 16 },
  secondaryButton: { backgroundColor: "#fff", borderColor: "#dbe1e7", borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  secondaryButtonText: { color: "#171a1f", fontWeight: "900" },
  sectionTitle: { color: "#171a1f", fontSize: 17, fontWeight: "900" },
  selectedOption: { backgroundColor: "#315fbd", borderColor: "#315fbd" },
  selectedOptionText: { color: "#fff" },
  settingLabel: { color: "#171a1f", fontSize: 15, fontWeight: "900" },
  settingRow: { alignItems: "center", borderBottomColor: "#eef1f4", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: 14 },
  settingValue: { color: "#6f7782", fontSize: 13, marginTop: 4 },
  subtle: { color: "#6f7782", fontSize: 13, marginTop: 4 },
  title: { color: "#171a1f", fontSize: 22, fontWeight: "900" },
});
