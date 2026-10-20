import { apiClient, unwrapApiResponse } from './api'
import type { components } from '../api/schema'

const TOKEN_KEY = 'alves-crm-token'
const USER_KEY = 'alves-crm-user'
const LEGACY_TOKEN_KEY = 'nexo-token'
const LEGACY_USER_KEY = 'nexo-user'
type User = components['schemas']['UserResponse']

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const user = value as Record<string, unknown>
  return typeof user.id === 'number'
    && typeof user.email === 'string'
    && typeof user.displayName === 'string'
}

function migrateStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY)
  const user = localStorage.getItem(USER_KEY) ?? localStorage.getItem(LEGACY_USER_KEY)
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, user)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  localStorage.removeItem(LEGACY_USER_KEY)
}

export const authService = {
  async login(email: string, password: string) {
    const session = await unwrapApiResponse(apiClient.POST('/api/auth/login', {
      body: { email, password },
    }))
    localStorage.setItem(TOKEN_KEY, session.token)
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
    return session.user
  },
  me() {
    return unwrapApiResponse(apiClient.GET('/api/auth/me'))
  },
  currentUser(): User | null {
    migrateStoredSession()
    const token = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)
    if (!token || !storedUser) return null
    try {
      const user: unknown = JSON.parse(storedUser)
      if (isUser(user)) return user
      this.logout()
      return null
    } catch {
      this.logout()
      return null
    }
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
  },
}
