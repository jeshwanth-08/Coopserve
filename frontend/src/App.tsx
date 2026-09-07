import { useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AUTH_TOKEN_KEY } from './lib/api'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import type { AuthUser } from './types/api'

const AUTH_USER_KEY = 'coopserve-auth-user'

export function App() {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
    return storedToken && localStorage.getItem(AUTH_USER_KEY) ? storedToken : null
  })
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY)
    if (!storedUser) return null
    try { return JSON.parse(storedUser) as AuthUser } catch { return null }
  })

  function handleLogin(nextToken: string, nextUser: AuthUser) {
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="*" element={token ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
