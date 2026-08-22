export function wait(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}
