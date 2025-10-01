import { useSettings } from "../contexts/SettingsContext";

export default function LanguageSelector() {
  const { settings, setSettings } = useSettings();
  return (
    <select
      className="select"
      value={settings.lang}
      onChange={(e) => setSettings({ lang: e.target.value as "ru" | "en" })}
      style={{ marginLeft: 8 }}
    >
      <option value="ru">Русский</option>
      <option value="en">English</option>
    </select>
  );
}