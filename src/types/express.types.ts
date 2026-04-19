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

type RequestWithDynamicPerms<S extends RequestSchemaStructure, A extends AuthConfig> = A extends {
  fetchPerms: true
}
  ? ValidatedRequestWithUser<S> & { user: { permissions: PermissionKey[] } }
  : Omit<ValidatedRequestWithUser<S>, "user"> & { user: Omit<AuthUser, "permissions"> }

interface AuthControllerConfig<S extends RequestSchemaStructure, A extends AuthConfig> {
  schema?: S
  auth: A
  handler: (req: RequestWithDynamicPerms<S, A>, res: Response) => any
}
interface StandardControllerConfig<S extends RequestSchemaStructure> {
  schema?: S
  auth?: never
  handler: (req: ValidatedRequest<S>, res: Response) => any
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
  AuthControllerConfig,
  StandardControllerConfig,
}
