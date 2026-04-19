import type { Request, Response, NextFunction } from "express"
import { ForbiddenException } from "../exceptions/auth.exception.js"

const INTERNAL_SECRET = process.env["INTERNAL_SECRET"]

const InternalMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const provideSecret = req.get("x-internal-secret")

  if (!provideSecret || provideSecret !== INTERNAL_SECRET) {
    throw new ForbiddenException()
  }

  next()
}

export { InternalMiddleware }
