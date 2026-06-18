import { useEffect, useState } from 'react'
import { MapPin, Plus, Save, Star, Trash2, X } from 'lucide-react'
import { userApi } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import './AccountContent.css'

const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS  = Array.from({ length: 80  }, (_, i) => new Date().getFullYear() - i)

const EMPTY_ADDRESS = {
  receiverName: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  street: '',
  isDefault: false,
}

function AccountInfo() {
  const { user, updateUser } = useAuth()

  const [fullName, setFullName] = useState(user.fullName || '')
  const [gender,   setGender  ] = useState(user.gender  || 'nam')
  const [phone,    setPhone   ] = useState(user.phone   || '')
  const [dob,      setDob     ] = useState(user.dob     || { day: '', month: '', year: '' })
  const [addresses, setAddresses] = useState([])
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [message, setMessage] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  const showMessage = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 2500)
  }

  const loadAddresses = async () => {
    const data = await userApi.listAddresses()
    setAddresses(data)
  }

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const [profile, savedAddresses] = await Promise.all([
          userApi.getMe(),
          userApi.listAddresses(),
        ])

        if (!mounted) return

        setFullName(profile.fullName || '')
        setPhone(profile.phone || '')
        setAddresses(savedAddresses)
        updateUser({
          fullName: profile.fullName,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
          role: profile.role,
        })
      } catch {
        if (mounted) showMessage('Không thể tải thông tin tài khoản.')
      }
    }

    loadProfile()
    return () => { mounted = false }
  }, [updateUser])

  const handleSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)

    try {
      const profile = await userApi.updateMe({ fullName, phone })
      updateUser({
        fullName: profile.fullName,
        phone: profile.phone,
        gender,
        dob,
      })
      showMessage('Đã lưu thông tin tài khoản.')
    } catch (err) {
      showMessage(err.message || 'Không thể lưu thông tin.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAddressChange = (field, value) => {
    setAddressForm(prev => ({ ...prev, [field]: value }))
  }

  const resetAddressForm = () => {
    setEditingAddressId(null)
    setAddressForm(EMPTY_ADDRESS)
  }

  const startEditAddress = (address) => {
    setEditingAddressId(address.addressId)
    setAddressForm({
      receiverName: address.receiverName,
      phone: address.phone,
      province: address.province || '',
      district: address.district || '',
      ward: address.ward || '',
      street: address.street || '',
      isDefault: address.isDefault,
    })
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    setSavingAddress(true)

    try {
      if (editingAddressId) {
        await userApi.updateAddress(editingAddressId, addressForm)
        showMessage('Đã cập nhật địa chỉ.')
      } else {
        await userApi.createAddress(addressForm)
        showMessage('Đã thêm địa chỉ.')
      }
      resetAddressForm()
      await loadAddresses()
    } catch (err) {
      showMessage(err.message || 'Không thể lưu địa chỉ.')
    } finally {
      setSavingAddress(false)
    }
  }

  const handleSetDefault = async (addressId) => {
    try {
      await userApi.setDefaultAddress(addressId)
      await loadAddresses()
      showMessage('Đã đặt địa chỉ mặc định.')
    } catch (err) {
      showMessage(err.message || 'Không thể đặt mặc định.')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    try {
      await userApi.deleteAddress(addressId)
      await loadAddresses()
      if (editingAddressId === addressId) resetAddressForm()
      showMessage('Đã xóa địa chỉ.')
    } catch (err) {
      showMessage(err.message || 'Không thể xóa địa chỉ.')
    }
  }

  return (
    <div className="account-content">
      <h2 className="account-content-title">Thông tin tài khoản</h2>

      <form className="account-info-form" onSubmit={handleSave}>
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

        <div className="account-info-row">
          <span className="account-info-label">Email</span>
          <span className="account-info-email">{user.email}</span>
        </div>

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
          disabled={savingProfile}
        >
          <Save size={16} />
          {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>

      <section className="account-address-section">
        <div className="account-address-heading">
          <h3>Địa chỉ nhận hàng</h3>
          <span>{addresses.length} địa chỉ</span>
        </div>

        <div className="account-address-list">
          {addresses.length === 0 && (
            <p className="account-address-empty">
              Chưa có địa chỉ nào. Thêm địa chỉ để checkout tự điền lần sau.
            </p>
          )}

          {addresses.map(address => (
            <div key={address.addressId} className="account-address-item">
              <MapPin size={18} />
              <div className="account-address-body">
                <strong>{address.receiverName} - {address.phone}</strong>
                <span>{address.fullAddress}</span>
                {address.isDefault && <em>Mặc định</em>}
              </div>
              <div className="account-address-actions">
                {!address.isDefault && (
                  <button type="button" onClick={() => handleSetDefault(address.addressId)} title="Đặt mặc định">
                    <Star size={16} />
                  </button>
                )}
                <button type="button" onClick={() => startEditAddress(address)} title="Sửa địa chỉ">
                  Sửa
                </button>
                <button type="button" onClick={() => handleDeleteAddress(address.addressId)} title="Xóa địa chỉ">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form className="account-address-form" onSubmit={handleAddressSubmit}>
          <div className="account-address-form-title">
            <h4>{editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h4>
            {editingAddressId && (
              <button type="button" onClick={resetAddressForm} title="Hủy sửa">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="account-address-grid">
            <input
              className="account-info-input"
              placeholder="Người nhận"
              value={addressForm.receiverName}
              onChange={e => handleAddressChange('receiverName', e.target.value)}
              required
            />
            <input
              className="account-info-input"
              placeholder="Số điện thoại"
              value={addressForm.phone}
              onChange={e => handleAddressChange('phone', e.target.value)}
              required
            />
            <input
              className="account-info-input"
              placeholder="Tỉnh / Thành phố"
              value={addressForm.province}
              onChange={e => handleAddressChange('province', e.target.value)}
            />
            <input
              className="account-info-input"
              placeholder="Quận / Huyện"
              value={addressForm.district}
              onChange={e => handleAddressChange('district', e.target.value)}
            />
            <input
              className="account-info-input"
              placeholder="Phường / Xã"
              value={addressForm.ward}
              onChange={e => handleAddressChange('ward', e.target.value)}
            />
            <input
              className="account-info-input"
              placeholder="Số nhà, tên đường"
              value={addressForm.street}
              onChange={e => handleAddressChange('street', e.target.value)}
              required
            />
          </div>

          <label className="account-address-default">
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={e => handleAddressChange('isDefault', e.target.checked)}
            />
            Đặt làm địa chỉ mặc định
          </label>

          <button type="submit" className="account-address-submit" disabled={savingAddress}>
            {editingAddressId ? <Save size={16} /> : <Plus size={16} />}
            {savingAddress ? 'Đang lưu...' : editingAddressId ? 'Lưu địa chỉ' : 'Thêm địa chỉ'}
          </button>
        </form>
      </section>

      {message && <p className="account-info-message">{message}</p>}
    </div>
  )
}

export default AccountInfo
