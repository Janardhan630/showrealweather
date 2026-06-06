import React, { useState } from 'react'
import FavoriteCard from './FavoriteCard'
import FavoritesInsights, { analyzeFavorites } from './FavoritesInsights'

function EmptyState() {
  return (
    <div className="fav-empty">
      <div className="fav-empty__icon">⭐</div>
      <h2 className="fav-empty__title">No favorite locations yet</h2>
      <p className="fav-empty__body">
        Search a city in the <strong>Weather</strong> tab, then tap the ★ button on the
        weather card to save it here. Compare conditions across all your cities at a glance.
      </p>
      <div className="fav-empty__hints">
        {['🌤 London', '🌴 Dubai', '🗽 New York', '🗼 Tokyo', '🌸 Paris'].map(h => (
          <span key={h} className="fav-hint">{h}</span>
        ))}
      </div>
    </div>
  )
}

export default function FavoritesDashboard({
  favorites, cache, weatherData, loading, errors,
  unit, onRemove, onReorder, onRefresh,
}) {
  const [dragIdx,     setDragIdx]     = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  const analysis = analyzeFavorites(favorites, weatherData, unit)
  const badges   = analysis?.badges ?? {}

  // ── Drag handlers ──────────────────────────────────────────
  const handleDragStart = (e, idx) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
    setDragIdx(idx)
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIdx !== idx) setDragOverIdx(idx)
  }

  const handleDrop = (e, idx) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragIdx !== null && dragIdx !== idx) onReorder(dragIdx, idx)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  const handleDragEnd = () => {
    setDragIdx(null)
    setDragOverIdx(null)
  }

  if (!favorites.length) return <EmptyState />

  const anyLoading = Object.values(loading).some(Boolean)

  return (
    <div className="fav-dashboard">

      {/* ── Dashboard header ────────────────────────────── */}
      <div className="fav-dashboard__header">
        <div>
          <h2 className="fav-dashboard__title">My Locations</h2>
          <p className="fav-dashboard__subtitle">
            {favorites.length} saved · drag cards to reorder
          </p>
        </div>
        <button
          className={`fav-refresh-btn${anyLoading ? ' fav-refresh-btn--spinning' : ''}`}
          onClick={onRefresh}
          disabled={anyLoading}
          title="Refresh all locations"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh All
        </button>
      </div>

      {/* ── Insights (shown when ≥ 2 cities have data) ──── */}
      <FavoritesInsights
        favorites={favorites}
        weatherData={weatherData}
        unit={unit}
      />

      {/* ── Cards grid ──────────────────────────────────── */}
      <div
        className="fav-grid"
        onDragOver={e => e.preventDefault()}
      >
        {favorites.map((city, idx) => (
          <FavoriteCard
            key={city}
            city={city}
            weather={weatherData[city]}
            fetchedAt={cache[city]?.fetchedAt}
            loading={!!loading[city]}
            error={errors[city]}
            unit={unit}
            badge={badges[city]}
            onRemove={onRemove}
            dragging={dragIdx === idx}
            dragOver={dragOverIdx === idx && dragIdx !== idx}
            onDragStart={e => handleDragStart(e, idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={e => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

    </div>
  )
}
