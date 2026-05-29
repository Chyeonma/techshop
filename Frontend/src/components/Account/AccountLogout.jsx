import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AccountContent.css'

/**
 * AccountLogout — Đăng xuất confirmation tab
 */
function AccountLogout() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleConfirm = () => {
    logout()
    navigate('/', { replace: true })
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className="account-content">
      <h2 className="account-content-title">Đăng xuất</h2>

      <div className="account-logout-content">
        {/* Question mark icon */}
        <div className="account-logout-icon" aria-hidden="true">?</div>

        <p className="account-logout-text">Bạn muốn thoát tài khoản</p>

        <div className="account-logout-actions">
          <button
            className="account-logout-cancel"
            onClick={handleCancel}
            id="logout-cancel-btn"
          >
            Không
          </button>
          <button
            className="account-logout-confirm"
            onClick={handleConfirm}
            id="logout-confirm-btn"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountLogout
