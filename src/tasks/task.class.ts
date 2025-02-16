import { Model, Types } from 'mongoose';
import { Task } from './schemes/task';
import { isDateValid } from 'src/common/utils/isDateValid';
import { Checklist } from '../common/interfaces/checklist.interface';
import { Attachment } from '../common/interfaces/attachment.interface';
import * as crypto from 'crypto';

export class TaskClass {
  readonly id: string;

  private title: string;
  private description: string;
  private status: string;
  private assignees: string[];
  private dueDate: Date;
  private canEdit: boolean;
  private board: string;
  private checklists: Checklist[];
  private attachments: Attachment[];

  private completedAt?: Date;
  private createdBy: string;

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
    if (doc.board) this.board = doc.board;
    if (doc.canEdit) this.canEdit = doc.canEdit;
    if (doc.completedAt) this.completedAt = new Date(doc.completedAt);
    if (doc.checklists) this.checklists = [...doc.checklists];
    if (doc.attachments) this.attachments = [...doc.attachments];
  }

  isValid(): boolean {
    if (!this.title || !this.createdBy || !this.board) return false;
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
    if (updates.checklists) this.checklists = [...updates.checklists];
    if (updates.attachments) this.attachments = [...updates.attachments];

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
    const assignees = Array.from(new Set([...this.assignees]));
    schema.assignees =
      assignees.map((item: any) => new Types.ObjectId(item)) || [];
    if (this.dueDate) schema.dueDate = this.dueDate;
    if (this.board) schema.board = new Types.ObjectId(this.board);
    if (this.completedAt) schema.completedAt = this.completedAt;

    if (this.checklists) {
      schema.checklists = this.checklists.map((checklist) => ({
        ...checklist,
        items: checklist.items.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
        })),
      }));
    }

    if (this.attachments) schema.attachments = this.attachments;

    return schema;
  }

  // Placeholder for getters

  getAssignees(): string[] {
    return [...this.assignees];
  }

  getCreatedBy(): string {
    return this.createdBy;
  }

  getBoard(): string {
    return this.board;
  }

  // Placeholder for methods to manipulate task properties
  // updateStatus(newStatus: TaskStatus): void { this.status = newStatus; }
}
