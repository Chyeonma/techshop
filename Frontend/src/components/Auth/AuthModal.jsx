import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import './AuthModal.css'

/**
 * AuthModal — renders a backdrop + dialog that shows either
 * LoginForm or RegisterForm based on AuthContext.mode.
 * Closes on backdrop click or Escape key.
 */
function AuthModal() {
  const { isOpen, mode, openLogin, openRegister, close } = useAuth()

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') close()
  }, [close])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const isLogin = mode === 'login'
  const title   = isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'

  return (
    <div
      className="auth-backdrop"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Stop clicks inside the dialog from closing it */}
      <div className="auth-dialog" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="auth-dialog-header">
          <h2 className="auth-dialog-title">{title}</h2>
          <button
            className="auth-dialog-close"
            onClick={close}
            aria-label="Đóng"
            id="auth-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="auth-dialog-divider" />

        {/* Form — switches between login and register */}
        {isLogin ? (
          <LoginForm onSwitchToRegister={openRegister} />
        ) : (
          <RegisterForm onSwitchToLogin={openLogin} />
        )}
      </div>
    </div>
  )
}

export default AuthModal
