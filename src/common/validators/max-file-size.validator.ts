import { FileValidator } from '@nestjs/common';

export interface MaxFileSizeValidatorOptions {
  maxSize: number;
}

export class MaxFileSizeValidator extends FileValidator<MaxFileSizeValidatorOptions> {
  buildErrorMessage(): string {
    return `File size cannot exceed ${this.validationOptions.maxSize} bytes`;
  }

  isValid(file?: Express.Multer.File): boolean {
    return file?.size <= this.validationOptions.maxSize;
  }
}
