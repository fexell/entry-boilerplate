const BASE_URL = process.env.NEXT_PUBLIC_API_URL

let refreshPromise = null

const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise

  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => (refreshPromise = null))

  return refreshPromise
}

// Safely parses a Response body as JSON, returning null instead of throwing
// if the body is empty, truncated, or not valid JSON.
const safeJson = async (res) => {
  const text = await res.text().catch(() => "")

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch (err) {
    console.error("Failed to parse JSON response:", text)
    return null
  }
}

const api = async (path, options = {}) => {
  const { skipAuthRetry, ...fetchOptions } = options

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    credentials: "include",
  })

  if (res.status === 401 && !skipAuthRetry && !path.startsWith("/auth/")) {
    const refreshed = await refreshAccessToken()

    if (refreshed) {
      return api(path, { ...options, skipAuthRetry: true })
    }

    window.dispatchEvent(new Event("auth:expired"))
  }

  if (!res.ok) {
    const problem = await safeJson(res)

    let backendErrors = []

    // 1. Dina egna fel: { errors: [...] }
    if (Array.isArray(problem?.errors)) {
      backendErrors = problem.errors
    }

    // 2. ModelState-fel: { Field: ["msg"] }
    else if (problem?.errors && typeof problem.errors === "object") {
      backendErrors = Object.values(problem.errors).flat()
    }

    // 3. Identity message: { message: "..." }
    else if (problem?.message) {
      backendErrors = [problem.message]
    }

    // 4. Fallback
    else {
      backendErrors = [`API error: ${res.status}`]
    }

    const err = new Error(backendErrors[0])
    err.errors = backendErrors
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null

  return safeJson(res)
}

export default api
