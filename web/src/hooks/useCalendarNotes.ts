// useCalendarNotes.ts
import { useEffect, useState } from "react";

type DayData = { notes: string[]; important?: boolean };
type Store = Record<string, DayData>;
const key = (d: Date) => { const n = new Date(d); n.setHours(12,0,0,0); return n.toISOString().slice(0,10); };

export const useCalendarNotes = () => {
  const [store, setStore] = useState<Store>(() => {
    try { return JSON.parse(localStorage.getItem("calNotesV1") || "{}"); } catch { return {}; }
  });
  useEffect(() => localStorage.setItem("calNotesV1", JSON.stringify(store)), [store]);

  return {
    store,
    addNote: (date: Date, text: string) => {
      if (!text.trim()) return;
      const k = key(date), cur = store[k] ?? { notes: [] };
      setStore({ ...store, [k]: { ...cur, notes: [...cur.notes, text.trim()] } });
    },
    removeNote: (date: Date, i: number) => {
      const k = key(date), cur = store[k]; if (!cur) return;
      const next = [...cur.notes]; next.splice(i,1);
      setStore({ ...store, [k]: { ...cur, notes: next } });
    },
    toggleImportant: (date: Date) => {
      const k = key(date), cur = store[k] ?? { notes: [] };
      setStore({ ...store, [k]: { ...cur, important: !cur.important } });
    },
    key
  };
};
