import type { AxiosInstance, AxiosRequestConfig } from "axios"

declare module "axios" {
  export interface AxiosRequestConfig {
    internalMeta?: {
      clientIp?: boolean | string
      internalSecret?: boolean | string
      userAgent?: boolean | string
      authToken?: boolean | string
    }
  }
}

type ServiceClient = Omit<AxiosInstance, "get" | "post" | "put" | "delete"> & {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export type { ServiceClient }
