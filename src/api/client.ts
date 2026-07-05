import axios from 'axios'

// Instance axios terpusat. Base URL memakai /api yang di-proxy Vite ke backend Go.
const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Sisipkan token JWT dari localStorage pada setiap request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Tangani 401 secara global: token invalid -> paksa login ulang.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token')
      if (location.pathname !== '/login') {
        location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

// Ekstrak pesan error yang ramah dari respons backend.
export function errorMessage(err: unknown, fallback = 'Terjadi kesalahan'): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message || fallback
  }
  return fallback
}

export default client
