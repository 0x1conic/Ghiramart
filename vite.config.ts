import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  const railwayApi = 'https://grihamart-api-production.up.railway.app'
  let apiOrigin = ''
  try {
    const url = new URL(env.VITE_API_BASE_URL)
    if (['http:', 'https:'].includes(url.protocol)) apiOrigin = url.origin
  } catch { /* Relative API URLs are covered by self. */ }
  const csp = [
    "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: http: data:", "font-src 'self'", `connect-src 'self' ${apiOrigin}`.trim(),
    "object-src 'none'", "base-uri 'self'", "form-action 'self'",
  ].join('; ')
  const headers = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY' }
  return {
    plugins: [react(), tailwindcss(), {
      name: 'production-content-security-policy', apply: 'build',
      transformIndexHtml() { return [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' }] },
    }],
    server: {
      headers,
      allowedHosts: true,
      proxy: { '/api': { target: railwayApi, changeOrigin: true, rewrite: path => path.replace(/^\/api/, '') } },
    },
    preview: { headers: { ...headers, 'Content-Security-Policy': csp + "; frame-ancestors 'none'" }, proxy: { '/api': { target: railwayApi, changeOrigin: true, rewrite: path => path.replace(/^\/api/, '') } } },
  }
})
