// Global type definitions

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
