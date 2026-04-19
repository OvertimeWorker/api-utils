import type { PERMISSION_KEYS } from "~/consts/permission.const.js"

type PermissionKey = (typeof PERMISSION_KEYS)[number]

export type { PermissionKey }
