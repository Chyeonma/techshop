import { User, ShoppingBag, LogOut } from 'lucide-react'
import './AccountSidebar.css'

const NAV_ITEMS = [
  { id: 'info',   label: 'Thông tin tài khoản', Icon: User       },
  { id: 'orders', label: 'Quản lý đơn hàng',    Icon: ShoppingBag},
  { id: 'logout', label: 'Đăng xuất',            Icon: LogOut     },
]

/**
 * AccountSidebar
 *
 * Props:
 *   user        {object}   — logged-in user
 *   activeTab   {string}   — 'info' | 'orders' | 'logout'
 *   onTabChange {function} — (tabId) => void
 */
function AccountSidebar({ user, activeTab, onTabChange }) {
  return (
    <aside className="account-sidebar">
      {/* Profile block */}
      <div className="account-sidebar-profile">
        <div className="account-sidebar-avatar" aria-hidden="true">
          <User size={24} />
        </div>
        <span className="account-sidebar-name">{user.fullName}</span>
      </div>

      {/* Nav */}
      <nav className="account-sidebar-nav" aria-label="Tài khoản">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`account-sidebar-item${id === 'logout' ? ' logout-item' : ''}${activeTab === id ? ' active' : ''}`}
            onClick={() => onTabChange(id)}
            id={`account-nav-${id}`}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default AccountSidebar
