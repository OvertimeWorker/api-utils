import type { Request } from "express"
import { ErrorCodes } from "~/consts/error.const.js"
import { NotFoundException } from "~/exceptions/notFound.exception.js"

const PathNotFoundMiddleware = (req: Request) => {
  throw new NotFoundException(
    ErrorCodes.PATH_NOT_FOUND,
    `Path not found: ${req.method} ${req.originalUrl}`,
  )
}

export { PathNotFoundMiddleware }
