import type { ErrorCode } from "~/types/error.types.js"

const ErrorCodes = {
  // Service Client Errors (1000+)
  GATEWAY_TIMEOUT: {
    code: 1001,
    message: "Remote service is unreachable or timed out",
  },

  // Auth Errors (2000+)
  INVALID_TOKEN: {
    code: 2001,
    message: "Invalid token",
  },
  NO_TOKEN_PROVIDED: {
    code: 2002,
    message: "No token provided",
  },
  TOKEN_EXPIRED: {
    code: 2003,
    message: "Token expired",
  },
  FORBIDDEN: {
    code: 2004,
    message: "You do not have permission to access this resource",
  },

  // Zod Validation Errors (3000+)
  VALIDATION_FAILED: {
    code: 3001,
    message: "Field validation failed",
  },

  // Path Errors (4000+)
  PATH_NOT_FOUND: {
    code: 4001,
    message: "Path not found",
  },
} satisfies Record<string, ErrorCode>

export { ErrorCodes }
