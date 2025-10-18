// API composable for making HTTP requests
export const useApi = () => {
  const config = useRuntimeConfig()
  
  const api = $fetch.create({
    baseURL: config.public.apiBase,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return {
    api,
    get: (url: string, options?: any) => api(url, { method: 'GET', ...options }),
    post: (url: string, body?: any, options?: any) => api(url, { method: 'POST', body, ...options }),
    put: (url: string, body?: any, options?: any) => api(url, { method: 'PUT', body, ...options }),
    delete: (url: string, options?: any) => api(url, { method: 'DELETE', ...options }),
  }
}
