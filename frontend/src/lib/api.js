

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

let refreshPromise = null

const refreshAccessToken = async () => {
  if(refreshPromise) return refreshPromise

  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
  .then(res => res.ok)
  .catch(() => false)
  .finally(() => refreshPromise = null)

  return refreshPromise
}

const api = async (path, options = {}) => {
  const { skipAuthRetry, ...fetchOptions } = options

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    credentials: "include",
  })

  if(res.status === 401 && !skipAuthRetry && !path.startsWith("/auth/")) {
    const refreshed = await refreshAccessToken()

    if(refreshed) {
      return api(path, { ...options, skipAuthRetry: true })
    }

    window.dispatchEvent(new Event("auth:expired"))
  }

  if (!res.ok) {
    const problem = await res.json().catch(() => null)
    const err = new Error(problem?.errors?.[0] ?? `API error: ${res.status}`)
    err.errors = problem?.errors ?? []
    err.status = res.status
    throw err
  }

  return res.json()
}

export default api