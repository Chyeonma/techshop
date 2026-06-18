import { useState } from 'react'
import { authApi } from '../../api/client'
import './AccountPassword.css'

function AccountPassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu mới không khớp!')
      return
    }

    if (newPassword === currentPassword) {
      setMessage('Mật khẩu mới không được giống mật khẩu hiện tại!')
      return
    }

    if (newPassword.length < 6) {
      setMessage('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }

    try {
      setLoading(true)
      const res = await authApi.changePassword(currentPassword, newPassword)
      window.alert(res.message || 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
      
      // Auto logout using the global auth event
      window.dispatchEvent(new CustomEvent('techshop-auth-changed', { detail: { type: 'logout' } }))
    } catch (error) {
      setMessage(error.message || 'Đổi mật khẩu thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="account-content">
      <h2 className="account-content-title">Đổi mật khẩu</h2>
      <p className="account-password-desc">
        Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi. Sau khi thay đổi thành công, bạn sẽ được yêu cầu đăng nhập lại.
      </p>

      {message && <div className="account-password-error" style={{color: 'red', marginBottom: '1rem'}}>{message}</div>}

      <form className="account-password-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu hiện tại"
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu mới"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>

        <button 
          type="submit" 
          className="account-info-save"
          disabled={loading}
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  )
}

export default AccountPassword
