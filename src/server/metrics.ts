const startTime = Date.now()

interface EndpointStats {
  requests: number
  errors: number
  totalDurationMs: number
}

const endpoints: Record<string, EndpointStats> = {}

function getOrCreate(route: string): EndpointStats {
  if (!endpoints[route]) {
    endpoints[route] = { requests: 0, errors: 0, totalDurationMs: 0 }
  }
  return endpoints[route]
}

export const metrics = {
  record(route: string, durationMs: number, isError: boolean): void {
    const s = getOrCreate(route)
    s.requests++
    s.totalDurationMs += durationMs
    if (isError) s.errors++
  },

  summary() {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000)
    const summary: Record<string, {
      requests: number
      errors: number
      errorRate: string
      avgDurationMs: number
    }> = {}

    for (const [route, s] of Object.entries(endpoints)) {
      summary[route] = {
        requests: s.requests,
        errors: s.errors,
        errorRate: s.requests > 0 ? `${((s.errors / s.requests) * 100).toFixed(1)}%` : '0%',
        avgDurationMs: s.requests > 0 ? Math.round(s.totalDurationMs / s.requests) : 0,
      }
    }

    return { uptimeSeconds, endpoints: summary }
  },
}
