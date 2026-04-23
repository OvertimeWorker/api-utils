import type { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { ValidationException } from "../exceptions/validate.exception.js"
import type { RequestSchemaStructure } from "~/types/express.types.js"

const ValidateMiddleware =
  (schema: RequestSchemaStructure) => async (req: Request, _res: Response, next: NextFunction) => {
    await handleValidation(req, schema)
    next()
  }

async function handleValidation(req: Request, schema: RequestSchemaStructure) {
  try {
    const validated = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    })

    // Update request with validated data
    req.body = validated.body ?? {}

    if (validated.query) {
      Object.keys(req.query).forEach((key) => delete req.query[key])
      Object.assign(req.query, validated.query)
    }

    if (validated.params) {
      Object.assign(req.params, validated.params)
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new ValidationException(error.issues)
    }
    throw error
  }
}

export { ValidateMiddleware, handleValidation }
