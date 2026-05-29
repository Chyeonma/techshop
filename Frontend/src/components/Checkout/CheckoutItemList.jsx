import './CheckoutItemList.css'

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ'
}

function getColorLabel(item) {
  const n = item.name.toLowerCase()
  if (n.includes('đen')   || n.includes('black'))  return 'Đen'
  if (n.includes('trắng') || n.includes('white'))  return 'Trắng'
  if (n.includes('bạc')   || n.includes('silver')) return 'Bạc'
  if (n.includes('xanh')  || n.includes('blue'))   return 'Xanh'
  if (n.includes('đỏ')    || n.includes('red'))    return 'Đỏ'
  return 'Mặc định'
}

/**
 * CheckoutItemList
 *
 * Props:
 *   items {array} — selected cart items to display in the order
 */
function CheckoutItemList({ items }) {
  return (
    <div className="checkout-card">
      <h2 className="checkout-card-title">
        Sản phẩm trong đơn ({items.length})
      </h2>

      {items.map(item => (
        <div key={item.id} className="checkout-item">
          <img
            className="checkout-item-img"
            src={item.image}
            alt={item.name}
            loading="lazy"
          />

          <div className="checkout-item-info">
            <p className="checkout-item-name">{item.name}</p>
            <span className="checkout-item-color">Màu: {getColorLabel(item)}</span>
          </div>

          <div className="checkout-item-prices">
            <div className="checkout-item-qty">x{item.quantity}</div>
            <div className="checkout-item-sale">
              {formatPrice(item.salePrice * item.quantity)}
            </div>
            {item.originalPrice > item.salePrice && (
              <div className="checkout-item-original">
                {formatPrice(item.originalPrice * item.quantity)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CheckoutItemList
