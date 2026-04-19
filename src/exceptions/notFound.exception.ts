import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { HttpException } from "./root.exception.js"
import type { ErrorCode } from "~/types/error.types.js"

class NotFoundException extends HttpException {
  // Overloads
  constructor(error: ErrorCode, message?: string)
  constructor(code?: number, message?: string)

  // Implementation
  constructor(code?: number | ErrorCode, message?: string) {
    if (typeof code === "number" || typeof code === "undefined") {
      super(
        code ?? StatusCodes.NOT_FOUND,
        message ?? ReasonPhrases.NOT_FOUND,
        null,
        StatusCodes.NOT_FOUND,
      )
    } else {
      super(code.code, message ?? code.message, null, StatusCodes.NOT_FOUND)
    }
  }
}

export { NotFoundException }
