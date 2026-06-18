import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AccountSidebar from '../components/Account/AccountSidebar'
import AccountInfo    from '../components/Account/AccountInfo'
import AccountOrders  from '../components/Account/AccountOrders'
import AccountPassword from '../components/Account/AccountPassword'
import AccountLogout  from '../components/Account/AccountLogout'
import './AccountPage.css'

const CONTENT = {
  info:     <AccountInfo   />,
  orders:   <AccountOrders />,
  password: <AccountPassword />,
  logout:   <AccountLogout />,
}

/**
 * AccountPage — /tai-khoan
 * Redirects to / if user is not logged in.
 */
function AccountPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('info')

  if (!user) return <Navigate to="/" replace />

  return (
    <div className="container account-page">
      <div className="account-layout">
        <AccountSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {CONTENT[activeTab]}
      </div>
    </div>
  )
}

export default AccountPage
