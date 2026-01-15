import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }){
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('eb_token')
    const u = localStorage.getItem('eb_email')
    if (t) setToken(t)
    if (u) setUser({ email: u })
  }, [])

  const login = (t, u) => {
    setToken(t)
    setUser(u)
    localStorage.setItem('eb_token', t)
    if (u?.email) localStorage.setItem('eb_email', u.email)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('eb_token')
    localStorage.removeItem('eb_email')
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth(){
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
