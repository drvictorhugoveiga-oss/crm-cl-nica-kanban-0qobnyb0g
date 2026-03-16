export async function fetchWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  retries = 3,
  baseDelay = 1000,
  signal?: AbortSignal,
): Promise<{ data: T | null; error: any }> {
  for (let i = 0; i < retries; i++) {
    if (signal?.aborted) {
      return { data: null, error: { name: 'AbortError', message: 'Aborted' } }
    }

    try {
      const result = await queryFn()

      if (signal?.aborted) {
        return { data: null, error: { name: 'AbortError', message: 'Aborted' } }
      }

      if (result.error) {
        const msg = result.error.message?.toLowerCase() || ''
        const code = result.error.code || ''
        const name = result.error.name || ''

        if (
          name === 'AbortError' ||
          msg.includes('abort') ||
          msg.includes('http n/a') ||
          code === '20'
        ) {
          return { data: null, error: { name: 'AbortError', message: 'Aborted' } }
        }

        if (msg.includes('failed to fetch') || msg.includes('load failed') || code === '503') {
          if (i < retries - 1) {
            await new Promise((res) => setTimeout(res, baseDelay * (i + 1)))
            continue
          }
        }
      }

      return result
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || ''
      const name = err?.name || ''

      if (
        signal?.aborted ||
        name === 'AbortError' ||
        msg.includes('abort') ||
        msg.includes('http n/a')
      ) {
        return { data: null, error: { name: 'AbortError', message: 'Aborted' } }
      }

      if (msg.includes('failed to fetch') || msg.includes('load failed') || name === 'TypeError') {
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, baseDelay * (i + 1)))
          continue
        }
      }

      return { data: null, error: err }
    }
  }
  return { data: null, error: new Error('Max retries reached') }
}
