import type { Request, Response, NextFunction } from "express"
import type { RequestStore } from "~/types/context.types.js"
import { requestContext } from "~/utils/context.utils.js"

function extractToken(req: Request) {
  const rawAuth = req.get("authorization")
  const token = rawAuth?.replace(/^[Bb]earer\s+/, "").trim()

  return token
}

function getClientIp(req: Request) {
  const forwarded = req.get("x-forwarded-for")

  if (forwarded && typeof forwarded === "string") {
    const ip = forwarded?.split(",")[0]?.trim()
    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
      return "127.0.0.1"
    }

    if (ip?.startsWith("::ffff:")) {
      return ip.substring(7)
    }

    return ip
  }

  const ip = req.ip || req.socket.remoteAddress || "unknown"
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    return "127.0.0.1"
  }

  if (ip.startsWith("::ffff:")) {
    return ip.substring(7)
  }

  return ip.toString()
}

const ContextMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // Prepare the Store
  const store: RequestStore = {
    clientIp: getClientIp(req),
    authToken: extractToken(req),
    userAgent: req.get("User-Agent"),
  }

  // Run the context
  requestContext.run(store, next)
}

export { ContextMiddleware }
