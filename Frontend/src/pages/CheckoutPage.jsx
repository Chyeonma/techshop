import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import CheckoutItemList     from '../components/Checkout/CheckoutItemList'
import CheckoutCustomerForm from '../components/Checkout/CheckoutCustomerForm'
import CheckoutDelivery     from '../components/Checkout/CheckoutDelivery'
import CheckoutPayment      from '../components/Checkout/CheckoutPayment'
import CheckoutSummary      from '../components/Checkout/CheckoutSummary'
import './CheckoutPage.css'

/**
 * CheckoutPage — /thanh-toan
 *
 * Displays the full checkout flow for all currently-selected cart items.
 * Redirects to /gio-hang if there are no selected items to check out.
 */
function CheckoutPage() {
  const navigate = useNavigate()
  const { selectedItems, subtotal, originalTotal, discount } = useCart()

  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' })
  const [delivery, setDelivery] = useState('home')
  const [address,  setAddress ] = useState('')
  const [payment,  setPayment ] = useState('cod')

  const handleCustomerChange = (field, value) =>
    setCustomer(prev => ({ ...prev, [field]: value }))

  const handlePlaceOrder = () => {
    // Order logic placeholder — would submit to backend
    alert('Đặt hàng thành công!')
  }

  // Guard — nothing selected
  if (selectedItems.length === 0) {
    return <Navigate to="/gio-hang" replace />
  }

  return (
    <div className="container checkout-page">
      {/* ← Quay lại giỏ hàng */}
      <button
        className="checkout-back"
        onClick={() => navigate('/gio-hang')}
        id="checkout-back-btn"
        aria-label="Quay lại giỏ hàng"
      >
        <ChevronLeft size={15} />
        Quay lại giỏ hàng
      </button>

      <div className="checkout-layout">
        {/* Left column */}
        <div className="checkout-left">
          <CheckoutItemList items={selectedItems} />

          <CheckoutCustomerForm
            value={customer}
            onChange={handleCustomerChange}
          />

          <CheckoutDelivery
            method={delivery}
            onChange={setDelivery}
            address={address}
            onAddressChange={setAddress}
          />

          <CheckoutPayment
            method={payment}
            onChange={setPayment}
          />
        </div>

        {/* Right column — sticky summary */}
        <CheckoutSummary
          subtotal={subtotal}
          originalTotal={originalTotal}
          discount={discount}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    </div>
  )
}

export default CheckoutPage
