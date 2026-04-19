import { AsyncLocalStorage } from "node:async_hooks"
import type { RequestStore } from "~/types/context.types.js"

const requestContext = new AsyncLocalStorage<RequestStore>()

export { requestContext }
