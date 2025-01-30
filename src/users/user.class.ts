import { Model, Types } from 'mongoose';
import { User } from './schemes/user';
import * as bcrypt from 'bcrypt';

export class UserClass {
  readonly id: string;

  private login: string;
  private name: string;
  private email: string;
  private hashedPasswd: string;
  private groups: string[];
  private boards: string[];
  private createdAt: Date;
  private updatedAt: Date;

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
    if (doc.login) this.login = doc.login;
    if (doc.name) this.name = doc.name;
    if (doc.email) this.email = doc.email;
    if (doc.groups) this.groups = [...doc.groups];
    if (doc.boards) this.boards = [...doc.boards];
    if (doc.password) this.hashedPasswd = doc.password;
    if (doc.createdAt) this.createdAt = new Date(doc.createdAt);
    if (doc.updatedAt) this.updatedAt = new Date(doc.updatedAt);
  }

  isValid(): boolean {
    if (!this.name || !this.login || !this.hashedPasswd || !this.login) {
      return false;
    }
    return true;
  }

  async isValidPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.hashedPasswd);
  }

  update(updates: any): void {
    if (updates.name) this.name = updates.name;
    if (updates.email) this.email = updates.email;
    if (updates.groups) this.groups.push(...updates.groups);
    if (updates.boards) this.boards.push(...updates.boards);
    // if (updates.password) this.hashedPasswd = updates.password;
  }

  /**
   * Converts the current user class to a Mongoose-compatible model.
   * @returns {Partial<User>} - Returns an object with Mongoose-compatible data.
   */
  toMongoModel(): Partial<User> {
    const schema: any = {};

    if (this.id) schema._id = new Types.ObjectId(this.id);
    if (this.login) schema.login = this.login;
    if (this.name) schema.name = this.name;
    if (this.email) schema.email = this.email;
    if (this.groups) schema.groups = Array.from(new Set([...this.groups]));
    if (this.boards) schema.boards = Array.from(new Set([...this.boards]));
    if (this.hashedPasswd && this.isValidPassword(this.hashedPasswd)) {
      schema.password = this.hashedPasswd;
    }
    return schema;
  }

  // Placeholder for getter methods
  // getName(): string { return this.name; }
  // getEmail(): string { return this.email; }
  getLogin(): string {
    return this.login;
  }

  getGroups(): string[] {
    return this.groups;
  }

  getBoards(): string[] {
    return this.boards;
  }

  // Placeholder for methods to manipulate user properties
  // updateEmail(newEmail: string): void { this.email = newEmail; }
  async setPasswd(password: string) {
    this.hashedPasswd = await bcrypt.hash(password, 10);
    return !!this.hashedPasswd;
  }
}
