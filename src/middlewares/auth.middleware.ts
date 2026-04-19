import type { Response, NextFunction } from "express"
import {
  ExpiredTokenException,
  InvalidTokenException,
  NoTokenProvidedException,
} from "../exceptions/auth.exception.js"
import jwt from "jsonwebtoken"
import z from "zod"
import type {
  AuthOptions,
  AuthRequest,
  AuthUser,
  PermissionRequirement,
} from "~/types/express.types.js"
import { requestContext } from "~/utils/context.utils.js"
import { PERMISSION_KEYS } from "~/consts/permission.const.js"
import { validatePayload } from "~/utils/zod.utils.js"
import { AUTH_USER_ROLES } from "~/consts/auth.const.js"
import { AuthAgent } from "~/agents/auth.agent.js"

const JWT_SECRET = process.env["JWT_SECRET"] || "your-secret-key"
const IS_AUTH_SERVICE = process.env["AUTH_SERVICE"] === "true"

// By default, having requiredPerms means that the user must be admin
// requiredRoles is an array of roles that the user must have, if you want to check either of them pass, then can make this argument undefined
// fetchPerms is a boolean that will fetch the permissions of the user and add it to the user object, borrower will have undefined permissions
function AuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void
function AuthMiddleware(
  options?: AuthOptions,
): (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>

// Implementation
function AuthMiddleware(arg?: AuthOptions | AuthRequest, res?: Response, next?: NextFunction) {
  // Check if it's "Direct Use" (checking for res and next)
  if (res && typeof next === "function") {
    const req = arg as AuthRequest
    handleAuth(req)
      .then(() => next())
      .catch(next)
    return
  }

  // Otherwise, it's "Factory Use"
  const options = arg as AuthOptions
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      await handleAuth(req, options)
      next()
    } catch (err) {
      next(err)
    }
  }
}

async function handleAuth(req: AuthRequest, options?: AuthOptions) {
  if (IS_AUTH_SERVICE) {
    return handleInternalAuth(req, options)
  } else {
    return handleExternalAuth(req, options)
  }
}

async function handleExternalAuth(req: AuthRequest, options?: AuthOptions) {
  // Check the Context Store
  const store = requestContext.getStore()

  if (!store?.authToken) {
    throw new NoTokenProvidedException()
  }

  const userData = await AuthAgent.verifyToken({
    requiredPerms: options?.requiredPerms,
    requiredRoles: options?.requiredRoles,
    fetchPerms: options?.fetchPerms,
  })

  req.user = userData
}

async function handleInternalAuth(req: AuthRequest, options?: AuthOptions) {
  try {
    const rawAuth = req.get("authorization")

    if (!rawAuth) {
      throw new NoTokenProvidedException()
    }

    // Remove leading "Bearer " (case-insensitive) and trim
    const token = rawAuth.replace(/^[Bb]earer\s+/, "").trim()
    if (!token) {
      throw new NoTokenProvidedException()
    }

    // Decode token
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser

    // Verify user
    if (!options?.skipServiceVerify) {
      // Validate Payload
      const permissionRequirementSchema: z.ZodType<PermissionRequirement> = z.lazy(() =>
        z.union([
          z.enum(PERMISSION_KEYS),
          z.object({
            and: z.array(permissionRequirementSchema),
          }),
          z.object({
            or: z.array(permissionRequirementSchema),
          }),
        ]),
      )
      const authRoleSchema = z.enum(AUTH_USER_ROLES)
      await validatePayload(
        z.object({
          requiredPerms: permissionRequirementSchema.optional(),
          requiredRoles: z.union([authRoleSchema, z.array(authRoleSchema)]).optional(),
          fetchPerms: z
            .boolean()
            .optional()
            .transform((val) => val === true),
        }),
        {
          requiredPerms: options?.requiredPerms,
          requiredRoles: options?.requiredRoles,
          fetchPerms: options?.fetchPerms,
        },
      )

      // Send request to local service
      const { permissions } = await global.AuthService.verify(
        decoded.id,
        decoded.tokenVersion,
        decoded.role,
        options?.requiredPerms,
        options?.requiredRoles,
        options?.fetchPerms,
      )
      decoded.permissions = permissions || []
    }

    req.user = decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ExpiredTokenException()
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenException()
    }

    throw error
  }
}

export { AuthMiddleware, handleAuth }
