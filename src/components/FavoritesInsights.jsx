import React from 'react'

function analyze(favorites, weatherData, unit) {
  const cities = favorites
    .map(name => ({ name, w: weatherData[name] }))
    .filter(c => c.w)

  if (!cities.length) return null

  const toDisp = c => unit === 'F' ? Math.round(c * 9 / 5 + 32) : Math.round(c)
  const sym    = unit === 'F' ? '°F' : '°C'

  const hottest  = cities.reduce((a, b) => a.w.main.temp    > b.w.main.temp    ? a : b)
  const coldest  = cities.reduce((a, b) => a.w.main.temp    < b.w.main.temp    ? a : b)
  const windiest = cities.reduce((a, b) => (a.w.wind?.speed ?? 0) > (b.w.wind?.speed ?? 0) ? a : b)
  const humid    = cities.reduce((a, b) => a.w.main.humidity > b.w.main.humidity ? a : b)

  const avgTemp  = cities.reduce((s, c) => s + c.w.main.temp, 0) / cities.length

  // Distribution
  const dist = {}
  cities.forEach(({ w }) => {
    const m = w.weather[0].main.toLowerCase()
    const k = m.includes('thunder') ? '⛈ Storm'
            : m.includes('rain') || m.includes('drizzle') ? '🌧 Rain'
            : m.includes('snow') ? '❄️ Snow'
            : m.includes('cloud') ? '☁️ Clouds'
            : m.includes('mist') || m.includes('fog') ? '🌫 Mist'
            : '☀️ Clear'
    dist[k] = (dist[k] || 0) + 1
  })

  // Per-city badges (first match wins priority: hot>cold>wind>humid>rainy>clear)
  const badges = {}
  if (hottest.w.main.temp !== coldest.w.main.temp) {
    badges[hottest.name] = 'hottest'
    badges[coldest.name] = 'coldest'
  }
  cities.forEach(({ name, w }) => {
    if (badges[name]) return
    const kmh  = (w.wind?.speed ?? 0) * 3.6
    const main = w.weather[0].main.toLowerCase()
    if (kmh > 20)     { badges[name] = 'windiest'; return }
    if (w.main.humidity > 78) { badges[name] = 'humid'; return }
    if (main.includes('rain') || main.includes('thunder')) { badges[name] = 'rainy'; return }
    if (main === 'clear') badges[name] = 'clear'
  })

  return { hottest, coldest, windiest, humid, avgTemp, dist, badges, toDisp, sym, count: cities.length }
}

export default function FavoritesInsights({ favorites, weatherData, unit }) {
  const ins = analyze(favorites, weatherData, unit)
  if (!ins || ins.count < 2) return null

  const { hottest, coldest, windiest, humid, avgTemp, dist, toDisp, sym, count } = ins

  return (
    <div className="fav-insights">
      {/* ── Comparison chips ──────────────────────────────── */}
      <div className="fav-insights__strip">
        <div className="insight-chip insight-chip--hot">
          <span className="insight-chip__icon">🔥</span>
          <div>
            <span className="insight-chip__label">Hottest</span>
            <span className="insight-chip__value">
              {hottest.name} · {toDisp(hottest.w.main.temp)}{sym}
            </span>
          </div>
        </div>

        <div className="insight-chip insight-chip--cold">
          <span className="insight-chip__icon">❄️</span>
          <div>
            <span className="insight-chip__label">Coldest</span>
            <span className="insight-chip__value">
              {coldest.name} · {toDisp(coldest.w.main.temp)}{sym}
            </span>
          </div>
        </div>

        <div className="insight-chip insight-chip--wind">
          <span className="insight-chip__icon">💨</span>
          <div>
            <span className="insight-chip__label">Windiest</span>
            <span className="insight-chip__value">
              {windiest.name} · {Math.round((windiest.w.wind?.speed ?? 0) * 3.6)} km/h
            </span>
          </div>
        </div>

        <div className="insight-chip insight-chip--humid">
          <span className="insight-chip__icon">💧</span>
          <div>
            <span className="insight-chip__label">Most Humid</span>
            <span className="insight-chip__value">
              {humid.name} · {humid.w.main.humidity}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <div className="fav-stats">
        <div className="fav-stat">
          <span className="fav-stat__n">{count}</span>
          <span className="fav-stat__l">Locations</span>
        </div>
        <div className="fav-stat-divider" />
        <div className="fav-stat">
          <span className="fav-stat__n">{toDisp(avgTemp)}{sym}</span>
          <span className="fav-stat__l">Avg Temp</span>
        </div>
        {Object.entries(dist).map(([label, n]) => (
          <React.Fragment key={label}>
            <div className="fav-stat-divider" />
            <div className="fav-stat">
              <span className="fav-stat__n">{n}</span>
              <span className="fav-stat__l">{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// Export badges map so FavoritesDashboard can reuse the same analysis
export { analyze as analyzeFavorites }
