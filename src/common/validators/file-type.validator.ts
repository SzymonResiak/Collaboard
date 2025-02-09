import { FileValidator } from '@nestjs/common';

export interface FileTypeValidatorOptions {
  fileType: RegExp;
}

export class FileTypeValidator extends FileValidator<FileTypeValidatorOptions> {
  buildErrorMessage(): string {
    return `File type must match ${this.validationOptions.fileType}`;
  }

  isValid(file?: Express.Multer.File): boolean {
    return this.validationOptions.fileType.test(file?.mimetype);
  }
}
