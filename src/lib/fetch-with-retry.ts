export async function fetchWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  retries = 3,
  baseDelay = 1000,
  signal?: AbortSignal,
): Promise<{ data: T | null; error: any }> {
  for (let i = 0; i < retries; i++) {
    if (signal?.aborted) {
      return {
        data: null,
        error: { name: 'AbortError', message: 'signal is aborted without reason' },
      }
    }

    try {
      const result = await queryFn()

      if (result.error) {
        const msg = result.error.message || ''
        const code = result.error.code || ''

        if (
          result.error.name === 'AbortError' ||
          signal?.aborted ||
          msg.includes('Aborted') ||
          msg.includes('aborted without reason') ||
          code === '20'
        ) {
          return {
            data: null,
            error: { name: 'AbortError', message: 'signal is aborted without reason' },
          }
        }

        if (
          msg.includes('Failed to fetch') ||
          msg.includes('HTTP N/A') ||
          msg.includes('Load failed') ||
          code === '503'
        ) {
          if (i < retries - 1) {
            await new Promise((res) => setTimeout(res, baseDelay * (i + 1)))
            continue
          }
        }
      }

      return result
    } catch (err: any) {
      const msg = err?.message || ''
      if (
        signal?.aborted ||
        err?.name === 'AbortError' ||
        msg.includes('Aborted') ||
        msg.includes('aborted without reason')
      ) {
        return {
          data: null,
          error: { name: 'AbortError', message: 'signal is aborted without reason' },
        }
      }

      if (
        msg.includes('Failed to fetch') ||
        msg.includes('HTTP N/A') ||
        msg.includes('Load failed') ||
        err?.name === 'TypeError'
      ) {
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, baseDelay * (i + 1)))
          continue
        }
      }

      // Instead of throwing an unhandled rejection, return the error
      // so the caller can handle it cleanly.
      return { data: null, error: err }
    }
  }
  return { data: null, error: new Error('Max retries reached') }
}
