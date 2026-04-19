import { StatusCodes } from "http-status-codes"
import { type $ZodIssue } from "zod/v4/core"
import { ErrorCodes } from "~/consts/error.const.js"
import { HttpException } from "./root.exception.js"

class ValidationException extends HttpException {
  constructor(errors: $ZodIssue[]) {
    super(
      ErrorCodes.VALIDATION_FAILED.code,
      ErrorCodes.VALIDATION_FAILED.message,
      errors,
      StatusCodes.BAD_REQUEST,
    )
  }
}

export { ValidationException }
