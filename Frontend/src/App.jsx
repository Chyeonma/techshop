import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage'
import PhonePage from './pages/PhonePage'
import LaptopPage from './pages/LaptopPage'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dien-thoai" element={<PhonePage />} />
          <Route path="/laptop" element={<LaptopPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
