import { useState, useMemo } from 'react'
import { laptops } from '../data/products'
import Breadcrumb from '../components/Breadcrumb/Breadcrumb'
import BrandCardList from '../components/BrandCard/BrandCardList'
import CategoryCardList from '../components/CategoryCard/CategoryCardList'
import FilterBar from '../components/FilterBar/FilterBar'
import SortBar from '../components/SortBar/SortBar'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import './LaptopPage.css'

import logoMacbook from '../assets/logo_macbook.webp'
import logoLenovo  from '../assets/logo_lenovo.webp'
import logoDell    from '../assets/logo_dell.webp'
import logoAsus    from '../assets/logo_asus.webp'
import logoAcer    from '../assets/logo_acer.webp'
import logoMsi     from '../assets/logo_msi.webp'

const LAPTOP_BRANDS = [
  { name: 'MacBook', logo: logoMacbook },
  { name: 'Lenovo',  logo: logoLenovo  },
  { name: 'Dell',    logo: logoDell    },
  { name: 'Asus',    logo: logoAsus    },
  { name: 'Acer',    logo: logoAcer    },
  { name: 'Msi',     logo: logoMsi     },
]

const ITEMS_PER_PAGE = 20

const breadcrumbItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Laptop' },
]

function LaptopPage() {
  const [activeBrand, setActiveBrand] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const filtered = useMemo(() => {
    let result = [...laptops]

    if (activeBrand) {
      result = result.filter(p => p.brand === activeBrand)
    }
    if (activeCategory) {
      result = result.filter(p => p.category === activeCategory)
    }
    if (sortOrder === 'asc') {
      result.sort((a, b) => a.salePrice - b.salePrice)
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.salePrice - a.salePrice)
    }

    return result
  }, [activeBrand, activeCategory, sortOrder])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }

  const handleBrandChange = (brand) => {
    setActiveBrand(brand)
    setVisibleCount(ITEMS_PER_PAGE)
  }

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    setVisibleCount(ITEMS_PER_PAGE)
  }

  return (
    <div className="container laptop-page">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="laptop-page-title">Laptop</h1>

      <BrandCardList
        brands={LAPTOP_BRANDS}
        activeBrand={activeBrand}
        onBrandChange={handleBrandChange}
      />

      <h2 className="laptop-page-section-heading">Chọn theo nhu cầu</h2>

      <CategoryCardList
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <FilterBar />

      <SortBar
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      <ProductGrid products={visible} />

      {hasMore && (
        <div className="laptop-page-load-more">
          <button
            className="laptop-page-load-more-btn"
            onClick={handleLoadMore}
            id="laptop-page-load-more-btn"
          >
            Xem thêm {filtered.length - visibleCount} sản phẩm ▼
          </button>
        </div>
      )}
    </div>
  )
}

export default LaptopPage
