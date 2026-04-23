import type { RequestHandler } from "express"
import { StatusCodes } from "http-status-codes"
import { ZodError } from "zod"
import { ValidationException } from "~/exceptions/validate.exception.js"
import { handleAuth } from "~/middlewares/auth.middleware.js"
import { handleValidation } from "~/middlewares/validate.middleware.js"
import type {
  AuthConfig,
  ControllerConfig,
  ControllerHandlerResponse,
  RequestSchemaStructure,
} from "~/types/express.types.js"

function defineController<
  S extends RequestSchemaStructure,
  A extends AuthConfig | undefined = undefined,
>(config: ControllerConfig<S, A>): RequestHandler {
  return async (req, res, next) => {
    try {
      // Execute Auth Logic
      if (config.auth) {
        const authOptions = typeof config.auth === "object" ? config.auth : undefined
        await handleAuth(req as never, authOptions)
      }

      // Execute Zod Validation
      if (config.schema) {
        await handleValidation(req as never, config.schema)
      }

      // Execute Handler
      if (config.handler.length === 1) {
        // Only 1 arg (req) => Promise<ControllerHandlerResponse>

        const { statusCode, ...result } = await (
          config.handler as (req: unknown) => Promise<ControllerHandlerResponse>
        )(req)

        res.status(statusCode ?? StatusCodes.OK).json(result)
      } else {
        await (config.handler as (req: unknown, res: unknown) => Promise<void>)(req, res)
      }
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        return next(new ValidationException(err.issues))
      }
      next(err)
    }
  }
}

export { defineController }
