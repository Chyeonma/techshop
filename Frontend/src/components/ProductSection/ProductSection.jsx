import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from '../ProductCard/ProductCard'
import './ProductSection.css'

/**
 * ProductSection — reusable section with title badge, brand tabs, and product carousel.
 *
 * Props:
 *   title      {string}   — section heading text, e.g. "Điện thoại"
 *   tabs       {string[]} — array of tab labels (brand names)
 *   products   {object[]} — full product list for this section
 *   activeTab  {string}   — currently active tab label
 *   onTabChange{function} — called with the newly selected tab label
 *   maxVisible {number}   — number of cards shown at once (default 5)
 *   linkTo     {string}   — optional route to navigate to when clicking the title
 *   linkable   {boolean}  — whether cards navigate to detail page (default true)
 */
function ProductSection({ title, tabs, products, activeTab, onTabChange, maxVisible = 5, linkTo, linkable = true }) {
  // offset = index of the first visible card (scrolls 1 card at a time)
  const [offset, setOffset] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const filtered = activeTab
    ? products.filter(p => p.brand === activeTab)
    : products

  const totalCards = filtered.length
  const canPaginate = totalCards > maxVisible

  // Clamp offset so we never go out of bounds
  const maxOffset = Math.max(0, totalCards - maxVisible)
  const safeOffset = Math.min(offset, maxOffset)

  const canPrev = safeOffset > 0
  const canNext = safeOffset < maxOffset

  // Reset to start when filter or data changes
  useEffect(() => {
    setOffset(0)
  }, [activeTab, products])

  const goPrev = () => {
    if (canPrev) setOffset(o => Math.max(0, o - 1))
  }

  const goNext = () => {
    if (canNext) setOffset(o => Math.min(maxOffset, o + 1))
  }

  // ── Sliding track geometry ──────────────────────────────────
  //
  //  viewport  = 100% (clips the track)
  //  Each slot = viewport / maxVisible
  //  Track     = totalCards × slot = (totalCards / maxVisible) × 100% of viewport
  //
  //  translateX is in % of the TRACK, so:
  //    1 slot = slot / track = (1/maxVisible) / (totalCards/maxVisible) = 1/totalCards
  //  → offset slots = offset × 100% / totalCards
  //
  const trackWidthPct  = totalCards > 0 ? (totalCards * 100) / maxVisible : 100
  const translateXPct  = totalCards > 0 ? (safeOffset * 100) / totalCards : 0
  // Each slide = 1/totalCards of track = 1/maxVisible of viewport (before padding)
  const slideWidthPct  = totalCards > 0 ? 100 / totalCards : 100 / maxVisible

  const titleContent = (
    <h2 className="product-section-title">{title}</h2>
  )

  return (
    <section
      className="product-section"
      aria-label={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-section-header">
        {linkTo ? (
          <Link to={linkTo} className="product-section-title-link">
            {titleContent}
          </Link>
        ) : (
          titleContent
        )}

        <nav className="product-section-tabs" aria-label={`Lọc theo thương hiệu ${title}`}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={`product-section-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => onTabChange(tab === activeTab ? '' : tab)}
              id={`tab-${title.replace(/\s+/g, '-').toLowerCase()}-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="product-section-carousel">
        {canPaginate && (
          <button
            type="button"
            className={[
              'product-section-nav',
              'product-section-nav-prev',
              isHovered ? 'visible' : '',
              !canPrev ? 'disabled' : '',
            ].join(' ').trim()}
            onClick={goPrev}
            disabled={!canPrev}
            aria-label={`Sản phẩm ${title} trước đó`}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Viewport: clips overflow, shows exactly maxVisible cards */}
        <div className="product-section-viewport">
          <div
            className="product-section-track"
            style={{
              width: `${trackWidthPct}%`,
              transform: `translateX(-${translateXPct}%)`,
            }}
          >
            {filtered.map((product, idx) => (
              <div
                key={product.id ?? idx}
                className="product-section-slide"
                style={{ width: `${slideWidthPct}%` }}
              >
                <ProductCard product={product} linkable={linkable} />
              </div>
            ))}
          </div>
        </div>

        {canPaginate && (
          <button
            type="button"
            className={[
              'product-section-nav',
              'product-section-nav-next',
              isHovered ? 'visible' : '',
              !canNext ? 'disabled' : '',
            ].join(' ').trim()}
            onClick={goNext}
            disabled={!canNext}
            aria-label={`Sản phẩm ${title} tiếp theo`}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  )
}

export default ProductSection
