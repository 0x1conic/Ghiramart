/** User text stays plain React text. URLs require a separate protocol/path policy. */
export function isSafeImageUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  // Admin uploads are resized before storage. Only inert raster data URLs are accepted.
  if (/^data:image\/(?:png|jpe?g|webp);base64,[a-zA-Z0-9+/=]+$/.test(value)) return value.length <= 1_200_000
  if (value.length > 2048 || /[\u0000-\u0020\u007f\\]/.test(value)) return false
  if (/^\/assets\/[a-zA-Z0-9/_\.\-]+$/.test(value)) return !value.split('/').includes('..')
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password }
  catch { return false }
}
export function safeImageUrl(value: unknown) { return isSafeImageUrl(value) ? value : '/assets/brand/griha-mart-logo.png' }
export function safeRoutePart(value: unknown): value is string { return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,160}$/.test(value) }
