export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Checklist {
  name: string;
  items: ChecklistItem[];
}
