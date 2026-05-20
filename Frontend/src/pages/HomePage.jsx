import { useState } from 'react'
import { phones, laptops, accessories } from '../data/products'
import ProductSection from '../components/ProductSection/ProductSection'

const PHONE_TABS = ['iPhone', 'Samsung', 'Xiaomi', 'Vivo', 'Realme', 'Oppo']
const LAPTOP_TABS = ['MacBook', 'Lenovo', 'Dell', 'Asus', 'Acer', 'Msi']
const ACCESSORY_TABS = ['Bàn phím', 'Tai nghe', 'Chuột']

function HomePage() {
  const [phoneTab, setPhoneTab] = useState('')
  const [laptopTab, setLaptopTab] = useState('')
  const [accessoryTab, setAccessoryTab] = useState('')

  return (
    <div className="container">
      <ProductSection
        title="Điện thoại"
        tabs={PHONE_TABS}
        products={phones}
        activeTab={phoneTab}
        onTabChange={setPhoneTab}
        maxVisible={10}
        linkTo="/dien-thoai"
      />

      <ProductSection
        title="Laptop"
        tabs={LAPTOP_TABS}
        products={laptops}
        activeTab={laptopTab}
        onTabChange={setLaptopTab}
        maxVisible={10}
        linkTo="/laptop"
      />

      <ProductSection
        title="Phụ kiện"
        tabs={ACCESSORY_TABS}
        products={accessories}
        activeTab={accessoryTab}
        onTabChange={setAccessoryTab}
        maxVisible={15}
      />
    </div>
  )
}

export default HomePage
