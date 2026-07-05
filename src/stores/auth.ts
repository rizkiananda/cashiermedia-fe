import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import type { User } from '@/types'

// Store autentikasi: menyimpan token + profil user, dipersist di localStorage.
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  )

  const isAuthenticated = computed(() => !!token.value)

  function persist() {
    if (token.value) localStorage.setItem('token', token.value)
    else localStorage.removeItem('token')
    if (user.value) localStorage.setItem('user', JSON.stringify(user.value))
    else localStorage.removeItem('user')
  }

  async function login(username: string, password: string) {
    const res = await authApi.login(username, password)
    token.value = res.token
    user.value = res.user
    persist()
  }

  async function fetchMe() {
    user.value = await authApi.me()
    persist()
  }

  function logout() {
    authApi.logout().catch(() => {})
    token.value = null
    user.value = null
    persist()
  }

  return { token, user, isAuthenticated, login, fetchMe, logout }
})
