export type ApiResponse<T> = {
  meta?: {
    method: string
    operation: string
  }
  data: T
  errors?: any[]
}
