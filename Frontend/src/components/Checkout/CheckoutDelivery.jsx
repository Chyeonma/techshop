import './CheckoutDelivery.css'

const DELIVERY_OPTIONS = [
  { value: 'home', label: 'Giao hàng tận nơi' },
]

/**
 * CheckoutDelivery
 *
 * Props:
 *   method   {'home'}
 *   onChange {function}
 *   address  {string}
 *   onAddressChange {function}
 */
function CheckoutDelivery({ method, onChange, address, onAddressChange }) {
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
        <input
          id="checkout-address-input"
          className="checkout-input"
          type="text"
          placeholder="Nhập địa chỉ nhận hàng"
          value={address}
          onChange={e => onAddressChange(e.target.value)}
          autoComplete="address-level1"
        />
      )}
    </div>
  )
}

export default CheckoutDelivery
