import { useEffect, useRef, useState } from "react";
import SettingsPanel from "./SettingsPanel";
import { useTranslation } from "react-i18next";

/** Кнопка ⚙️, по клику открывает выпадающее меню с панелью настроек */
export default function SettingsMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // закрытие по клику вне и по ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        className="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("settings")}
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        <span aria-hidden>⚙️</span> {t("settings")}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            zIndex: 50,
            width: 520,
            maxWidth: "min(92vw, 520px)",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow:
              "0 10px 20px rgba(0,0,0,.15), 0 4px 6px rgba(0,0,0,.10)",
            padding: 16,
          }}
        >
          <SettingsPanel onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}