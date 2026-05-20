import { useState } from 'react'
import { Search, ShoppingCart, User, Menu } from 'lucide-react'
import './Header.css'

function Header() {
  const [searchValue, setSearchValue] = useState('')
  const [cartCount] = useState(0)

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <a href="/" className="header-logo">techshop</a>

        {/* Danh mục */}
        <button className="header-menu-btn" id="header-danhmuc-btn">
          <Menu size={16} />
          <span>Danh mục</span>
        </button>

        {/* Search */}
        <div className="header-search">
          <span className="header-search-icon">
            <Search size={16} />
          </span>
          <input
            id="header-search-input"
            type="text"
            placeholder="Bạn cần tìm gì?"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="header-actions">
          <button className="header-action-btn" id="header-cart-btn">
            <ShoppingCart size={18} />
            <span>Giỏ hàng</span>
            {cartCount > 0 && (
              <span className="header-cart-badge">{cartCount}</span>
            )}
          </button>
          <button className="header-action-btn" id="header-login-btn">
            <User size={18} />
            <span>Đăng nhập</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
