import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function TodoForm({
  onSubmit,
  pending,
}: {
  onSubmit: (v: { title: string; description?: string }) => void;
  pending?: boolean;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({ title: title.trim(), description: description || undefined });
        setTitle("");
        setDescription("");
      }}
      className="card form"
      style={{ marginBottom: "var(--space-2)" }}
    >
      <input className="input" placeholder={t("newTask")} value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="input" placeholder={t("description")} value={description} onChange={(e) => setDescription(e.target.value)} />
      <button className="button primary" type="submit" disabled={pending}>{t("add")}</button>
    </form>
  );
}