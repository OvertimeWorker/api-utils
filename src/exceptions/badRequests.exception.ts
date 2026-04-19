import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { HttpException } from "./root.exception.js"
import type { ErrorCode } from "~/types/error.types.js"

class BadRequestException extends HttpException {
  // Overloads
  constructor(error: ErrorCode, message?: string)
  constructor(code?: number, message?: string)

  // Implementation
  constructor(code?: number | ErrorCode, message?: string) {
    if (typeof code === "number" || typeof code === "undefined") {
      super(
        code ?? StatusCodes.BAD_REQUEST,
        message ?? ReasonPhrases.BAD_REQUEST,
        null,
        StatusCodes.BAD_REQUEST,
      )
    } else {
      super(code.code, message ?? code.message, null, StatusCodes.BAD_REQUEST)
    }
  }
}

export { BadRequestException }
