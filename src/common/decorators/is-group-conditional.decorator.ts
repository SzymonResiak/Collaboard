// src/decorators/group-conditional.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Types } from 'mongoose';
import { BoardType } from 'src/boards/enums/board-type.enum';

export function IsGroupConditional(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isGroupConditional',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const boardType = (args.object as any).type;

          if (boardType === BoardType.GROUP) {
            return Types.ObjectId.isValid(value);
          }

          return value === undefined || value === null;
        },
        defaultMessage(args: ValidationArguments) {
          const boardType = (args.object as any).type;

          if (boardType === BoardType.GROUP) {
            return 'Group ID must be a valid MongoDB ObjectId when group type is "group"';
          }
          return 'Group field must be omitted when group type is not "private"';
        },
      },
    });
  };
}
