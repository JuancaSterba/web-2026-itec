// lib/api-client.ts
// Unico punto de entrada al backend: SIEMPRE via el API Gateway (8080),
// nunca directo a Core (8081/8082) ni a los microservicios (8083/8084).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface ApiResponse<T> {
  meta: {
    method: string
    operation: string
  }
  data: T
  errors?: Record<string, string[]> | any[]
}

type RequestOptions = RequestInit & {
  /** El login tambien devuelve 401 con credenciales invalidas: no es una
   * sesion expirada, asi que no debe limpiar storage ni redirigir. */
  skipAuthRedirect?: boolean
}

function extractErrorMessage(data: any, status: number): string {
  const firstError = Array.isArray(data?.errors) ? data.errors[0] : undefined
  return (
    firstError?.description ||
    data?.meta?.operation ||
    data?.message ||
    `Error ${status} en la petición`
  )
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Logica compartida de fetch: header Bearer, manejo de 401, extraccion de
  // error. Devuelve el body ya parseado, sin asumir ninguna forma particular
  // -- eso lo decide quien la llama (request() para el wrapper {meta,data,
  // errors} del Core, requestRaw() para microservicios que devuelven el
  // recurso directo, como ms-asistencias/ms-notas).
  private async execute(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const { skipAuthRedirect, ...fetchOptions } = options
    const url = `${this.baseURL}${endpoint}`

    // 👈 el JWT lo guardás en localStorage como "token"
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(fetchOptions.headers || {}),
      },
    }

    try {
      const response = await fetch(url, config)
      const data = response.status === 204 ? null : await response.json().catch(() => ({}))

      // Sesión inválida/expirada → limpiamos y mandamos a /login.
      // No aplica al propio intento de login (credenciales invalidas = 401 tambien).
      if (response.status === 401 && !skipAuthRedirect) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
          document.cookie = "auth-token=; Path=/; Max-Age=0; SameSite=Lax"
          window.location.href = "/login"
        }
        throw new Error("Sesión expirada")
      }

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, response.status))
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return (await this.execute(endpoint, options)) as ApiResponse<T>
  }

  private async requestRaw<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return (await this.execute(endpoint, options)) as T
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { method: "GET", ...options })
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  put<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { method: "DELETE", ...options })
  }

  // Variantes "raw": para microservicios que devuelven el recurso directo en
  // el body, sin envolverlo en {meta,data,errors} (ms-asistencias, ms-notas).
  getRaw<T>(endpoint: string, options?: RequestOptions) {
    return this.requestRaw<T>(endpoint, { method: "GET", ...options })
  }

  postRaw<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.requestRaw<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  putRaw<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.requestRaw<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  deleteRaw<T>(endpoint: string, options?: RequestOptions) {
    return this.requestRaw<T>(endpoint, { method: "DELETE", ...options })
  }
}

const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
