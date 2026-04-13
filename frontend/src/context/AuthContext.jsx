import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('vaultify_token'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vaultify_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback((authResponse) => {
    localStorage.setItem('vaultify_token', authResponse.token)
    localStorage.setItem('vaultify_user', JSON.stringify({
      username: authResponse.username,
      roles: authResponse.roles,
    }))
    setToken(authResponse.token)
    setUser({ username: authResponse.username, roles: authResponse.roles })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('vaultify_token')
    localStorage.removeItem('vaultify_user')
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback((role) => {
    if (!user?.roles) return false
    return user.roles.includes(`ROLE_${role}`) || user.roles.includes(role)
  }, [user])

  const isAdmin = hasRole('ADMIN')
  const isManager = hasRole('MANAGER') || isAdmin
  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, user, login, logout, hasRole, isAdmin, isManager, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
