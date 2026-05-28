export function deepClone(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      // Pinia/Vue reactive proxies are not structured-cloneable.
    }
  }

  return JSON.parse(JSON.stringify(value))
}
