import { useTranslation } from "react-i18next";

export type ViewMode = 'list' | 'calendar';

export default function TodoFilters({
  value,
  onChange,
  viewMode,
  onViewModeChange,
}: {
  value: { status?: "PENDING" | "DONE"; search?: string };
  onChange: (v: { status?: "PENDING" | "DONE"; search?: string }) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="card form" style={{ margin: "var(--space-2) 0" }}>
      <div className="view-mode-toggle" style={{ marginBottom: 'var(--space-1)' }}>
        <button
          className={`btn ${viewMode === 'list' ? 'primary' : 'secondary'}`}
          onClick={() => onViewModeChange('list')}
          style={{ marginRight: 'var(--space-1)' }}
        >
          📋 {t('list')}
        </button>
        <button
          className={`btn ${viewMode === 'calendar' ? 'primary' : 'secondary'}`}
          onClick={() => onViewModeChange('calendar')}
        >
          📅 {t('calendar')}
        </button>
      </div>

      <div className="select-wrap">
        <select
          className="select"
          value={value.status ?? ""}
          onChange={(e) => onChange({ ...value, status: e.target.value ? (e.target.value as any) : undefined })}
        >
          <option value="">{t("all")}</option>
          <option value="PENDING">{t("pending")}</option>
          <option value="DONE">{t("done")}</option>
        </select>
      </div>
      <input
        className="input"
        placeholder={t("search")}
        value={value.search ?? ""}
        onChange={(e) => onChange({ ...value, search: e.target.value || undefined })}
        style={{ flex: 1 }}
      />
    </div>
  );
}