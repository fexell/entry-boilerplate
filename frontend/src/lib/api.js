import { toast } from "sonner"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Must match Entry.Auth.Configuration.CsrfConstants.HeaderName on the backend.
const CSRF_HEADER_NAME = "X-CSRF-TOKEN"

const SAFE_METHODS = new Set(["GET", "HEAD"])

let refreshPromise = null
let csrfTokenPromise = null

// Parses a Response body, returning both the parsed JSON (if valid)
// and the raw text, so callers can fall back to raw text on non-JSON bodies.
const parseBody = async (res) => {
  const text = await res.text().catch(() => "")

  if (!text) return { data: null, rawText: "" }

  try {
    return { data: JSON.parse(text), rawText: text }
  } catch (err) {
    return { data: null, rawText: text }
  }
}

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
//
// IMPORTANT: only successful lookups are cached. A failed fetch must NOT
// poison csrfTokenPromise, otherwise every request after a single transient
// failure silently goes out without the header until a 403 happens to
// trigger invalidateCsrfToken() - which is exactly what was masking the
// real error before.
const getCsrfToken = async () => {
  if (csrfTokenPromise) return csrfTokenPromise

  csrfTokenPromise = (async () => {
    let res
    try {
      res = await fetch(`${BASE_URL}/auth/csrf-token`, {
        method: "GET",
        credentials: "include",
      })
    } catch (err) {
      csrfTokenPromise = null // don't cache network failures
      throw new Error(`Could not reach /auth/csrf-token: ${err.message}`)
    }

    if (!res.ok) {
      csrfTokenPromise = null // don't cache HTTP failures either
      throw new Error(`/auth/csrf-token responded with ${res.status}`)
    }

    const data = await res.json().catch(() => null)
    const token = data?.csrfToken ?? null

    if (!token) {
      csrfTokenPromise = null
      throw new Error("/auth/csrf-token responded without a csrfToken field")
    }

    return token
  })()

  return csrfTokenPromise
}

const invalidateCsrfToken = () => {
  csrfTokenPromise = null
}

const api = async (path, options = {}) => {
  const { skipAuthRetry, skipCsrfRetry, silent, ...fetchOptions } = options

  const method = (fetchOptions.method || "GET").toUpperCase()
  const needsCsrf = !SAFE_METHODS.has(method)

  if (needsCsrf) {
    try {
      const csrfToken = await getCsrfToken()

      fetchOptions.headers = {
        ...fetchOptions.headers,
        [CSRF_HEADER_NAME]: csrfToken,
      }
    } catch (err) {
      // Surface the REAL reason instead of letting the request go out
      // header-less and produce a confusing "Invalid or missing CSRF
      // token" 403 further down.
      console.error("CSRF token fetch failed:", err)

      const csrfErr = new Error(
        "Could not fetch a CSRF token. Check your connection and try again."
      )
      csrfErr.cause = err

      if (!silent) toast.error(csrfErr.message)

      throw csrfErr
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    credentials: "include",
  })

  if (res.status === 403 && needsCsrf && !skipCsrfRetry) {
    const problem = await parseBody(res.clone())

    if (problem?.data?.code === "CSRF_TOKEN_INVALID") {
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
    const { data: problem, rawText } = await parseBody(res)

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

    // 4. Non-JSON body, ex. text/plain från en exception-handler
    else if (rawText) {
      backendErrors = [rawText.slice(0, 300)]
    }

    // 5. Fallback
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

  const { data } = await parseBody(res)

  if (!silent && typeof data?.message === "string") {
    toast.success(data.message)
  }

  return data
}

export default api
