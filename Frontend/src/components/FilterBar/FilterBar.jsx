import { Filter } from 'lucide-react'
import './FilterBar.css'

/**
 * FilterBar — "Chọn tiêu chí" section with filter button.
 * Currently presentational — can be extended with dropdown filters later.
 */
function FilterBar() {
  return (
    <div className="filter-bar">
      <h2 className="filter-bar-title">Chọn tiêu chí</h2>
      <button className="filter-bar-btn" id="filter-bar-btn">
        <Filter size={14} />
        <span>Bộ lọc</span>
      </button>
    </div>
  )
}

export default FilterBar
