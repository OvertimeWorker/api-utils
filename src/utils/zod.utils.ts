import { z } from "zod"
import { Decimal, type DecimalJsLike, type InputJsonValue } from "@prisma/client/runtime/client.js"
import { ValidationException } from "~/exceptions/validate.exception.js"

const zTrimString = (params?: Parameters<typeof z.string>[0]) => z.string(params).trim()
const zTrimEmail = (params?: Parameters<typeof z.email>[0]) => z.email(params).trim()

// JSON
const InputJsonValueSchema: z.ZodType<InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(
      z.string(),
      z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)])),
    ),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ]),
)

// DECIMAL
const DECIMAL_STRING_REGEX =
  /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/

const isValidDecimalInput = (v?: unknown): v is string | number | DecimalJsLike => {
  if (v === undefined || v === null) return false
  return (
    (typeof v === "object" && "d" in v && "e" in v && "s" in v && "toFixed" in v) ||
    (typeof v === "string" && DECIMAL_STRING_REGEX.test(v)) ||
    typeof v === "number"
  )
}

function normalizeToDecimalInput(val: string | number | DecimalJsLike): string | number {
  if (typeof val === "string" || typeof val === "number") {
    return val
  }

  // Prisma DecimalJsLike usually has toString()
  if (val && typeof val.toString === "function") {
    return val.toString()
  }

  throw new Error("Invalid DecimalJsLike")
}

const DecimalInputSchema = z
  .custom<string | number | DecimalJsLike>(
    (val): val is string | number | DecimalJsLike => isValidDecimalInput(val),
    {
      message: "Invalid decimal format",
    },
  )
  .transform((val) => new Decimal(normalizeToDecimalInput(val)))

async function validatePayload(schema: z.ZodObject, payload: unknown) {
  try {
    await schema.parseAsync(payload)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new ValidationException(error.issues)
    }
    throw error
  }
}

export { zTrimString, zTrimEmail, InputJsonValueSchema, DecimalInputSchema, validatePayload }
