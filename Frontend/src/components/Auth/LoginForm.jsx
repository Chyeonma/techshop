import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/client'

/**
 * LoginForm
 *
 * Props:
 *   onSwitchToRegister {function}
 */
function LoginForm({ onSwitchToRegister }) {
  const { login, googleLogin, close } = useAuth()
  const [email,    setEmail   ] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError   ] = useState('')
  const [loading,  setLoading ] = useState(false)

  const [isForgotMode, setIsForgotMode] = useState(false)
  const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const normalizedEmail = email.trim()
    if (!normalizedEmail || !password) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }

    setLoading(true)
    const result = await login(normalizedEmail, password)
    setLoading(false)
    if (result.ok) {
      close()
    } else {
      setError(result.error)
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotMessage({ type: '', text: '' })
    if (!email.trim()) {
      setForgotMessage({ type: 'error', text: 'Vui lòng nhập email.' })
      return
    }
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(email.trim())
      setForgotMessage({ type: 'success', text: res.message || 'Mật khẩu mới đã được gửi.' })
    } catch (err) {
      setForgotMessage({ type: 'error', text: err.message || 'Gửi yêu cầu thất bại.' })
    } finally {
      setLoading(false)
    }
  }

  if (isForgotMode) {
    return (
      <form className="auth-dialog-body" onSubmit={handleForgotSubmit} noValidate>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
          Vui lòng nhập email của bạn. Nếu email tồn tại trong hệ thống, chúng tôi sẽ gửi một mật khẩu mới cho bạn.
        </p>
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => { setEmail(e.target.value); setForgotMessage({ type: '', text: '' }) }}
          required
        />
        {forgotMessage.text && (
          <p style={{ color: forgotMessage.type === 'error' ? '#e31837' : '#16a34a', fontSize: '13px', margin: '-4px 0 8px 0' }}>
            {forgotMessage.text}
          </p>
        )}
        <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'Đang gửi...' : 'Gửi mật khẩu mới'}
        </button>
        <button
          type="button"
          className="auth-footer-link"
          style={{ alignSelf: 'center', marginTop: '16px', fontSize: '14px' }}
          onClick={() => { setIsForgotMode(false); setForgotMessage({ type: '', text: '' }); setError(''); }}
        >
          Quay lại Đăng nhập
        </button>
      </form>
    )
  }

  return (
    <form className="auth-dialog-body" onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <input
        id="login-email"
        className="auth-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError('') }}
        autoComplete="email"
        required
      />

      {/* Password */}
      <div className="auth-input-wrap">
        <input
          id="login-password"
          className="auth-input"
          type={showPass ? 'text' : 'password'}
          placeholder="Mật khẩu"
          value={password}
          onChange={e => { setPassword(e.target.value); setError('') }}
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          className="auth-eye-btn"
          onClick={() => setShowPass(p => !p)}
          aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          id="login-toggle-pass"
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p style={{ color: '#e31837', fontSize: '13px', margin: '-4px 0' }}>
          {error}
        </p>
      )}

      {/* Forgot Password Link */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: error ? '4px' : '-4px', marginBottom: '8px' }}>
        <button 
          type="button" 
          className="auth-footer-link" 
          style={{ fontSize: '13px', fontStyle: 'italic' }}
          onClick={() => { setIsForgotMode(true); setError(''); }}
        >
          Quên mật khẩu?
        </button>
      </div>

      {/* Submit */}
      <button type="submit" className="auth-btn-primary" id="login-submit-btn" disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      {/* OR divider */}
      <div className="auth-or">hoặc đăng nhập bằng</div>

      {/* Google */}
      <GoogleLogin
        onSuccess={async credentialResponse => {
          const result = await googleLogin(credentialResponse.credential)
          if (!result.ok) setError(result.error)
          else close()
        }}
        onError={() => setError('Đăng nhập Google thất bại.')}
        shape="rectangular"
        width="100%"
      />

      {/* Switch to register */}
      <p className="auth-footer">
        Bạn chưa có tài khoản?{' '}
        <button
          type="button"
          className="auth-footer-link"
          onClick={onSwitchToRegister}
          id="login-switch-register"
        >
          Đăng ký ngay!
        </button>
      </p>
    </form>
  )
}

export default LoginForm
