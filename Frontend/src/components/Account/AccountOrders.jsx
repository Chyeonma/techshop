import { useState } from 'react'
import './AccountContent.css'

const ORDER_TABS = [
  { id: 'processing', label: 'Đang xử lý'      },
  { id: 'shipping',   label: 'Đang vận chuyển'  },
  { id: 'done',       label: 'Hoàn thành'        },
]

/**
 * AccountOrders — Quản lý đơn hàng tab
 */
function AccountOrders() {
  const [activeTab, setActiveTab] = useState('processing')

  return (
    <div className="account-content">
      <h2 className="account-content-title">Quản lý đơn hàng</h2>

      {/* Tabs */}
      <div className="account-orders-tabs" role="tablist">
        {ORDER_TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`account-orders-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            id={`orders-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty state for all tabs */}
      <p className="account-orders-empty">Bạn chưa đặt mua sản phẩm.</p>
    </div>
  )
}

export default AccountOrders
