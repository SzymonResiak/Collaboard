export interface ChecklistItem {
  item: string;
  isCompleted: boolean;
}

export interface Checklist {
  name: string;
  items: ChecklistItem[];
}
