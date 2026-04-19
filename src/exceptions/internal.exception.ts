import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { HttpException } from "./root.exception.js"
import type { ErrorCode } from "~/types/error.types.js"
import { ErrorCodes } from "~/consts/error.const.js"

class InternalException<T> extends HttpException {
  // Overloads
  constructor(error: ErrorCode, message?: string, details?: T)
  constructor(code?: number, message?: string, details?: T)

  // Implementation
  constructor(code?: number | ErrorCode, message?: string, details?: T) {
    if (typeof code === "number" || typeof code === "undefined") {
      super(
        code ?? StatusCodes.INTERNAL_SERVER_ERROR,
        message ?? ReasonPhrases.INTERNAL_SERVER_ERROR,
        details,
        StatusCodes.INTERNAL_SERVER_ERROR,
      )
    } else {
      super(code.code, message ?? code.message, details, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}

class GatewayTimeoutException extends HttpException {
  constructor(message?: string) {
    super(
      ErrorCodes.GATEWAY_TIMEOUT.code,
      message ?? ErrorCodes.GATEWAY_TIMEOUT.message,
      null,
      StatusCodes.SERVICE_UNAVAILABLE,
    )
  }
}

export { InternalException, GatewayTimeoutException }
