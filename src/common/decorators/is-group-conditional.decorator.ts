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
      propertyName,
      options: validationOptions,
      validator: {
        validate(type: any, args: ValidationArguments) {
          const { group } = args.object as any;

          if (type === BoardType.GROUP) {
            return Types.ObjectId.isValid(group);
          }

          if (type === BoardType.PERSONAL) {
            return group === undefined || group === null;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const { group } = args.object as any;
          const type = args.value;

          if (type === BoardType.GROUP) {
            return 'Group ID must be a valid MongoDB ObjectId when type is "GROUP".';
          }
          if (type === BoardType.PERSONAL && group !== undefined) {
            return 'Group field must not be present when type is "PERSONAL".';
          }

          return 'Invalid group field condition.';
        },
      },
    });
  };
}
