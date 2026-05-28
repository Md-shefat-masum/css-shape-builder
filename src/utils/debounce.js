export function debounce(callback, wait = 500) {
  let timeoutId = null

  return function debouncedCallback(...args) {
    globalThis.clearTimeout(timeoutId)
    timeoutId = globalThis.setTimeout(() => callback.apply(this, args), wait)
  }
}
