const DEFAULT_BASE_URL = '/api'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function toQueryString(params) {
  const query = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    query.set(key, String(value))
  })
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

async function request(path, options = {}) {
  const { params, headers, ...restOptions } = options
  const url = `${API_BASE_URL}${path}${toQueryString(params)}`

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  const raw = await response.text()
  const payload = raw ? safeJsonParse(raw) : null

  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.message ||
      `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, payload)
  }

  return {
    payload,
    headers: response.headers,
  }
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return { detail: raw }
  }
}

export async function runPipeline(requestPayload) {
  const { payload, headers } = await request('/pipeline/run', {
    method: 'POST',
    body: JSON.stringify(requestPayload),
  })

  return {
    runId: headers.get('X-Run-Id'),
    result: payload,
  }
}

export async function getPipelineStatus(runId) {
  const { payload } = await request(`/pipeline/status/${runId}`)
  return payload
}

export async function previewLogistics(requestPayload) {
  const { payload } = await request('/agents/logistics/preview', {
    method: 'POST',
    body: JSON.stringify(requestPayload),
  })
  return payload
}

export async function runPackaging(requestPayload) {
  const { payload } = await request('/agents/packaging', {
    method: 'POST',
    body: JSON.stringify(requestPayload),
  })
  return payload
}

export async function getAuditLogs(params = {}) {
  const { payload } = await request('/audit/logs', { params })
  return Array.isArray(payload) ? payload : []
}

export async function runReroute(requestPayload) {
  const { payload } = await request('/agents/reroute', {
    method: 'POST',
    body: JSON.stringify(requestPayload),
  })
  return payload
}
