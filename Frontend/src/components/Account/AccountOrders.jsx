import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, PackageCheck, Pencil, RotateCcw, XCircle } from 'lucide-react'
import { cartApi, ordersApi } from '../../api/client'
import { useCart } from '../../context/CartContext'
import './AccountContent.css'

const ORDER_TABS = [
  { id: 'processing', label: 'Đang xử lý' },
  { id: 'shipping', label: 'Đang vận chuyển' },
  { id: 'done', label: 'Hoàn thành' },
]

const CANCEL_REASONS = [
  'Đổi ý không muốn mua nữa',
  'Muốn thay đổi sản phẩm',
  'Muốn thay đổi địa chỉ nhận hàng',
  'Tìm được giá tốt hơn',
  'Đặt nhầm hoặc trùng đơn',
  'Khác',
]

function formatPrice(price) {
  return Number(price || 0).toLocaleString('vi-VN') + 'đ'
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN')
}

function orderGroup(status) {
  if (status === 'Completed') return 'done'
  if (status === 'Shipped' || status === 'Paid') return 'shipping'
  return 'processing'
}

function statusLabel(status) {
  const labels = {
    Pending: 'Chờ xử lý',
    Paid: 'Đã thanh toán',
    Shipped: 'Đang vận chuyển',
    Completed: 'Hoàn thành',
    Cancelled: 'Đã hủy',
  }
  return labels[status] || status
}

function AccountOrders() {
  const navigate = useNavigate()
  const { refresh } = useCart()
  const [activeTab, setActiveTab] = useState('processing')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [addressForm, setAddressForm] = useState({ receiverName: '', phone: '', shippingAddress: '' })
  const [cancelOrder, setCancelOrder] = useState(null)
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0])
  const [cancelNote, setCancelNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const showMessage = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 2500)
  }

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await ordersApi.list()
      setOrders(data)
    } catch (err) {
      setError(err.message || 'Không tải được đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError('')
      try {
        const data = await ordersApi.list()
        if (!cancelled) setOrders(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không tải được đơn hàng.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [])

  const visibleOrders = useMemo(
    () => orders.filter(order => orderGroup(order.status) === activeTab),
    [orders, activeTab],
  )

  const startEditAddress = (order) => {
    setExpandedId(order.orderId)
    setEditingId(order.orderId)
    setAddressForm({
      receiverName: order.receiverName || '',
      phone: order.phone || '',
      shippingAddress: order.shippingAddress || '',
    })
  }

  const handleUpdateAddress = async (orderId) => {
    setSaving(true)
    try {
      const updated = await ordersApi.updateAddress(orderId, addressForm)
      setOrders(prev => prev.map(order => order.orderId === orderId ? updated : order))
      setEditingId(null)
      showMessage('Đã cập nhật địa chỉ giao hàng.')
    } catch (err) {
      showMessage(err.message || 'Không thể cập nhật địa chỉ.')
    } finally {
      setSaving(false)
    }
  }

  const openCancel = (order) => {
    setCancelOrder(order)
    setCancelReason(CANCEL_REASONS[0])
    setCancelNote('')
  }

  const handleCancel = async () => {
    if (!cancelOrder || !cancelReason) return
    setSaving(true)
    try {
      const updated = await ordersApi.cancel(cancelOrder.orderId, {
        reason: cancelReason,
        note: cancelNote,
      })
      setOrders(prev => prev.map(order => order.orderId === cancelOrder.orderId ? updated : order))
      setEditingId(null)
      setCancelOrder(null)
      showMessage('Đã hủy đơn hàng và lưu lý do hủy.')
    } catch (err) {
      showMessage(err.message || 'Không thể hủy đơn hàng.')
    } finally {
      setSaving(false)
    }
  }

  const handleBuyAgain = async (order) => {
    const items = Array.from(order.items || [])
    if (items.length === 0) return

    setSaving(true)
    try {
      for (const item of items) {
        await cartApi.addItem(item.variantId, item.quantity)
      }
      await refresh(false)
      navigate('/gio-hang')
    } catch (err) {
      showMessage(err.message || 'Không thể thêm lại sản phẩm vào giỏ hàng.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="account-content">
      <h2 className="account-content-title">Quản lý đơn hàng</h2>

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

      {loading && <p className="account-orders-empty">Đang tải đơn hàng...</p>}
      {error && <p className="account-orders-empty">{error}</p>}
      {message && <p className="account-info-message">{message}</p>}

      {!loading && !error && visibleOrders.length === 0 && (
        <p className="account-orders-empty">Bạn chưa có đơn hàng trong mục này.</p>
      )}

      {!loading && !error && (
        <div className="account-order-list">
          {visibleOrders.map(order => {
            const isExpanded = expandedId === order.orderId
            const isPending = order.status === 'Pending'
            const isLocked = order.status === 'Cancelled'
            const items = Array.from(order.items || [])

            return (
              <article key={order.orderId} className={`account-order-card${isLocked ? ' locked' : ''}`}>
                <div className="account-order-head">
                  <div>
                    <strong>Đơn #{String(order.orderId).slice(0, 8)}</strong>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <em>{statusLabel(order.status)}</em>
                </div>

                <div className="account-order-summary">
                  <span>{order.itemCount || items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span>
                  <strong>{formatPrice(order.grandTotal)}</strong>
                </div>

                <div className="account-order-address">
                  <MapPin size={16} />
                  <span>{[order.receiverName, order.phone].filter(Boolean).join(' - ') || 'Chua co thong tin nguoi nhan'}</span>
                  <small>{order.shippingAddress || 'Chua co dia chi giao hang'}</small>
                </div>

                {isLocked && (
                  <p className="account-order-locked">Đơn đã hủy và đã được khóa. Bạn chỉ có thể xem sản phẩm hoặc mua lại.</p>
                )}

                {isExpanded && (
                  <div className="account-order-detail">
                    <div className="account-order-items">
                      {items.length === 0 ? (
                        <p className="account-orders-empty">Chua co du lieu san pham cho don hang nay.</p>
                      ) : items.map(item => (
                        <div key={item.orderItemId} className="account-order-item">
                          <PackageCheck size={17} />
                          <div>
                            {item.productSlug ? (
                              <Link to={`/san-pham/${item.productSlug}`}>{item.productName}</Link>
                            ) : (
                              <strong>{item.productName}</strong>
                            )}
                            {item.variantInfo && <span>{item.variantInfo}</span>}
                          </div>
                          <small>x{item.quantity}</small>
                          <strong>{formatPrice(item.subtotal)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="account-order-money">
                      <span>Tạm tính: {formatPrice(order.subtotal)}</span>
                      <span>Giảm giá: {formatPrice(order.discountTotal)}</span>
                      <span>Phí giao hàng: {formatPrice(order.shippingFee)}</span>
                      <strong>Thành tiền: {formatPrice(order.grandTotal)}</strong>
                    </div>

                    {editingId === order.orderId && isPending && (
                      <div className="account-order-address-form">
                        <input
                          className="account-info-input"
                          value={addressForm.receiverName}
                          onChange={e => setAddressForm(prev => ({ ...prev, receiverName: e.target.value }))}
                          placeholder="Người nhận"
                        />
                        <input
                          className="account-info-input"
                          value={addressForm.phone}
                          onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Số điện thoại"
                        />
                        <input
                          className="account-info-input"
                          value={addressForm.shippingAddress}
                          onChange={e => setAddressForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                          placeholder="Địa chỉ giao hàng"
                        />
                        <div className="account-order-edit-actions">
                          <button type="button" onClick={() => handleUpdateAddress(order.orderId)} disabled={saving}>
                            Lưu địa chỉ
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} disabled={saving}>
                            Hủy sửa
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="account-order-actions">
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : order.orderId)}>
                    {isExpanded ? 'Thu gọn' : 'Chi tiết đơn hàng'}
                  </button>
                  {isPending && (
                    <>
                      <button type="button" onClick={() => startEditAddress(order)} disabled={saving}>
                        <Pencil size={15} />
                        Đổi địa chỉ
                      </button>
                      <button type="button" onClick={() => openCancel(order)} disabled={saving}>
                        <XCircle size={15} />
                        Hủy mua
                      </button>
                    </>
                  )}
                  {(order.status === 'Cancelled' || order.status === 'Completed') && (
                    <button type="button" onClick={() => handleBuyAgain(order)} disabled={saving}>
                      <RotateCcw size={15} />
                      Mua lại
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {!loading && (
        <button className="account-orders-refresh" type="button" onClick={loadOrders}>
          Tải lại đơn hàng
        </button>
      )}

      {cancelOrder && (
        <div className="account-order-cancel-box">
          <div className="account-order-cancel-panel">
            <h3>Chọn lý do hủy đơn</h3>
            <p>Đơn #{String(cancelOrder.orderId).slice(0, 8)} sẽ bị khóa sau khi hủy.</p>
            <select
              className="account-info-select"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            >
              {CANCEL_REASONS.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            <textarea
              className="account-info-input"
              value={cancelNote}
              onChange={e => setCancelNote(e.target.value)}
              placeholder="Ghi chú thêm cho admin (không bắt buộc)"
              rows={3}
            />
            <div className="account-order-edit-actions">
              <button type="button" onClick={handleCancel} disabled={saving || !cancelReason}>
                Xác nhận hủy
              </button>
              <button type="button" onClick={() => setCancelOrder(null)} disabled={saving}>
                Không hủy nữa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountOrders
