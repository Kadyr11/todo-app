import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import i18n from "../i18n";

type SortBy = "createdAt" | "title" | "priority";
type Theme = "light" | "dark" | "system";

export interface Settings {
  lang: "ru" | "en";
  theme: Theme;
  confirmDelete: boolean;
  defaultSort: SortBy;
}

const defaultSettings: Settings = {
  lang: (localStorage.getItem("lang") as "ru" | "en") || "ru",
  theme: (localStorage.getItem("theme") as Theme) || "light",
  confirmDelete: localStorage.getItem("confirmDelete") === "false" ? false : true,
  defaultSort: (localStorage.getItem("defaultSort") as SortBy) || "createdAt",
};

const SettingsCtx = createContext<{
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
}>({ settings: defaultSettings, setSettings: () => {} });

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);

  const setSettings = (patch: Partial<Settings>) =>
    setSettingsState((prev) => ({ ...prev, ...patch }));

  // сохраняем настройки + побочные эффекты
  useEffect(() => {
    localStorage.setItem("lang", settings.lang);
    i18n.changeLanguage(settings.lang);
  }, [settings.lang]);

  useEffect(() => {
    localStorage.setItem("theme", settings.theme);
    
    const apply = (mode: "light" | "dark") =>
      document.documentElement.setAttribute("data-theme", mode);

    const resolve = () =>
      settings.theme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : settings.theme;

    apply(resolve());

    let off: (() => void) | undefined;
    if (settings.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
      mq.addEventListener?.("change", onChange) ?? mq.addListener(onChange);
      off = () => mq.removeEventListener?.("change", onChange) ?? mq.removeListener(onChange);
    }
    return off;
  }, [settings.theme]);

  useEffect(() => {
    localStorage.setItem("confirmDelete", String(settings.confirmDelete));
  }, [settings.confirmDelete]);

  useEffect(() => {
    localStorage.setItem("defaultSort", settings.defaultSort);
  }, [settings.defaultSort]);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
};

export const useSettings = () => useContext(SettingsCtx);