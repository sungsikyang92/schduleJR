const formatter = new Intl.NumberFormat("ko-KR");
const weekday = ["일", "월", "화", "수", "목", "금", "토"];

const state = {
  visibleDate: new Date(2026, 3, 1),
  selectedDate: "2026-04-29",
  activeView: "calendar",
  paymentStatus: "unpaid",
  editingEventId: null,
  showMoney: false,
  settings: {
    googleConnected: false,
    syncToGoogleCalendar: false,
    hideMoneyByDefault: true,
    selectedGoogleCalendarId: "mom-work"
  },
  modalType: "location",
  locations: [
    { id: "loc-1", name: "상암 스튜디오" },
    { id: "loc-2", name: "목동 방송센터" },
    { id: "loc-3", name: "강남 키친스튜디오" }
  ],
  clients: [
    { id: "client-1", name: "CJ온스타일" },
    { id: "client-2", name: "현대홈쇼핑" },
    { id: "client-3", name: "GS SHOP" }
  ],
  events: [
    {
      id: "event-1",
      date: "2026-04-12",
      startTime: "08:30",
      endTime: "13:30",
      locationId: "loc-1",
      clientId: "client-1",
      amount: 280000,
      paymentStatus: "paid",
      memo: "갈비찜 촬영"
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
      memo: "반찬 세트"
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
      memo: "밀키트 구성"
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
      memo: "소스 촬영"
    }
  ]
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function money(value) {
  return `${formatter.format(value)}원`;
}

function privateMoney(value) {
  return state.showMoney ? money(value) : "••••••";
}

function dateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayKey() {
  return dateKey(new Date());
}

function currentTimeKey() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function getName(list, id) {
  return list.find((item) => item.id === id)?.name ?? "";
}

async function shareText(text, fallbackMessage) {
  if (navigator.share) {
    await navigator.share({ text });
  } else {
    await navigator.clipboard.writeText(text);
    alert(fallbackMessage);
  }
}

function shortDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function minutesBetween(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function formatHours(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}시간 ${minutes}분` : `${hours}시간`;
}

function renderOptions() {
  $("#locationSelect").innerHTML = state.locations
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");
  $("#clientSelect").innerHTML = state.clients
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");
}

function renderCalendar() {
  const year = state.visibleDate.getFullYear();
  const month = state.visibleDate.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const today = todayKey();

  $("#monthTitle").textContent = `${year}년 ${month + 1}월`;
  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const key = dateKey(current);
    const hasEvent = state.events.some((event) => event.date === key);
    const classes = [
      "day",
      current.getMonth() === month ? "current" : "",
      key === state.selectedDate ? "selected" : "",
      key === today ? "today" : "",
      hasEvent ? "has-event" : ""
    ].join(" ");
    days.push(`
      <button class="${classes}" data-date="${key}">
        <span>${current.getDate()}</span>
        <span class="dot"></span>
      </button>
    `);
  }
  $("#calendar").innerHTML = days.join("");
}

function renderDay() {
  const selected = new Date(`${state.selectedDate}T00:00:00`);
  $("#selectedLabel").textContent = `${selected.getFullYear()}년 ${selected.getMonth() + 1}월 ${selected.getDate()}일 ${weekday[selected.getDay()]}요일`;
  $("#dayTitle").textContent = `${selected.getMonth() + 1}월 ${selected.getDate()}일 일정`;
  $("#dateInput").value = state.selectedDate;

  const events = state.events
    .filter((event) => event.date === state.selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  $("#dayList").innerHTML = events.length
    ? events.map(renderWorkItem).join("")
    : `<p class="muted">등록된 일정이 없습니다.</p>`;
}

function renderWorkItem(event) {
  const location = getName(state.locations, event.locationId);
  const client = getName(state.clients, event.clientId);
  const statusText = event.paymentStatus === "paid" ? "지급완료" : "미지급";
  const payAction = event.paymentStatus === "paid" ? "미지급으로 변경" : "지급완료";
  return `
    <article class="work-item">
      <div class="item-main">
        <div>
          <h3>${client}</h3>
          <p class="muted">${location}</p>
        </div>
        <strong class="item-time">${event.startTime}-${event.endTime}</strong>
      </div>
      <div class="item-meta">
        <span class="tag ${event.paymentStatus}">${statusText}</span>
        ${event.memo ? `<span class="tag">${event.memo}</span>` : ""}
      </div>
      <div class="item-actions">
        <button class="mini-button" data-edit-event="${event.id}">수정</button>
        <button class="mini-button pay" data-toggle-payment="${event.id}">${payAction}</button>
      </div>
    </article>
  `;
}

function renderStats() {
  const year = state.visibleDate.getFullYear();
  const month = state.visibleDate.getMonth();
  const monthEvents = state.events.filter((event) => {
    const date = new Date(`${event.date}T00:00:00`);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const today = todayKey();
  const nowTime = currentTimeKey();
  const todayEvents = state.events
    .filter((event) => event.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nextEvent = state.events
    .filter((event) => {
      if (event.date > today) return true;
      return event.date === today && event.startTime > nowTime;
    })
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0];
  const monthTotal = monthEvents.reduce((sum, event) => sum + event.amount, 0);
  const paidTotal = monthEvents
    .filter((event) => event.paymentStatus === "paid")
    .reduce((sum, event) => sum + event.amount, 0);
  const unpaidTotal = monthTotal - paidTotal;

  if (state.activeView === "stats") {
    const totalMinutes = monthEvents.reduce((sum, event) => {
      return sum + Math.max(0, minutesBetween(event.startTime, event.endTime));
    }, 0);
    $("#primarySummaryLabel").textContent = "이번 달 근무";
    $("#primarySummaryValue").textContent = `${monthEvents.length}건`;
    $("#secondarySummaryLabel").textContent = "총 근무시간";
    $("#secondarySummaryValue").textContent = formatHours(totalMinutes);
  } else if (state.activeView === "settings") {
    $("#primarySummaryLabel").textContent = "Google 계정";
    $("#primarySummaryValue").textContent = state.settings.googleConnected ? "연결됨" : "미연결";
    $("#secondarySummaryLabel").textContent = "캘린더 동기화";
    $("#secondarySummaryValue").textContent = state.settings.syncToGoogleCalendar ? "켜짐" : "꺼짐";
  } else {
    $("#primarySummaryLabel").textContent = "오늘 일정";
    $("#primarySummaryValue").textContent = `${todayEvents.length}건`;
    $("#secondarySummaryLabel").textContent = "다음 근무";
    $("#secondarySummaryValue").textContent = nextEvent
      ? `${shortDate(nextEvent.date)} ${nextEvent.startTime}`
      : "없음";
  }
  $("#monthTotal").textContent = privateMoney(monthTotal);
  $("#paidTotal").textContent = privateMoney(paidTotal);
  $("#unpaidTotal").textContent = privateMoney(unpaidTotal);
  $("#toggleMoney").textContent = state.showMoney ? "금액 숨기기" : "금액 보기";

  const byClient = state.clients
    .map((client) => {
      const clientEvents = monthEvents.filter((event) => event.clientId === client.id);
      const paid = clientEvents
        .filter((event) => event.paymentStatus === "paid")
        .reduce((sum, event) => sum + event.amount, 0);
      const unpaid = clientEvents
        .filter((event) => event.paymentStatus === "unpaid")
        .reduce((sum, event) => sum + event.amount, 0);
      return { ...client, paid, unpaid, total: paid + unpaid };
    })
    .filter((client) => client.total > 0)
    .sort((a, b) => b.total - a.total);

  $("#statsList").innerHTML = byClient
    .map((client) => {
      const paidWidth = client.total ? (client.paid / client.total) * 100 : 0;
      const unpaidWidth = client.total ? (client.unpaid / client.total) * 100 : 0;
      return `
        <article class="stat-item">
          <div class="stat-heading">
            <h3>${client.name}</h3>
            <strong>${privateMoney(client.total)}</strong>
          </div>
          <div class="bar">
            <span class="paid-segment" style="width:${paidWidth}%"></span>
            <span class="unpaid-segment" style="width:${unpaidWidth}%"></span>
          </div>
          <div class="stat-breakdown">
            <span>지급 ${privateMoney(client.paid)}</span>
            <span>미지급 ${privateMoney(client.unpaid)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSettings() {
  $("#googleAccountLabel").textContent = state.settings.googleConnected
    ? "sungsikyang92@gmail.com"
    : "연결 안 됨";
  $("#connectGoogle").textContent = state.settings.googleConnected ? "해제" : "연결";
  $("#syncCalendarToggle").classList.toggle("active", state.settings.syncToGoogleCalendar);
  $("#hideMoneyToggle").classList.toggle("active", state.settings.hideMoneyByDefault);
  $("#calendarSelect").value = state.settings.selectedGoogleCalendarId;
}

function renderAll() {
  renderOptions();
  renderCalendar();
  renderDay();
  renderStats();
  renderSettings();
}

function setView(view) {
  if (state.activeView === "stats" && view !== "stats" && state.settings.hideMoneyByDefault) {
    state.showMoney = false;
  }
  state.activeView = view;
  if (view === "stats" && state.settings.hideMoneyByDefault) {
    state.showMoney = false;
  }
  $$(".view").forEach((el) => el.classList.remove("active"));
  $(`#${view}View`).classList.add("active");
  $(".content").scrollTop = 0;
  $$(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === view);
  });
  renderStats();
}

function setPaymentStatus(status) {
  state.paymentStatus = status;
  $$(".status-toggle button").forEach((button) => {
    button.classList.toggle("active", button.dataset.status === status);
  });
}

function resetForm() {
  $("#workForm").reset();
  $("#dateInput").value = state.selectedDate;
  state.editingEventId = null;
  $("#formTitle").textContent = "일정 추가";
  $("#formHint").textContent = "새 일정은 미지급으로 저장됩니다.";
  $("#saveButton").textContent = "저장";
  $("#cancelEdit").hidden = true;
  setPaymentStatus("unpaid");
}

function editEvent(eventId) {
  const workEvent = state.events.find((event) => event.id === eventId);
  if (!workEvent) return;
  state.editingEventId = eventId;
  $("#formTitle").textContent = "일정 수정";
  $("#formHint").textContent = "날짜, 시간, 지급상태를 다시 바꿀 수 있습니다.";
  $("#saveButton").textContent = "수정 저장";
  $("#cancelEdit").hidden = false;
  $("#dateInput").value = workEvent.date;
  $("#startInput").value = workEvent.startTime;
  $("#endInput").value = workEvent.endTime;
  $("#locationSelect").value = workEvent.locationId;
  $("#clientSelect").value = workEvent.clientId;
  $("#amountInput").value = workEvent.amount;
  $("#memoInput").value = workEvent.memo;
  setPaymentStatus(workEvent.paymentStatus);
  setView("add");
}

function openModal(type) {
  state.modalType = type;
  $("#modalTitle").textContent = type === "location" ? "장소 추가" : "업체 추가";
  $("#optionName").value = "";
  $("#modalBackdrop").classList.add("active");
  $("#optionName").focus();
}

function closeModal() {
  $("#modalBackdrop").classList.remove("active");
}

$$(".nav-button, [data-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.nav === "add") resetForm();
    setView(button.dataset.nav);
  });
});

$("#calendar").addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button) return;
  state.selectedDate = button.dataset.date;
  const date = new Date(`${state.selectedDate}T00:00:00`);
  state.visibleDate = new Date(date.getFullYear(), date.getMonth(), 1);
  renderAll();
});

$("#prevMonth").addEventListener("click", () => {
  state.visibleDate.setMonth(state.visibleDate.getMonth() - 1);
  renderAll();
});

$("#nextMonth").addEventListener("click", () => {
  state.visibleDate.setMonth(state.visibleDate.getMonth() + 1);
  renderAll();
});

$$("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => openModal(button.dataset.openModal));
});

$("#closeModal").addEventListener("click", closeModal);
$("#modalBackdrop").addEventListener("click", (event) => {
  if (event.target.id === "modalBackdrop") closeModal();
});

$$(".status-toggle button").forEach((button) => {
  button.addEventListener("click", () => {
    setPaymentStatus(button.dataset.status);
  });
});

$("#dayList").addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-event]");
  const paymentButton = event.target.closest("[data-toggle-payment]");
  if (editButton) {
    editEvent(editButton.dataset.editEvent);
    return;
  }
  if (paymentButton) {
    const workEvent = state.events.find((item) => item.id === paymentButton.dataset.togglePayment);
    if (!workEvent) return;
    workEvent.paymentStatus = workEvent.paymentStatus === "paid" ? "unpaid" : "paid";
    renderAll();
  }
});

$("#optionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#optionName").value.trim();
  if (!name) return;
  const collection = state.modalType === "location" ? state.locations : state.clients;
  const id = `${state.modalType}-${Date.now()}`;
  collection.push({ id, name });
  renderOptions();
  $(`#${state.modalType}Select`).value = id;
  closeModal();
});

$("#workForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const values = {
    date: $("#dateInput").value,
    startTime: $("#startInput").value,
    endTime: $("#endInput").value,
    locationId: $("#locationSelect").value,
    clientId: $("#clientSelect").value,
    amount: Number($("#amountInput").value),
    paymentStatus: state.paymentStatus,
    memo: $("#memoInput").value.trim()
  };
  const existing = state.events.find((item) => item.id === state.editingEventId);
  if (existing) {
    Object.assign(existing, values);
  } else {
    state.events.push({ id: `event-${Date.now()}`, ...values });
  }
  state.selectedDate = values.date;
  const date = new Date(`${values.date}T00:00:00`);
  state.visibleDate = new Date(date.getFullYear(), date.getMonth(), 1);
  resetForm();
  renderAll();
  setView("calendar");
});

$("#cancelEdit").addEventListener("click", () => {
  resetForm();
  setView("calendar");
});

$("#sampleFill").addEventListener("click", () => {
  $("#dateInput").value = "2026-04-30";
  $("#startInput").value = "09:00";
  $("#endInput").value = "15:00";
  $("#locationSelect").value = "loc-1";
  $("#clientSelect").value = "client-1";
  $("#amountInput").value = "300000";
  $("#memoInput").value = "신제품 촬영";
  setPaymentStatus("unpaid");
});

$("#toggleMoney").addEventListener("click", () => {
  state.showMoney = !state.showMoney;
  renderStats();
});

$("#connectGoogle").addEventListener("click", () => {
  state.settings.googleConnected = !state.settings.googleConnected;
  if (!state.settings.googleConnected) {
    state.settings.syncToGoogleCalendar = false;
  }
  renderAll();
});

$("#syncCalendarToggle").addEventListener("click", () => {
  if (!state.settings.googleConnected) {
    state.settings.googleConnected = true;
  }
  state.settings.syncToGoogleCalendar = !state.settings.syncToGoogleCalendar;
  renderAll();
});

$("#hideMoneyToggle").addEventListener("click", () => {
  state.settings.hideMoneyByDefault = !state.settings.hideMoneyByDefault;
  if (state.settings.hideMoneyByDefault) {
    state.showMoney = false;
  }
  renderAll();
});

$("#calendarSelect").addEventListener("change", (event) => {
  state.settings.selectedGoogleCalendarId = event.target.value;
  renderSettings();
});

$("#shareTodayEnd").addEventListener("click", async () => {
  const todayEvents = state.events
    .filter((event) => event.date === todayKey())
    .sort((a, b) => b.endTime.localeCompare(a.endTime));
  if (!todayEvents.length) {
    alert("오늘 등록된 일정이 없습니다.");
    return;
  }
  const lastEvent = todayEvents[0];
  const location = getName(state.locations, lastEvent.locationId);
  const text = `오늘 ${lastEvent.endTime}에 끝날 예정입니다. (${location})`;
  await shareText(text, "오늘 퇴근 시간이 복사되었습니다.");
});

$("#shareSchedule").addEventListener("click", async () => {
  const events = state.events
    .filter((event) => {
      const date = new Date(`${event.date}T00:00:00`);
      return date.getMonth() === state.visibleDate.getMonth();
    })
    .map((event) => {
      const location = getName(state.locations, event.locationId);
      const client = getName(state.clients, event.clientId);
      return `${event.date} ${event.startTime}-${event.endTime} ${location} / ${client}`;
    })
    .join("\n");
  await shareText(events, "금액을 제외한 일정이 복사되었습니다.");
});

renderAll();
resetForm();
