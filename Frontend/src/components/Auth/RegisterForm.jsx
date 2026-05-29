import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * RegisterForm
 *
 * Props:
 *   onSwitchToLogin {function} — called when "Đăng nhập!" is clicked
 */
function RegisterForm({ onSwitchToLogin }) {
  const [email,    setEmail   ] = useState('')
  const [lastName, setLastName] = useState('')
  const [firstName,setFirstName]= useState('')
  const [password, setPassword ] = useState('')
  const [showPass, setShowPass ] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Auth logic placeholder
  }

  return (
    <form className="auth-dialog-body" onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <input
        id="register-email"
        className="auth-input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      {/* Last name */}
      <input
        id="register-lastname"
        className="auth-input"
        type="text"
        placeholder="Họ"
        value={lastName}
        onChange={e => setLastName(e.target.value)}
        autoComplete="family-name"
        required
      />

      {/* First name */}
      <input
        id="register-firstname"
        className="auth-input"
        type="text"
        placeholder="Tên"
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
        autoComplete="given-name"
        required
      />

      {/* Password */}
      <div className="auth-input-wrap">
        <input
          id="register-password"
          className="auth-input"
          type={showPass ? 'text' : 'password'}
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          className="auth-eye-btn"
          onClick={() => setShowPass(p => !p)}
          aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          id="register-toggle-pass"
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Submit */}
      <button type="submit" className="auth-btn-primary" id="register-submit-btn">
        Tạo tài khoản
      </button>

      {/* OR divider */}
      <div className="auth-or">hoặc đăng ký bằng</div>

      {/* Google */}
      <button type="button" className="auth-btn-google" id="register-google-btn">
        <span className="auth-btn-google-icon">G+</span>
        Google
      </button>

      {/* Switch to login */}
      <p className="auth-footer">
        Bạn đã có tài khoản?{' '}
        <button
          type="button"
          className="auth-footer-link"
          onClick={onSwitchToLogin}
          id="register-switch-login"
        >
          Đăng nhập!
        </button>
      </p>
    </form>
  )
}

export default RegisterForm
