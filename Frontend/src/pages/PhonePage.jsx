import { useState, useMemo } from 'react'
import { phones } from '../data/products'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import BrandCardList from '../components/BrandCard/BrandCardList'
import FilterBar from '../components/FilterBar/FilterBar'
import SortBar from '../components/SortBar/SortBar'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import './PhonePage.css'

import logoIphone  from '../assets/logo_iphone.webp'
import logoSamsung from '../assets/logo_samsung.webp'
import logoXiaomi  from '../assets/logo_xiaomi.webp'
import logoVivo    from '../assets/logo_vivo.png'
import logoRealme  from '../assets/logo_realme.webp'
import logoOppo    from '../assets/logo_oppo.webp'

const PHONE_BRANDS = [
  { name: 'iPhone',  logo: logoIphone  },
  { name: 'Samsung', logo: logoSamsung },
  { name: 'Xiaomi',  logo: logoXiaomi  },
  { name: 'Vivo',    logo: logoVivo    },
  { name: 'Realme',  logo: logoRealme  },
  { name: 'Oppo',    logo: logoOppo    },
]

const ITEMS_PER_PAGE = 20

const breadcrumbItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Điện thoại' },
]

function PhonePage() {
  const [activeBrand, setActiveBrand] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const filtered = useMemo(() => {
    let result = activeBrand
      ? phones.filter(p => p.brand === activeBrand)
      : [...phones]

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.salePrice - b.salePrice)
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.salePrice - a.salePrice)
    }

    return result
  }, [activeBrand, sortOrder])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }

  const handleBrandChange = (brand) => {
    setActiveBrand(brand)
    setVisibleCount(ITEMS_PER_PAGE)
  }

  return (
    <div className="container phone-page">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="phone-page-title">Điện thoại</h1>

      <BrandCardList
        brands={PHONE_BRANDS}
        activeBrand={activeBrand}
        onBrandChange={handleBrandChange}
      />

      <FilterBar />

      <SortBar
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      <ProductGrid products={visible} />

      {hasMore && (
        <div className="phone-page-load-more">
          <button
            className="phone-page-load-more-btn"
            onClick={handleLoadMore}
            id="phone-page-load-more-btn"
          >
            Xem thêm {filtered.length - visibleCount} sản phẩm ▼
          </button>
        </div>
      )}
    </div>
  )
}

export default PhonePage
