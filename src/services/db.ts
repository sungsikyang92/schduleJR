import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Client, Location, UserSettings, WorkEvent } from "../types";

const USER_ID = "mom";
const base = `users/${USER_ID}`;

export function subscribeEvents(onUpdate: (events: WorkEvent[]) => void) {
  const q = query(collection(db, `${base}/workEvents`), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WorkEvent));
  });
}

export function subscribeClients(onUpdate: (clients: Client[]) => void) {
  return onSnapshot(collection(db, `${base}/clients`), (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Client));
  });
}

export function subscribeLocations(onUpdate: (locations: Location[]) => void) {
  return onSnapshot(collection(db, `${base}/locations`), (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Location));
  });
}

export function subscribeSettings(onUpdate: (settings: UserSettings) => void) {
  return onSnapshot(doc(db, `${base}/settings/app`), (snap) => {
    if (snap.exists()) onUpdate(snap.data() as UserSettings);
  });
}

export async function saveEvent(draft: Omit<WorkEvent, "id" | "createdAt" | "updatedAt">, eventId?: string) {
  const now = new Date().toISOString();
  if (eventId) {
    await updateDoc(doc(db, `${base}/workEvents/${eventId}`), { ...draft, updatedAt: now });
    return eventId;
  }
  const ref = await addDoc(collection(db, `${base}/workEvents`), { ...draft, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function toggleEventPayment(event: WorkEvent) {
  await updateDoc(doc(db, `${base}/workEvents/${event.id}`), {
    paymentStatus: event.paymentStatus === "paid" ? "unpaid" : "paid",
    updatedAt: new Date().toISOString(),
  });
}

export async function addClient(name: string) {
  const ref = await addDoc(collection(db, `${base}/clients`), { name });
  return ref.id;
}

export async function addLocation(name: string) {
  const ref = await addDoc(collection(db, `${base}/locations`), { name });
  return ref.id;
}

export async function deleteClient(clientId: string) {
  await deleteDoc(doc(db, `${base}/clients/${clientId}`));
}

export async function deleteLocation(locationId: string) {
  await deleteDoc(doc(db, `${base}/locations/${locationId}`));
}

export async function saveSettings(settings: UserSettings) {
  await setDoc(doc(db, `${base}/settings/app`), settings);
}
