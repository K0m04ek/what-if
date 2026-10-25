export async function withRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i >= retries) throw e;
      await new Promise((r) => setTimeout(r, 2 ** i * 500));
    }
  }
}
