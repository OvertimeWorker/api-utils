import type { Request } from "express"
import type z from "zod"
import type { PermissionKey } from "./permission.types.js"
import type { AuthUser } from "./auth.types.js"

type RequestSchemaStructure = z.ZodObject<{
  params?: z.ZodObject
  query?: z.ZodObject
  body?: z.ZodObject
}>

type ExtractPart<T, K extends string> = T extends Record<K, infer V> ? V : never
type ValidatedRequest<T extends z.ZodObject> =
  z.infer<T> extends infer I
    ? Request<ExtractPart<I, "params">, unknown, ExtractPart<I, "body">, ExtractPart<I, "query">>
    : never

type ValidatedRequestWithUser<S extends RequestSchemaStructure> = ValidatedRequest<S> & {
  user: AuthUser
}

type RequestDTO<T extends RequestSchemaStructure> = z.infer<T>
type ParamsDTO<T extends RequestSchemaStructure> = z.infer<T>["params"]
type QueryDTO<T extends RequestSchemaStructure> = z.infer<T>["query"]
type BodyDTO<T extends RequestSchemaStructure> = z.infer<T>["body"]
type BodyKeyDTO<
  T extends RequestSchemaStructure,
  K extends keyof NonNullable<z.infer<T>["body"]>,
> = NonNullable<z.infer<T>["body"]>[K]

interface AuthRequest extends Request {
  user?: AuthUser
}

type PermissionRequirement =
  | PermissionKey // Simple check
  | { and: PermissionRequirement[] } // All must pass
  | { or: PermissionRequirement[] } // At least one must pass

type AuthOptions = {
  requiredPerms?: PermissionRequirement
  requiredRoles?: AuthUser["role"] | AuthUser["role"][]
  fetchPerms?: boolean
  skipServiceVerify?: boolean
}

type AuthConfig = boolean | AuthOptions | undefined

type ApiResponse<T = unknown> =
  | {
      success: true
      message: string
      data: T | null
    }
  | {
      success: false
      message: string
      error: {
        code: number
        details?: unknown
      }
    }

type RequestWithDynamicPerms<S extends RequestSchemaStructure, A extends AuthConfig> = A extends {
  fetchPerms: true
}
  ? ValidatedRequestWithUser<S> & { user: { permissions: PermissionKey[] } }
  : Omit<ValidatedRequestWithUser<S>, "user"> & { user: Omit<AuthUser, "permissions"> }

type ControllerHandler<S extends RequestSchemaStructure, A extends AuthConfig | undefined> =
  // Handlers that use 'res' (return void)
  | ((
      req: A extends AuthConfig ? RequestWithDynamicPerms<S, A> : ValidatedRequest<S>,
      res: Response,
    ) => Promise<void>)
  // Handlers that skip 'res' (must return ControllerHandlerResponse)
  | ((
      req: A extends AuthConfig ? RequestWithDynamicPerms<S, A> : ValidatedRequest<S>,
    ) => Promise<ControllerHandlerResponse>)

type ControllerHandlerResponse<T = unknown> = ApiResponse<T> & { statusCode?: number }

interface ControllerConfig<S extends RequestSchemaStructure, A extends AuthConfig | undefined> {
  schema?: S
  auth?: A
  handler: ControllerHandler<S, A>
}

export type {
  AuthUser,
  RequestDTO,
  BodyDTO,
  BodyKeyDTO,
  QueryDTO,
  ParamsDTO,
  AuthRequest,
  PermissionRequirement,
  AuthOptions,
  ValidatedRequest,
  ValidatedRequestWithUser,
  RequestSchemaStructure,
  AuthConfig,
  ControllerConfig,
  ApiResponse,
  ControllerHandlerResponse,
}
