import React from 'react'

const BADGES = {
  hottest:  { emoji: '🔥', label: 'Hottest',     cls: 'badge--hot'   },
  coldest:  { emoji: '❄️', label: 'Coldest',      cls: 'badge--cold'  },
  windiest: { emoji: '💨', label: 'Windiest',     cls: 'badge--wind'  },
  humid:    { emoji: '💧', label: 'Most Humid',   cls: 'badge--humid' },
  rainy:    { emoji: '🌧', label: 'Rain Expected',cls: 'badge--rainy' },
  clear:    { emoji: '☀️', label: 'Clear Sky',    cls: 'badge--clear' },
}

function timeAgo(ts) {
  if (!ts) return ''
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)   return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export default function FavoriteCard({
  city, weather, fetchedAt, loading, error, unit, badge,
  onRemove, dragging, dragOver,
  onDragStart, onDragOver, onDragEnd, onDrop,
}) {
  const toTemp = c => unit === 'F' ? Math.round(c * 9 / 5 + 32) : Math.round(c)
  const sym    = unit === 'F' ? '°F' : '°C'
  const b      = badge ? BADGES[badge] : null

  return (
    <div
      className={[
        'fav-card',
        dragging  ? 'fav-card--dragging'  : '',
        dragOver  ? 'fav-card--drag-over' : '',
      ].join(' ').trim()}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      {/* ── Top row ───────────────────────────────────────── */}
      <div className="fav-card__top">
        <div className="fav-card__city-info">
          {b && (
            <span className={`fav-badge ${b.cls}`}>
              {b.emoji} {b.label}
            </span>
          )}
          <h3 className="fav-card__city">
            {weather ? `${weather.name}, ${weather.sys.country}` : city}
          </h3>
          {weather && (
            <p className="fav-card__condition">{weather.weather[0].description}</p>
          )}
        </div>

        <div className="fav-card__top-right">
          {weather && (
            <img
              className="fav-card__icon"
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
          )}
          <button
            className="fav-card__remove"
            onClick={() => onRemove(city)}
            aria-label={`Remove ${city}`}
            title="Remove from favorites"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      {(loading || (!weather && !error)) && (
        <div className="fav-card__loading">
          <span className="fav-card__spinner" />
        </div>
      )}

      {error && !loading && (
        <p className="fav-card__error">⚠ {error}</p>
      )}

      {weather && !loading && (
        <>
          <div className="fav-card__temp">
            {toTemp(weather.main.temp)}
            <span className="fav-card__sym">{sym}</span>
          </div>

          <div className="fav-card__meta">
            <span>Feels {toTemp(weather.main.feels_like)}{sym}</span>
            <span className="fav-meta-dot" />
            <span>{weather.main.humidity}%</span>
            <span className="fav-meta-dot" />
            <span>{Math.round((weather.wind?.speed ?? 0) * 3.6)} km/h</span>
          </div>
        </>
      )}

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="fav-card__footer">
        <span className="fav-card__drag-hint">⠿ drag to reorder</span>
        {fetchedAt && (
          <span className="fav-card__updated">Updated {timeAgo(fetchedAt)}</span>
        )}
      </div>
    </div>
  )
}
