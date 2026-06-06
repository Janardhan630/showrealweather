import React from 'react'

export default function WeatherCard({ weather, unit, onToggleUnit, isFavorite, onToggleFavorite }) {
  if (!weather) return null

  const { main, weather: conditions, wind, visibility, sys, name, timezone } = weather
  const icon = conditions[0].icon
  const desc = conditions[0].description
  const windKmh = Math.round((wind?.speed ?? 0) * 3.6)
  const visKm = visibility ? (visibility / 1000).toFixed(1) : '—'

  const cityTime = (utc) => {
    const d = new Date((utc + timezone) * 1000)
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
  }

  const toDisplay = (c) => unit === 'F' ? Math.round(c * 9 / 5 + 32) : Math.round(c)
  const symbol = unit === 'F' ? '°F' : '°C'

  return (
    <div className="weather-card">
      <div className="weather-card__header">
        <div className="weather-card__location">
          <h2 className="weather-card__city">{name}{sys?.country ? `, ${sys.country}` : ''}</h2>
          <p className="weather-card__desc">{desc}</p>
        </div>
        <div className="weather-card__header-right">
          <img
            className="weather-card__icon"
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={desc}
          />
          <div className="wc-controls">
            <div className="unit-switcher">
              <button
                className={`unit-btn${unit === 'C' ? ' unit-btn--active' : ''}`}
                onClick={() => unit !== 'C' && onToggleUnit()}
              >°C</button>
              <button
                className={`unit-btn${unit === 'F' ? ' unit-btn--active' : ''}`}
                onClick={() => unit !== 'F' && onToggleUnit()}
              >°F</button>
            </div>
            {onToggleFavorite && (
              <button
                className={`fav-star-btn${isFavorite ? ' fav-star-btn--active' : ''}`}
                onClick={onToggleFavorite}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                title={isFavorite ? 'Saved — click to remove' : 'Add to favorites'}
              >
                <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="weather-card__temp">
        {toDisplay(main.temp)}<span className="weather-card__unit">{symbol}</span>
      </div>

      <div className="weather-card__meta">
        <span className="wc-meta-item">Feels like {toDisplay(main.feels_like)}{symbol}</span>
        <span className="wc-meta-dot" />
        <span className="wc-meta-item">{main.humidity}% humidity</span>
        <span className="wc-meta-dot" />
        <span className="wc-meta-item">{windKmh} km/h wind</span>
      </div>

      <div className="weather-card__divider" />

      <div className="weather-card__stats">
        {[
          { icon: '📊', label: 'Pressure',   value: `${main.pressure} hPa` },
          { icon: '👁',  label: 'Visibility', value: `${visKm} km` },
          { icon: '⬆️', label: 'High',        value: `${toDisplay(main.temp_max)}${symbol}` },
          { icon: '⬇️', label: 'Low',         value: `${toDisplay(main.temp_min)}${symbol}` },
          { icon: '🌅', label: 'Sunrise',     value: cityTime(sys.sunrise) },
          { icon: '🌇', label: 'Sunset',      value: cityTime(sys.sunset) },
        ].map(({ icon: ic, label, value }) => (
          <div className="stat" key={label}>
            <span className="stat__icon">{ic}</span>
            <span className="stat__label">{label}</span>
            <span className="stat__value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
