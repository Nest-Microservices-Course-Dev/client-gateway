import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

interface RpcErrorPayload {
  status: number;
  message: string;
}

function isRpcErrorPayload(error: unknown): error is RpcErrorPayload {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
}

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const rpcError = exception.getError();

    if (
      rpcError instanceof Error &&
      rpcError.message.includes('Empty response')
    ) {
      return response.status(500).json({
        status: 500,
        message: rpcError
          .toString()
          .substring(0, rpcError.toString().indexOf('(') - 1),
      });
    }

    if (isRpcErrorPayload(rpcError)) {
      const status = isNaN(+rpcError.status) ? 400 : +rpcError.status;
      return response.status(status).json(rpcError);
    }

    response.status(400).json({
      status: 400,
      message: exception.getError(),
    });
    //return throwError(() => exception.getError());
  }
}
