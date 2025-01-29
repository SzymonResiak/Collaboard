import { Model, Types } from 'mongoose';
import { Group } from './schemes/group';

export class GroupClass {
  readonly id: string;

  private name: string;
  private description: string;

  private members: string[];
  private admins: string[];
  private boards: string[];

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
    if (doc.name) this.name = doc.name;
    if (doc.description) this.description = doc.description;
    if (doc.members) this.members = [...doc.members];
    this.admins = Array.isArray(doc.admins) ? doc.admins : [];
    this.boards = Array.isArray(doc.boards) ? doc.boards : [];
    if (doc.createdBy) this.createdBy = doc.createdBy;
  }

  isValid() {
    if (!this.name || !this.createdBy) return false;
    if (!Array.isArray(this.members)) return false;
    if (!Array.isArray(this.admins)) return false;
    if (!Array.isArray(this.boards)) return false;

    return true;
  }

  update(updates: any): void {
    if (updates.name) this.name = updates.name;
    if (updates.description) this.description = updates.description;
    if (Array.isArray(updates.members)) {
      this.members = [...new Set(updates.members as string)];
    }
    if (Array.isArray(updates.admins)) {
      this.admins = [...new Set(updates.admins as string)];
    }
    if (Array.isArray(updates.boards)) {
      this.boards = [...new Set(updates.boards as string)];
    }
  }

  toMongoModel(): Partial<Group> {
    const schema: any = {};

    if (this.id) schema._id = new Types.ObjectId(this.id);
    if (this.name) schema.name = this.name;
    if (this.description) schema.description = this.description;
    const members = Array.from(new Set([...this.members]));
    schema.members = members.map((item: any) => new Types.ObjectId(item));

    const admins = Array.from(new Set([...this.admins]));
    schema.admins = admins.map((item: any) => new Types.ObjectId(item));

    const boards = Array.from(new Set([...this.boards]));
    schema.boards = boards.map((item: any) => new Types.ObjectId(item));

    if (this.createdBy) schema.createdBy = new Types.ObjectId(this.createdBy);

    return schema;
  }

  getMembers(): string[] {
    return [...this.members];
  }

  getAdmins(): string[] {
    return [...this.admins];
  }

  getBoards(): string[] {
    return [...this.boards];
  }

  getCreatedBy(): string {
    return this.createdBy;
  }
}
