export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  onRetry?: (attempt: number, error: any) => void
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt);

      onRetry?.(attempt + 1, error);

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
