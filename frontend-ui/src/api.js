const API_BASE_URL = 'https://job-application-tracker-api-7997.onrender.com'

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (response.status === 401) {
    localStorage.removeItem('access_token')
    window.location.reload()
    throw new Error('Your session has expired. Please sign in again.')
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : typeof detail === 'string'
        ? detail
        : 'Something went wrong. Please try again.'

    throw new Error(message)
  }

  return data
}