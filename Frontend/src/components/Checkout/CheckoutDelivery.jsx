import './CheckoutDelivery.css'

const DELIVERY_OPTIONS = [
  { value: 'home', label: 'Giao hàng tận nơi' },
]

function CheckoutDelivery({
  method,
  onChange,
  address,
  onAddressChange,
  addresses = [],
  selectedAddressId,
  onAddressSelect,
}) {
  return (
    <div className="checkout-card">
      <h2 className="checkout-card-title">Hình thức nhận hàng</h2>

      <div className="checkout-delivery-options">
        {DELIVERY_OPTIONS.map(opt => (
          <label
            key={opt.value}
            className="checkout-radio-label"
            id={`checkout-delivery-${opt.value}`}
            onClick={() => onChange(opt.value)}
          >
            <div className={`checkout-radio${method === opt.value ? ' checked' : ''}`} />
            {opt.label}
          </label>
        ))}
      </div>

      {method === 'home' && (
        <div className="checkout-address-block">
          {addresses.length > 0 && (
            <div className="checkout-address-list">
              {addresses.map(item => (
                <button
                  key={item.addressId}
                  type="button"
                  className={`checkout-address-option${selectedAddressId === item.addressId ? ' active' : ''}`}
                  onClick={() => onAddressSelect(item.addressId)}
                >
                  <span className={`checkout-radio${selectedAddressId === item.addressId ? ' checked' : ''}`} />
                  <span className="checkout-address-text">
                    <strong>{item.receiverName} - {item.phone}</strong>
                    <span>{item.fullAddress}</span>
                    {item.isDefault && <em>Mặc định</em>}
                  </span>
                </button>
              ))}

              <button
                type="button"
                className={`checkout-address-option${selectedAddressId === 'new' ? ' active' : ''}`}
                onClick={() => onAddressSelect('new')}
              >
                <span className={`checkout-radio${selectedAddressId === 'new' ? ' checked' : ''}`} />
                <span className="checkout-address-text">
                  <strong>Dùng địa chỉ mới</strong>
                  <span>Địa chỉ này sẽ được lưu vào thông tin người dùng sau khi đặt hàng.</span>
                </span>
              </button>
            </div>
          )}

          {(addresses.length === 0 || selectedAddressId === 'new') && (
            <>
              <input
                id="checkout-address-input"
                className="checkout-input"
                type="text"
                placeholder="Nhập địa chỉ nhận hàng"
                value={address}
                onChange={e => onAddressChange(e.target.value)}
                autoComplete="street-address"
              />
              <p className="checkout-address-hint">
                Bạn có thể lưu nhiều địa chỉ trong Thông tin tài khoản để lần sau không cần nhập lại.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default CheckoutDelivery
