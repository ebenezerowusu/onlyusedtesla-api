import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    res.status(status).send({
      type: 'about:blank',
      title: exception.message || 'Internal Server Error',
      status,
    });
  }
}
