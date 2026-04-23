class HttpException<T = unknown | undefined> extends Error {
  code?: number
  override message: string
  details: T
  statusCode: number

  constructor(code: number, message: string, details: T, statusCode: number) {
    super(message)
    this.code = code
    this.message = message
    this.details = details
    this.statusCode = statusCode
  }
}

export { HttpException }
