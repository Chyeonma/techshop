import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

// ─── Sample accounts ──────────────────────────────────────────────────────────
const SAMPLE_ACCOUNTS = [
  {
    email:     'nguyen.van.quyen.p3t@gmail.com',
    password:  '123',
    lastName:  'Nguyễn',
    firstName: 'Quyến',
    fullName:  'Nguyễn Quyến',
    phone:     '',
    gender:    'nam',
    dob:       { day: '', month: '', year: '' },
  },
]

// ─── AuthProvider ─────────────────────────────────────────────────────────────
/**
 * Provides:
 *   isOpen      {boolean}
 *   mode        {'login' | 'register'}
 *   user        {object | null}
 *   openLogin()
 *   openRegister()
 *   close()
 *   login(email, password) → { ok, error }
 *   logout()
 *   updateUser(fields)
 */
export function AuthProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode,   setMode  ] = useState('login')
  const [user,   setUser  ] = useState(null)

  const openLogin    = useCallback(() => { setMode('login');    setIsOpen(true)  }, [])
  const openRegister = useCallback(() => { setMode('register'); setIsOpen(true)  }, [])
  const close        = useCallback(() => setIsOpen(false), [])

  const login = useCallback((email, password) => {
    const found = SAMPLE_ACCOUNTS.find(
      a => a.email === email.trim() && a.password === password
    )
    if (found) {
      setUser({ ...found })
      return { ok: true }
    }
    return { ok: false, error: 'Email hoặc mật khẩu không đúng.' }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const updateUser = useCallback((fields) => {
    setUser(prev => prev ? { ...prev, ...fields } : prev)
  }, [])

  return (
    <AuthContext.Provider value={{
      isOpen, mode, user,
      openLogin, openRegister, close,
      login, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
