import type { AUTH_USER_ROLES } from "~/consts/auth.const.js"
import type { PermissionKey } from "./permission.types.js"
import type { AuthOptions } from "./express.types.js"

type AuthUser = {
  id: number
  email: string
  tokenVersion: number
  role: (typeof AUTH_USER_ROLES)[number]
  permissions?: PermissionKey[]
}

declare global {
  var AuthService: {
    verify(
      id: number,
      tokenVersion: number,
      role: string,
      requiredPerms?: AuthOptions["requiredPerms"],
      requiredRoles?: AuthOptions["requiredRoles"],
      fetchPerms?: AuthOptions["fetchPerms"],
    ): Promise<{ permissions: AuthUser["permissions"] }>
  }
}

export type { AuthUser }
