function calculatePagination(params: {
  page?: number | string
  limit?: number | string
  maxLimit?: number // Maximum allowed limit (default: 100)
  minLimit?: number // Minimum allowed limit (default: 1)
}) {
  const { page = 1, limit = 10, maxLimit = 100, minLimit = 1 } = params

  // Parse and validate page
  const pageNum =
    typeof page === "string" ? Math.max(1, parseInt(page, 10) || 1) : Math.max(1, page || 1)

  // Parse and validate limit
  const limitNum = typeof limit === "string" ? parseInt(limit, 10) || 10 : limit || 10

  // Apply min/max constraints
  const finalLimit = Math.max(minLimit, Math.min(maxLimit, limitNum))

  // Calculate skip
  const skip = (pageNum - 1) * finalLimit

  return {
    pageNum,
    skip,
    take: finalLimit,
  }
}

export { calculatePagination }
