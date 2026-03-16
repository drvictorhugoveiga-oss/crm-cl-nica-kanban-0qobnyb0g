export async function fetchWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  retries = 3,
  baseDelay = 1000,
  signal?: AbortSignal,
): Promise<{ data: T | null; error: any }> {
  for (let i = 0; i < retries; i++) {
    if (signal?.aborted) {
      return { data: null, error: new Error('Aborted') }
    }

    try {
      const result = await queryFn()

      if (result.error) {
        const msg = result.error.message || ''
        const code = result.error.code || ''

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
      if (signal?.aborted) {
        return { data: null, error: new Error('Aborted') }
      }
      const msg = err.message || ''
      if (
        msg.includes('Failed to fetch') ||
        msg.includes('HTTP N/A') ||
        msg.includes('Load failed') ||
        err.name === 'TypeError'
      ) {
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, baseDelay * (i + 1)))
          continue
        }
      }
      throw err
    }
  }
  return { data: null, error: new Error('Max retries reached') }
}
