// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

export interface ApiResponse<T> {
  meta: {
    method: string
    operation: string
  }
  data: T
  errors?: Record<string, string[]> | any[]
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    // 👈 el JWT lo guardás en localStorage como "token"
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
    }

    try {
      const response = await fetch(url, config)

      // Sesión inválida/expirada → limpiamos y mandamos a /login
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
          // borrar la cookie del lado del cliente también, por las dudas
          document.cookie = "auth-token=; Path=/; Max-Age=0; SameSite=Lax"
          window.location.href = "/login"
        }
        throw new Error("Token expirado")
      }

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const msg =
          (data as any)?.meta?.operation ||
          (data as any)?.message ||
          `Error ${response.status} en la petición`
        throw new Error(msg)
      }

      return data as ApiResponse<T>
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: "GET", ...options })
  }

  post<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  put<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: "DELETE", ...options })
  }
}

const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
