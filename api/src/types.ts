// оставлено только для общих типов фронту через API (не используется в бэке)
export type Status = "PENDING" | "DONE";
export interface TodoDTO {
  title: string;
  description?: string | null;
  status?: Status;
  dueDate?: string | null; // ISO
}