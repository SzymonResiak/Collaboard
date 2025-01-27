import { Model, Types } from 'mongoose';
import { TaskStatus } from './enums/task-status.enum';
import { Task } from './schemes/task';
import { isDateValid } from 'src/common/utils/isDateValid';
export class TaskClass {
  readonly id: string;

  private title: string;
  private description: string;
  private status: TaskStatus;
  private createdBy: string;

  private assignees: string[];
  private dueDate?: Date;
  private completedAt?: Date;

  constructor(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    if (obj instanceof Model) {
      const doc = obj.toObject({ minimalize: false, flattenObjectIds: true });
      if (doc._id) this.id = doc._id;
      this.objectConstructor(doc);
    } else {
      if (obj.id) this.id = obj.id;
      this.objectConstructor(obj);
    }
  }

  private objectConstructor(doc: any) {
    if (doc.title) this.title = doc.title;
    if (doc.description) this.description = doc.description;
    if (doc.status) this.status = doc.status;
    if (doc.createdBy) this.createdBy = doc.createdBy;
    if (doc.assignees) this.assignees = [...doc.assignees];
    if (doc.dueDate) this.dueDate = new Date(doc.dueDate);
    if (doc.completedAt) this.completedAt = new Date(doc.completedAt);
  }

  isValid(): boolean {
    if (!this.title || !this.createdBy) return false;
    if (!Array.isArray(this.assignees)) return false;
    if (!Object.values(TaskStatus).includes(this.status)) return false;
    if (this.dueDate && !isDateValid(this.dueDate)) return false;

    return true;
  }

  update(updates: any): void {
    if (updates.title) this.title = updates.title;
    if (updates.description) this.description = updates.description;
    if (updates.status) this.status = updates.status;
    if (Array.isArray(updates.assignees)) {
      this.assignees = [...new Set(updates.assignees as string)];
    }

    if (updates.dueDate) this.dueDate = updates.dueDate;
    if (updates.completedAt) this.completedAt = updates.completedAt;
  }

  toMongoModel(): Partial<Task> {
    const schema: any = {};

    if (this.id) schema._id = new Types.ObjectId(this.id);
    if (this.title) schema.title = this.title;
    if (this.description) schema.description = this.description;
    if (this.status) schema.status = this.status;
    if (this.createdBy) schema.createdBy = new Types.ObjectId(this.createdBy);
    if (this.assignees)
      schema.assignees = [...this.assignees].map(
        (item) => new Types.ObjectId(item),
      );
    if (this.dueDate) schema.dueDate = this.dueDate;
    if (this.completedAt) schema.completedAt = this.completedAt;

    return schema;
  }

  // Placeholder for getters
  // getTitle(): string { return this.title; }
  // getStatus(): TaskStatus { return this.status; }

  getAssignees(): string[] {
    return [...this.assignees];
  }

  getCreatedBy(): string {
    return this.createdBy;
  }

  // Placeholder for methods to manipulate task properties
  // updateStatus(newStatus: TaskStatus): void { this.status = newStatus; }
}
