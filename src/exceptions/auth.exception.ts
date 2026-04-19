import { StatusCodes } from "http-status-codes"
import { HttpException } from "./root.exception.js"
import type { ErrorCode } from "~/types/error.types.js"
import { ErrorCodes } from "~/consts/error.const.js"

class InvalidTokenException extends HttpException {
  // Overloads
  constructor(error: ErrorCode, message?: string)
  constructor(code?: number, message?: string)

  // Implementation
  constructor(code?: number | ErrorCode, message?: string) {
    if (typeof code === "number" || typeof code === "undefined") {
      super(
        code ?? ErrorCodes.INVALID_TOKEN.code,
        message ?? ErrorCodes.INVALID_TOKEN.message,
        null,
        StatusCodes.UNAUTHORIZED,
      )
    } else {
      super(code.code, message ?? code.message, null, StatusCodes.UNAUTHORIZED)
    }
  }
}

class NoTokenProvidedException extends InvalidTokenException {
  constructor() {
    super(ErrorCodes.NO_TOKEN_PROVIDED.code, ErrorCodes.NO_TOKEN_PROVIDED.message)
  }
}

class ExpiredTokenException extends InvalidTokenException {
  constructor() {
    super(ErrorCodes.TOKEN_EXPIRED.code, ErrorCodes.TOKEN_EXPIRED.message)
  }
}

class ForbiddenException extends HttpException {
  // Overloads
  constructor(error: ErrorCode, message?: string)
  constructor(code?: number, message?: string)

  // Implementation
  constructor(code?: number | ErrorCode, message?: string) {
    if (typeof code === "number" || typeof code === "undefined") {
      super(
        code ?? ErrorCodes.FORBIDDEN.code,
        message ?? ErrorCodes.FORBIDDEN.message,
        null,
        StatusCodes.FORBIDDEN,
      )
    } else {
      super(code.code, message ?? code.message, null, StatusCodes.FORBIDDEN)
    }
  }
}

export {
  InvalidTokenException,
  NoTokenProvidedException,
  ExpiredTokenException,
  ForbiddenException,
}
