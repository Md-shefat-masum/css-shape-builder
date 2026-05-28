export function toCssSafeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function createSafeCssName(value, fallback = 'clipframe') {
  const safeName = toCssSafeName(value)

  if (!safeName) return fallback
  if (/^[a-z_]/.test(safeName)) return safeName

  return `${fallback}_${safeName}`
}

export function ensureCssIdentifier(value, fallback = 'clipframe_layer') {
  return createSafeCssName(value, fallback)
}
