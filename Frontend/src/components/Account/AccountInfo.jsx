import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AccountContent.css'

const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS  = Array.from({ length: 80  }, (_, i) => new Date().getFullYear() - i)

/**
 * AccountInfo — Thông tin tài khoản tab
 */
function AccountInfo() {
  const { user, updateUser } = useAuth()

  const [fullName, setFullName] = useState(user.fullName)
  const [gender,   setGender  ] = useState(user.gender  || 'nam')
  const [phone,    setPhone   ] = useState(user.phone   || '')
  const [dob,      setDob     ] = useState(user.dob     || { day: '', month: '', year: '' })
  const [saved,    setSaved   ] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    updateUser({ fullName, gender, phone, dob })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="account-content">
      <h2 className="account-content-title">Thông tin tài khoản</h2>

      <form className="account-info-form" onSubmit={handleSave}>
        {/* Họ Tên */}
        <div className="account-info-row">
          <span className="account-info-label">Họ Tên</span>
          <input
            id="account-fullname"
            className="account-info-input"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

        {/* Giới tính */}
        <div className="account-info-row">
          <span className="account-info-label">Giới tính</span>
          <div className="account-info-gender">
            {['nam', 'nu'].map(g => (
              <label key={g} className="account-info-radio-label">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  id={`account-gender-${g}`}
                />
                {g === 'nam' ? 'Nam' : 'Nữ'}
              </label>
            ))}
          </div>
        </div>

        {/* Số điện thoại */}
        <div className="account-info-row">
          <span className="account-info-label">Số điện thoại</span>
          <input
            id="account-phone"
            className="account-info-input"
            type="tel"
            placeholder="Số điện thoại"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        {/* Email (read-only) */}
        <div className="account-info-row">
          <span className="account-info-label">Email</span>
          <span className="account-info-email">{user.email}</span>
        </div>

        {/* Ngày sinh */}
        <div className="account-info-row">
          <span className="account-info-label">Ngày sinh</span>
          <div className="account-info-dob">
            <select
              id="account-dob-day"
              className="account-info-select"
              value={dob.day}
              onChange={e => setDob(p => ({ ...p, day: e.target.value }))}
            >
              <option value="">Ngày</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              id="account-dob-month"
              className="account-info-select"
              value={dob.month}
              onChange={e => setDob(p => ({ ...p, month: e.target.value }))}
            >
              <option value="">Tháng</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select
              id="account-dob-year"
              className="account-info-select"
              value={dob.year}
              onChange={e => setDob(p => ({ ...p, year: e.target.value }))}
            >
              <option value="">Năm</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="account-info-save"
          id="account-info-save-btn"
        >
          {saved ? 'Đã lưu ✓' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  )
}

export default AccountInfo
