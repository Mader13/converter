export async function runWithConcurrencyLimit<T>(
  items: T[],
  concurrency: number,
  runner: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items]
  const workerCount = Math.max(1, Math.min(concurrency, queue.length))

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (queue.length > 0) {
        const item = queue.shift()

        if (!item) {
          return
        }

        await runner(item)
      }
    }),
  )
}
