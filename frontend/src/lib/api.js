import { toast } from "sonner"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const SAFE_METHODS = new Set(["GET", "HEAD"])

let refreshPromise = null
let csrfTokenPromise = null

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

// Fetches (and caches) the CSRF request-token issued by /auth/csrf-token.
// The matching secret half is stored in the non-httpOnly XSRF-TOKEN cookie,
// which the browser attaches automatically via credentials: "include".
const getCsrfToken = async () => {
  if (csrfTokenPromise) return csrfTokenPromise

  csrfTokenPromise = fetch(`${BASE_URL}/auth/csrf-token`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => data?.csrfToken ?? null)
    .catch(() => null)

  return csrfTokenPromise
}

const invalidateCsrfToken = () => {
  csrfTokenPromise = null
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
  const { skipAuthRetry, skipCsrfRetry, silent, ...fetchOptions } = options

  const method = (fetchOptions.method || "GET").toUpperCase()
  const needsCsrf = !SAFE_METHODS.has(method)

  if (needsCsrf) {
    const csrfToken = await getCsrfToken()

    if (csrfToken) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        "X-CSRF-TOKEN": csrfToken,
      }
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    credentials: "include",
  })

  if (res.status === 403 && needsCsrf && !skipCsrfRetry) {
    const problem = await safeJson(res.clone())

    if (problem?.code === "CSRF_TOKEN_INVALID") {
      invalidateCsrfToken()
      return api(path, { ...options, skipCsrfRetry: true })
    }
  }

  let sessionExpired = false

  if (res.status === 401 && !skipAuthRetry && !path.startsWith("/auth/")) {
    const refreshed = await refreshAccessToken()

    if (refreshed) {
      return api(path, { ...options, skipAuthRetry: true })
    }

    sessionExpired = true

    if (!silent) toast.error("Din session har gått ut. Logga in igen.")

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

    if (!silent && !sessionExpired) toast.error(err.message)

    throw err
  }

  if (res.status === 204) return null

  const data = await safeJson(res)

  if (!silent && typeof data?.message === "string") {
    toast.success(data.message)
  }

  return data
}

export default api
