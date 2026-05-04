import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Client, Location, PaymentStatus, WorkEvent } from "../types";

type Draft = {
  amount: string;
  clientId: string;
  date: string;
  endTime: string;
  locationId: string;
  memo: string;
  paymentStatus: PaymentStatus;
  startTime: string;
};

type Props = {
  clients: Client[];
  editingEvent?: WorkEvent;
  locations: Location[];
  selectedDate: string;
  onAddClient: (name: string) => string;
  onAddLocation: (name: string) => string;
  onCancel: () => void;
  onSave: (draft: Omit<WorkEvent, "id" | "createdAt" | "updatedAt">, eventId?: string) => void;
};

const defaultDraftValues = {
  amount: "300000",
  endTime: "15:00",
  startTime: "09:00",
};

const timeOptions = Array.from({ length: 25 }, (_, index) => {
  const hour = 7 + Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export function EventFormScreen({ clients, editingEvent, locations, selectedDate, onAddClient, onAddLocation, onCancel, onSave }: Props) {
  const [draft, setDraft] = useState<Draft>(() => buildDraft(editingEvent, selectedDate, locations[0]?.id, clients[0]?.id));
  const [newLocation, setNewLocation] = useState("");
  const [newClient, setNewClient] = useState("");
  const [openTimePicker, setOpenTimePicker] = useState<"startTime" | "endTime" | null>(null);

  useEffect(() => {
    setDraft(buildDraft(editingEvent, selectedDate, locations[0]?.id, clients[0]?.id));
  }, [clients, editingEvent, locations, selectedDate]);

  const update = (key: keyof Draft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const missingFields = [
    !draft.date ? "날짜" : "",
    !draft.locationId ? "장소" : "",
    !draft.clientId ? "업체" : "",
  ].filter(Boolean);

  const addLocation = () => {
    const name = newLocation.trim();
    if (!name) return;
    const id = onAddLocation(name);
    update("locationId", id);
    setNewLocation("");
  };

  const addClient = () => {
    const name = newClient.trim();
    if (!name) return;
    const id = onAddClient(name);
    update("clientId", id);
    setNewClient("");
  };

  const save = () => {
    const startTime = draft.startTime.trim() || defaultDraftValues.startTime;
    const endTime = draft.endTime.trim() || defaultDraftValues.endTime;
    const amount = Number(draft.amount || defaultDraftValues.amount);

    if (missingFields.length) {
      Alert.alert("저장할 수 없음", `${missingFields.join(", ")}을 입력해주세요.`);
      return;
    }
    if (amount <= 0) {
      Alert.alert("저장할 수 없음", "금액은 0보다 커야 합니다.");
      return;
    }
    onSave(
      {
        amount,
        clientId: draft.clientId,
        date: draft.date,
        endTime,
        locationId: draft.locationId,
        memo: draft.memo.trim(),
        paymentStatus: draft.paymentStatus,
        startTime,
      },
      editingEvent?.id,
    );
  };

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">
      <View style={styles.panel}>
        <Text style={styles.title}>{editingEvent ? "일정 수정" : "일정 추가"}</Text>
        <Text style={styles.subtle}>{editingEvent ? "날짜, 시간, 지급상태를 다시 바꿀 수 있습니다." : "새 일정은 미지급으로 저장됩니다."}</Text>

        <Label text="날짜" />
        <TextInput style={styles.input} value={draft.date} onChangeText={(value) => update("date", value)} placeholder="2026-04-30" />

        <View style={styles.row}>
          <View style={styles.flex}>
            <Label text="시작" />
            <TimeSelect
              isOpen={openTimePicker === "startTime"}
              value={draft.startTime}
              fallbackValue={defaultDraftValues.startTime}
              onChange={(value) => update("startTime", value)}
              onToggle={() => setOpenTimePicker((current) => (current === "startTime" ? null : "startTime"))}
              onClose={() => setOpenTimePicker(null)}
            />
          </View>
          <View style={styles.flex}>
            <Label text="종료" />
            <TimeSelect
              isOpen={openTimePicker === "endTime"}
              value={draft.endTime}
              fallbackValue={defaultDraftValues.endTime}
              onChange={(value) => update("endTime", value)}
              onToggle={() => setOpenTimePicker((current) => (current === "endTime" ? null : "endTime"))}
              onClose={() => setOpenTimePicker(null)}
            />
          </View>
        </View>

        <Label text="장소" />
        <View style={styles.optionGrid}>
          {locations.map((location) => (
            <TouchableOpacity key={location.id} style={[styles.optionButton, draft.locationId === location.id && styles.selectedOption]} onPress={() => update("locationId", location.id)}>
              <Text style={[styles.optionText, draft.locationId === location.id && styles.selectedOptionText]}>{location.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.inlineAdd}>
          <TextInput style={[styles.input, styles.flex]} value={newLocation} onChangeText={setNewLocation} placeholder="새 장소" />
          <TouchableOpacity style={styles.secondaryButton} onPress={addLocation}>
            <Text style={styles.secondaryButtonText}>추가</Text>
          </TouchableOpacity>
        </View>

        <Label text="업체" />
        <View style={styles.optionGrid}>
          {clients.map((client) => (
            <TouchableOpacity key={client.id} style={[styles.optionButton, draft.clientId === client.id && styles.selectedOption]} onPress={() => update("clientId", client.id)}>
              <Text style={[styles.optionText, draft.clientId === client.id && styles.selectedOptionText]}>{client.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.inlineAdd}>
          <TextInput style={[styles.input, styles.flex]} value={newClient} onChangeText={setNewClient} placeholder="새 업체" />
          <TouchableOpacity style={styles.secondaryButton} onPress={addClient}>
            <Text style={styles.secondaryButtonText}>추가</Text>
          </TouchableOpacity>
        </View>

        <Label text="금액" />
        <TextInput style={styles.input} value={draft.amount} onChangeText={(value) => update("amount", value.replace(/[^0-9]/g, ""))} keyboardType="number-pad" placeholder={defaultDraftValues.amount} />

        <Label text="지급상태" />
        <View style={styles.row}>
          {(["unpaid", "paid"] as PaymentStatus[]).map((status) => (
            <TouchableOpacity key={status} style={[styles.statusButton, draft.paymentStatus === status && styles.selectedOption]} onPress={() => setDraft((current) => ({ ...current, paymentStatus: status }))}>
              <Text style={[styles.optionText, draft.paymentStatus === status && styles.selectedOptionText]}>{status === "paid" ? "지급완료" : "미지급"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Label text="메모" />
        <TextInput style={[styles.input, styles.memo]} value={draft.memo} onChangeText={(value) => update("memo", value)} multiline placeholder="촬영 내용" />

        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={save}>
            <Text style={styles.primaryButtonText}>{editingEvent ? "수정 저장" : "저장"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function buildDraft(editingEvent: WorkEvent | undefined, selectedDate: string, firstLocationId = "", firstClientId = ""): Draft {
  return {
    amount: editingEvent ? String(editingEvent.amount) : "",
    clientId: editingEvent?.clientId ?? firstClientId,
    date: editingEvent?.date ?? selectedDate,
    endTime: editingEvent?.endTime ?? "",
    locationId: editingEvent?.locationId ?? firstLocationId,
    memo: editingEvent?.memo ?? "",
    paymentStatus: editingEvent?.paymentStatus ?? "unpaid",
    startTime: editingEvent?.startTime ?? "",
  };
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function TimeSelect({
  fallbackValue,
  isOpen,
  onChange,
  onClose,
  onToggle,
  value,
}: {
  fallbackValue: string;
  isOpen: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onToggle: () => void;
  value: string;
}) {
  const selected = value || fallbackValue;
  return (
    <View>
      <TouchableOpacity style={styles.selectButton} onPress={onToggle}>
        <Text style={styles.selectButtonText}>{selected}</Text>
        <Text style={styles.selectChevron}>{isOpen ? "⌃" : "⌄"}</Text>
      </TouchableOpacity>
      {isOpen ? (
        <View style={styles.dropdown}>
          {timeOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.dropdownOption, selected === option && styles.selectedDropdownOption]}
              onPress={() => {
                onChange(option);
                onClose();
              }}
            >
              <Text style={[styles.dropdownOptionText, selected === option && styles.selectedOptionText]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  contentInner: { padding: 18, paddingBottom: 24 },
  dropdown: { backgroundColor: "#fff", borderColor: "#dbe1e7", borderRadius: 8, borderWidth: 1, gap: 4, marginTop: 6, maxHeight: 220, overflow: "scroll", padding: 6 },
  dropdownOption: { borderRadius: 7, paddingHorizontal: 10, paddingVertical: 9 },
  dropdownOptionText: { color: "#303741", fontSize: 14, fontWeight: "800" },
  flex: { flex: 1 },
  footerRow: { flexDirection: "row", gap: 10, justifyContent: "flex-end", marginTop: 18 },
  inlineAdd: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 8 },
  input: { backgroundColor: "#fff", borderColor: "#dbe1e7", borderRadius: 8, borderWidth: 1, color: "#171a1f", fontSize: 15, minHeight: 46, paddingHorizontal: 12, paddingVertical: 10 },
  label: { color: "#303741", fontSize: 13, fontWeight: "900", marginBottom: 7, marginTop: 16 },
  memo: { minHeight: 84, textAlignVertical: "top" },
  optionButton: { backgroundColor: "#fff", borderColor: "#dbe1e7", borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionText: { color: "#303741", fontWeight: "800" },
  panel: { backgroundColor: "#fff", borderColor: "#e3e7ec", borderRadius: 8, borderWidth: 1, padding: 16 },
  primaryButton: { backgroundColor: "#315fbd", borderRadius: 8, paddingHorizontal: 18, paddingVertical: 13 },
  primaryButtonText: { color: "#fff", fontWeight: "900" },
  row: { flexDirection: "row", gap: 10 },
  secondaryButton: { backgroundColor: "#fff", borderColor: "#dbe1e7", borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  secondaryButtonText: { color: "#171a1f", fontWeight: "900" },
  selectButton: { alignItems: "center", backgroundColor: "#fff", borderColor: "#dbe1e7", borderRadius: 8, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 46, paddingHorizontal: 12 },
  selectButtonText: { color: "#171a1f", fontSize: 15, fontWeight: "900" },
  selectChevron: { color: "#6f7782", fontSize: 18, fontWeight: "900" },
  selectedDropdownOption: { backgroundColor: "#315fbd" },
  selectedOption: { backgroundColor: "#315fbd", borderColor: "#315fbd" },
  selectedOptionText: { color: "#fff" },
  statusButton: { alignItems: "center", backgroundColor: "#fff", borderColor: "#dbe1e7", borderRadius: 8, borderWidth: 1, flex: 1, paddingVertical: 12 },
  subtle: { color: "#6f7782", fontSize: 13, marginTop: 4 },
  title: { color: "#171a1f", fontSize: 22, fontWeight: "900" },
});
