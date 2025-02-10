import { Model, Types } from 'mongoose';
import { Board } from './schemes/board';
import { BoardType } from './enums/board-type.enum';
import { BoardColors } from './enums/board-colors.enum';
import { Column } from './interfaces/column.interface';

export class BoardClass {
  readonly id: string;

  private name: string;
  private description: string;
  private type: BoardType;
  private color: string;
  private columns: Column[];
  private admins: string[];
  private group: string;
  private favourite: boolean;
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
    if (doc.color) this.color = doc.color;
    if (doc.createdBy) this.createdBy = doc.createdBy;
    if (doc.group) this.group = doc.group;
    if (doc.favourite) this.favourite = doc.favourite;
    if (Array.isArray(doc.admins)) this.admins = [...doc.admins];
    if (Array.isArray(doc.columns)) {
      this.columns = doc.columns.map((column) => ({
        name: column.name,
        color: column.color,
      }));
    }
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
    if (updates.color && Object.values(BoardColors).includes(updates.color)) {
      this.color = updates.color;
    }
    if (Array.isArray(updates.columns)) {
      this.columns = updates.columns.map((col) => ({
        name: col.name,
        color: Object.values(BoardColors).includes(col.color)
          ? col.color
          : BoardColors.PURPLE,
      }));
    }
    if (typeof updates.favourite === 'boolean')
      this.favourite = updates.favourite;
  }

  toMongoModel(): Partial<Board> {
    const schema: any = {};

    if (this.id) schema._id = new Types.ObjectId(this.id);
    if (this.name) schema.name = this.name;
    if (this.description) schema.description = this.description;
    if (this.type) schema.type = this.type;
    if (this.color) schema.color = this.color;
    if (this.createdBy) schema.createdBy = new Types.ObjectId(this.createdBy);
    if (this.group) schema.group = new Types.ObjectId(this.group);
    if (typeof this.favourite === 'boolean') schema.favourite = this.favourite;

    if (this.columns) {
      schema.columns = this.columns.map((column) => ({
        name: column.name,
        color: column.color,
      }));
    }

    if (Array.isArray(this.admins)) {
      schema.admins = this.admins.map((id) => new Types.ObjectId(id));
    }

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

  // use to filter favourites on top of the array.
  getFavourite(): boolean {
    return this.favourite;
  }

  getCreatedBy(): string {
    return this.createdBy;
  }
}
