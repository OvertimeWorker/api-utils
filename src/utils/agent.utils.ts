import axios, { AxiosError } from "axios"
import { GatewayTimeoutException, InternalException } from "../exceptions/internal.exception.js"
import { StatusCodes } from "http-status-codes"
import { ForbiddenException, InvalidTokenException } from "../exceptions/auth.exception.js"
import { NotFoundException } from "../exceptions/notFound.exception.js"
import { BadRequestException } from "../exceptions/badRequests.exception.js"
import { ValidationException } from "~/exceptions/validate.exception.js"
import { requestContext } from "./context.utils.js"
import { ErrorCodes } from "~/consts/error.const.js"
import type { ServiceClient } from "~/types/agent.types.js"
import type { ApiResponse } from "~/types/express.types.js"

const createServiceClient = (baseURL: string, internalSecret: string, timeout = 8000) => {
  const instance = axios.create({
    baseURL,
    timeout,
  })

  instance.interceptors.request.use((config) => {
    const store = requestContext.getStore()

    if (config.internalMeta?.authToken !== false) {
      if (typeof config.internalMeta?.authToken === "string") {
        config.headers.set("authorization", `Bearer ${config.internalMeta.authToken}`)
      } else if (store?.authToken) {
        config.headers.set("authorization", `Bearer ${store.authToken}`)
      }
    }

    if (config.internalMeta?.clientIp !== false) {
      if (typeof config.internalMeta?.clientIp === "string") {
        config.headers.set("x-forwarded-for", config.internalMeta.clientIp)
      } else if (store?.clientIp) {
        config.headers.set("x-forwarded-for", store.clientIp)
      }
    }

    if (config.internalMeta?.userAgent !== false) {
      if (typeof config.internalMeta?.userAgent === "string") {
        config.headers.set("user-agent", config.internalMeta.userAgent)
      } else if (store?.userAgent) {
        config.headers.set("user-agent", store.userAgent)
      }
    }

    if (config.internalMeta?.internalSecret !== false) {
      if (typeof config.internalMeta?.internalSecret === "string") {
        config.headers.set("x-internal-secret", config.internalMeta.internalSecret)
      } else {
        config.headers.set("x-internal-secret", internalSecret)
      }
    }

    return config
  })

  instance.interceptors.response.use(
    (response) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = response.data as ApiResponse<any>

      if (data.success === false) {
        throw new InternalException(data.error.code, data.message, data.error.details)
      }

      return data.data
    },
    (error: AxiosError) => {
      if (error.config?.internalMeta?.internalSecret === false) {
        throw error
      }

      const remoteStatus = error.response?.status || StatusCodes.SERVICE_UNAVAILABLE
      const remoteData = error.response?.data as ApiResponse | undefined

      // Handle Network/Timeout failures
      if (!error.response || remoteStatus === StatusCodes.SERVICE_UNAVAILABLE) {
        throw new GatewayTimeoutException()
      }

      if (remoteData?.success === false) {
        // Handle Path Not Found
        if (remoteData.error.code === ErrorCodes.PATH_NOT_FOUND.code) {
          throw new InternalException(
            remoteData.error.code,
            remoteData.message,
            remoteData.error.details,
          )
        }

        // Handle Auth failures
        if (remoteStatus === StatusCodes.UNAUTHORIZED) {
          throw new InvalidTokenException(remoteData.error.code, remoteData.message)
        }
        if (remoteStatus === StatusCodes.FORBIDDEN) {
          throw new ForbiddenException(remoteData.error.code, remoteData.message)
        }

        // Handle Validation failures
        if (remoteData.error.code === ErrorCodes.VALIDATION_FAILED.code) {
          throw new ValidationException(
            remoteData.error.details as ConstructorParameters<typeof ValidationException>[0],
          )
        }

        // Handle Bad Requests
        if (remoteStatus === StatusCodes.BAD_REQUEST) {
          throw new BadRequestException(remoteData.error.code, remoteData.message)
        }

        // Handle Not Found
        if (remoteStatus === StatusCodes.NOT_FOUND) {
          throw new NotFoundException(remoteData.error.code, remoteData.message)
        }

        // Handle Other Errors
        throw new InternalException(
          remoteData.error.code,
          remoteData.message,
          remoteData.error.details,
        )
      }

      throw error
    },
  )

  return instance as ServiceClient
}

export { createServiceClient }
