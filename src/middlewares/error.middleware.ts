import type { Request, Response, NextFunction } from "express"
import { HttpException } from "../exceptions/root.exception.js"
import { InternalException } from "../exceptions/internal.exception.js"
import { ReasonPhrases, StatusCodes } from "http-status-codes"

const ErrorMiddleware = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  let exception: HttpException

  if (error instanceof HttpException) {
    exception = error
  } else {
    exception = new InternalException(
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      process.env["NODE_ENV"] === "development" ? error.stack : null,
    )
  }

  const { message, code, details } = exception
  // eslint-disable-next-line no-console
  console.error(error.stack)

  res.status(exception.code ?? StatusCodes.INTERNAL_SERVER_ERROR).json({
    statusCode: code,
    statusDesc: "failed",
    success: false,
    data: null,
    error: {
      code: code,
      details: details,
    },
    message: message,
  })
}

export { ErrorMiddleware }
