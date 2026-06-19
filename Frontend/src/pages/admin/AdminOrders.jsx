import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, X, Truck } from 'lucide-react'
import { adminOrdersApi } from '../../api/adminApi'

const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v ?? 0)

const ALL_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled']

const STATUS_MAP = {
  Pending: { label: 'Cho xu ly', badge: 'admin-badge-warning' },
  Processing: { label: 'Dang xu ly', badge: 'admin-badge-info' },
  Shipped: { label: 'Dang giao', badge: 'admin-badge-purple' },
  Delivered: { label: 'Da giao', badge: 'admin-badge-success' },
  Completed: { label: 'Hoan thanh', badge: 'admin-badge-success' },
  Cancelled: { label: 'Da huy', badge: 'admin-badge-danger' },
  Paid: { label: 'Da thanh toan', badge: 'admin-badge-info' },
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, marginBottom: 6 }}>
      <strong>{label}</strong>
      <span>{value || '-'}</span>
    </div>
  )
}

function OrderDetailModal({ order, onClose, onSaved }) {
  const [status, setStatus] = useState(order.status)
  const [note, setNote] = useState('')
  const [tracking, setTracking] = useState(order.trackingCode || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const items = Array.from(order.items || [])
  const payment = order.payment

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (status !== order.status) {
        await adminOrdersApi.updateStatus(order.orderId, status, note)
      }
      if (tracking !== order.trackingCode) {
        await adminOrdersApi.updateTracking(order.orderId, tracking)
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Khong the cap nhat don hang.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" style={{ maxWidth: 760 }}>
        <div className="admin-modal-header">
          <span className="admin-modal-title">Chi tiet don hang #{order.orderId?.slice(0, 8).toUpperCase()}</span>
          <button className="admin-modal-close" onClick={onClose} type="button"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {error && <div className="admin-alert admin-alert-danger">{error}</div>}

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, fontSize: 13 }}>
              <DetailRow label="Khach hang" value={order.customer?.fullName || order.customer?.email || 'Khach'} />
              <DetailRow label="Email" value={order.customer?.email} />
              <DetailRow label="Nguoi nhan" value={order.receiverName} />
              <DetailRow label="So dien thoai" value={order.phone || order.customer?.phone} />
              <DetailRow label="Dia chi" value={order.shippingAddress} />
              <DetailRow label="Ngay dat" value={order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''} />
              <DetailRow label="Ghi chu" value={order.note} />
              {payment && (
                <DetailRow
                  label="Thanh toan"
                  value={`${payment.method || '-'} / ${payment.status || '-'}${payment.transactionCode ? ` / ${payment.transactionCode}` : ''}`}
                />
              )}
              {order.cancelReason && <DetailRow label="Ly do huy" value={order.cancelReason} />}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">San pham trong don</label>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                {items.length === 0 ? (
                  <div style={{ padding: 12, color: '#94a3b8', fontSize: 13 }}>Chua co du lieu san pham.</div>
                ) : items.map((item, index) => (
                  <div
                    key={item.orderItemId || item.variantId || index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 12,
                      padding: 12,
                      borderBottom: index === items.length - 1 ? 0 : '1px solid #e2e8f0',
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.productName || 'San pham'}</div>
                      {item.variantInfo && <div style={{ color: '#64748b', marginTop: 2 }}>{item.variantInfo}</div>}
                      <div style={{ color: '#64748b', marginTop: 2 }}>
                        SL: {item.quantity} x {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#1d4ed8' }}>{formatCurrency(item.subtotal)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff7ed', borderRadius: 8, padding: 12, fontSize: 13 }}>
              <DetailRow label="Tam tinh" value={formatCurrency(order.subtotal)} />
              <DetailRow label="Giam gia" value={formatCurrency(order.discountTotal)} />
              <DetailRow label="Van chuyen" value={formatCurrency(order.shippingFee)} />
              <div style={{ marginTop: 6, fontWeight: 800, color: '#1d4ed8' }}>
                Tong thanh toan: {formatCurrency(order.grandTotal)}
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label required">Trang thai moi</label>
              <select
                className="admin-form-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Ma van don tracking</label>
              <input
                className="admin-form-input"
                value={tracking}
                onChange={e => setTracking(e.target.value)}
                placeholder="VD: GHN123456789"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Ghi chu cap nhat</label>
              <textarea
                className="admin-form-textarea"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ly do thay doi trang thai..."
                rows={2}
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Dong</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Dang luu...' : 'Cap nhat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 15, total: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminOrdersApi.list({
        status: statusFilter || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
      setOrders(res.data || [])
      setPagination(p => ({ ...p, total: res.pagination?.total || res.meta?.total || 0 }))
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, pagination.page, pagination.pageSize])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)
  const needle = search.trim().toLowerCase()
  const filtered = needle
    ? orders.filter(o =>
        o.customer?.email?.toLowerCase().includes(needle) ||
        o.customer?.fullName?.toLowerCase().includes(needle) ||
        o.receiverName?.toLowerCase().includes(needle) ||
        o.phone?.toLowerCase().includes(needle) ||
        o.shippingAddress?.toLowerCase().includes(needle) ||
        o.trackingCode?.toLowerCase().includes(needle) ||
        o.items?.some(item => item.productName?.toLowerCase().includes(needle))
      )
    : orders

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Quan ly Don hang</h1>
          <p>{pagination.total} don hang</p>
        </div>
      </div>

      <div className="admin-tabs" style={{ overflowX: 'auto' }}>
        <button
          className={`admin-tab${statusFilter === '' ? ' active' : ''}`}
          onClick={() => { setStatusFilter(''); setPagination(p => ({ ...p, page: 1 })) }}
        >
          Tat ca
        </button>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            className={`admin-tab${statusFilter === s ? ' active' : ''}`}
            onClick={() => { setStatusFilter(s); setPagination(p => ({ ...p, page: 1 })) }}
          >
            {STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-body" style={{ padding: '12px 16px' }}>
          <div className="admin-search-input-wrap" style={{ maxWidth: 460 }}>
            <Search size={15} className="admin-search-icon" />
            <input
              id="order-search"
              className="admin-form-input admin-search-input"
              placeholder="Tim theo email, ten, dia chi, san pham, ma van don..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ma don</th>
                    <th>Khach hang</th>
                    <th>Nguoi nhan</th>
                    <th>Tong tien</th>
                    <th>Ma van don</th>
                    <th>Ngay dat</th>
                    <th>Trang thai</th>
                    <th style={{ width: 100 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="admin-empty">
                          <div className="admin-empty-icon">-</div>
                          <div className="admin-empty-title">Khong co don hang nao</div>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map(o => (
                    <tr key={o.orderId}>
                      <td>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#475569' }}>
                          {o.orderId?.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{o.customer?.fullName || 'Khach'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{o.customer?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{o.receiverName || '-'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{o.phone || '-'}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#1d4ed8' }}>
                        {formatCurrency(o.grandTotal)}
                      </td>
                      <td>
                        {o.trackingCode
                          ? <span className="admin-tag"><Truck size={11} /> {o.trackingCode}</span>
                          : <span style={{ color: '#94a3b8' }}>-</span>
                        }
                      </td>
                      <td style={{ fontSize: 12, color: '#475569' }}>
                        {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        <span className={`admin-badge ${STATUS_MAP[o.status]?.badge || 'admin-badge-gray'}`}>
                          {STATUS_MAP[o.status]?.label || o.status}
                        </span>
                      </td>
                      <td>
                        <button
                          id={`btn-edit-order-${o.orderId?.slice(0, 8)}`}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setEditing(o)}
                        >
                          Chi tiet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span className="admin-pagination-info">
                Trang {pagination.page} / {totalPages || 1} &bull; {pagination.total} don
              </span>
              <div className="admin-pagination-btns">
                <button
                  className="admin-page-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                ><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
                  <button
                    key={pg}
                    className={`admin-page-btn${pagination.page === pg ? ' active' : ''}`}
                    onClick={() => setPagination(p => ({ ...p, page: pg }))}
                  >{pg}</button>
                ))}
                <button
                  className="admin-page-btn"
                  disabled={pagination.page >= totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                ><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {editing && (
        <OrderDetailModal
          order={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}
