import type { AuthUser } from "~/types/auth.types.js"
import { createServiceClient } from "~/utils/agent.utils.js"

const AUTH_SERVICE_URL = process.env["AUTH_SERVICE_URL"] || "http://localhost:5001"
const INTERNAL_SECRET = process.env["INTERNAL_SECRET"] || "your-secret-key"
const authClient = createServiceClient(AUTH_SERVICE_URL, INTERNAL_SECRET)

const AuthAgent = {
  async verifyToken(payload: unknown) {
    return authClient.post<AuthUser>("/internal/verify", payload)
  },
}

export { AuthAgent }
