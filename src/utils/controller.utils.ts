import type { RequestHandler } from "express"
import { z, ZodError } from "zod"
import { ValidationException } from "~/exceptions/validate.exception.js"
import { handleAuth } from "~/middlewares/auth.middleware.js"
import { handleValidation } from "~/middlewares/validate.middleware.js"
import type {
  AuthConfig,
  AuthControllerConfig,
  RequestSchemaStructure,
  StandardControllerConfig,
} from "~/types/express.types.js"

// Overloads
function defineController<S extends RequestSchemaStructure, A extends AuthConfig>(
  config: AuthControllerConfig<S, A>,
): RequestHandler
function defineController<S extends RequestSchemaStructure>(
  config: StandardControllerConfig<S>,
): RequestHandler

// Implementation
function defineController<
  S extends RequestSchemaStructure = z.ZodObject,
  A extends AuthConfig = AuthConfig,
>(config: AuthControllerConfig<S, A> | StandardControllerConfig<S>): RequestHandler {
  return async (req, res) => {
    try {
      // Execute Auth Middleware
      if (config.auth) {
        const authOptions = typeof config.auth === "object" ? config.auth : undefined
        await handleAuth(req as Parameters<typeof handleAuth>[0], authOptions)
      }

      // Execute Zod Validation
      if (config.schema) {
        await handleValidation(req as Parameters<typeof handleValidation>[0], config.schema)
      }

      // Execute Handler
      await config.handler(req, res)
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        throw new ValidationException(err.issues)
      }
      throw err
    }
  }
}

export { defineController }
