import { Routes, Route } from 'react-router-dom'
import './App.css'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage'
import PhonePage from './pages/PhonePage'
import LaptopPage from './pages/LaptopPage'
import AccessoryPage from './pages/AccessoryPage'
import BrandSeriesPage from './pages/BrandSeriesPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AccountPage from './pages/AccountPage'
import AuthModal from './components/Auth/AuthModal'

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dien-thoai" element={<PhonePage />} />
          <Route path="/dien-thoai/:brand" element={<BrandSeriesPage type="phone" />} />
          <Route path="/laptop" element={<LaptopPage />} />
          <Route path="/laptop/:brand" element={<BrandSeriesPage type="laptop" />} />
          <Route path="/phu-kien" element={<AccessoryPage />} />
          <Route path="/san-pham/:id" element={<ProductDetailPage />} />
          <Route path="/gio-hang" element={<CartPage />} />
          <Route path="/thanh-toan" element={<CheckoutPage />} />
          <Route path="/tai-khoan" element={<AccountPage />} />
        </Routes>
      </main>
      <Footer />
      <AuthModal />
    </div>
  )
}

export default App
