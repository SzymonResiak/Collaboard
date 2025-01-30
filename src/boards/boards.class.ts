import { Model, Types } from 'mongoose';
import { Board } from './schemes/board';
import { BoardType } from './enums/board-type.enum';

export class BoardClass {
  readonly id: string;

  private name: string;
  private description: string;
  private type: BoardType;

  private admins: string[];
  private group: string;

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
    if (doc.type) this.type = doc.type;
    if (doc.createdBy) this.createdBy = doc.createdBy;
    this.admins = Array.isArray(doc.admins) ? doc.admins : [];
    if (doc.group) this.group = doc.group;
  }

  isValid() {
    if (!this.name || !this.createdBy) return false;
    if (!Array.isArray(this.admins)) return false;
    if (!Object.values(BoardType).includes(this.type)) return false;

    return true;
  }

  update(updates: any): void {
    if (updates.name) this.name = updates.name;
    if (updates.description) this.description = updates.description;
  }

  toMongoModel(): Partial<Board> {
    const schema: any = {};

    if (this.id) schema._id = new Types.ObjectId(this.id);
    if (this.name) schema.name = this.name;
    if (this.description) schema.description = this.description;
    if (this.type) schema.type = this.type;
    const admins = Array.from(new Set([...this.admins]));
    schema.admins = admins.map((admin) => new Types.ObjectId(admin));
    if (this.group) schema.group = new Types.ObjectId(this.group);
    if (this.createdBy) schema.createdBy = new Types.ObjectId(this.createdBy);

    return schema;
  }

  getAdmins(): string[] {
    return [...this.admins];
  }

  getGroup(): string {
    return this.group;
  }

  getType(): BoardType {
    return this.type;
  }

  getCreatedBy(): string {
    return this.createdBy;
  }
}
