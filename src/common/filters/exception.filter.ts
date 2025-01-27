import { ArgumentsHost, Catch } from '@nestjs/common';

@Catch()
export class ExceptionFilter<T>  {
  catch(exception: T, host: ArgumentsHost) {}
}
