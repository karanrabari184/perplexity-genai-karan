/** Empty string in production = same host as the UI (single Render service). */
export function getApiBaseUrl() {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/$/, "")
    }
    if (import.meta.env.PROD) {
        return ""
    }
    return "http://localhost:3000"
}

export function getSocketUrl() {
    const base = getApiBaseUrl()
    if (base) return base
    if (typeof window !== "undefined") {
        return window.location.origin
    }
    return "http://localhost:3000"
}
