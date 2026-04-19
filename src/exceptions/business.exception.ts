import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { HttpException } from "./root.exception.js"
import type { ErrorCode } from "~/types/error.types.js"

class BusinessException extends HttpException {
  // Overloads
  constructor(message: string)
  constructor(error: ErrorCode, message?: string)
  constructor(code?: number, message?: string)

  // Implementation
  constructor(code?: number | ErrorCode | string, message?: string) {
    if (typeof code === "string") {
      super(
        StatusCodes.UNPROCESSABLE_ENTITY,
        message ?? ReasonPhrases.UNPROCESSABLE_ENTITY,
        null,
        StatusCodes.UNPROCESSABLE_ENTITY,
      )
    } else if (typeof code === "number" || typeof code === "undefined") {
      super(
        code ?? StatusCodes.UNPROCESSABLE_ENTITY,
        message ?? ReasonPhrases.UNPROCESSABLE_ENTITY,
        null,
        StatusCodes.UNPROCESSABLE_ENTITY,
      )
    } else {
      super(code.code, message ?? code.message, null, StatusCodes.UNPROCESSABLE_ENTITY)
    }
  }
}

export { BusinessException }
