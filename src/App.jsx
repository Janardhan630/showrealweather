import React, { useState, useEffect, useCallback } from 'react'
import { useWeather }       from './hooks/useWeather'
import { useFavorites }     from './hooks/useFavorites'
import SearchBar            from './components/SearchBar'
import WeatherCard          from './components/WeatherCard'
import ForecastStrip        from './components/ForecastStrip'
import HistorySidebar       from './components/HistorySidebar'
import Toast                from './components/Toast'
import FeedbackPanel        from './components/FeedbackPanel'
import HourlyStrip          from './components/HourlyStrip'
import AqiCard              from './components/AqiCard'
import WeatherTip           from './components/WeatherTip'
import FavoritesDashboard   from './components/FavoritesDashboard'
import AlertsCard           from './components/AlertsCard'
import { addRipple }        from './utils/ripple'
import './App.css'

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return { text: 'Good Morning',   icon: '🌅' }
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', icon: '☀️' }
  if (h >= 17 && h < 21) return { text: 'Good Evening',   icon: '🌆' }
  return                         { text: 'Good Night',     icon: '🌙' }
}

function getTheme(weather) {
  if (!weather) return 'default'
  const now = Date.now() / 1000
  const { sunrise, sunset } = weather.sys
  if (now < sunrise || now > sunset) return 'night'
  const main = weather.weather[0].main.toLowerCase()
  if (main.includes('thunder')) return 'storm'
  if (main.includes('snow'))    return 'snow'
  if (main.includes('rain') || main.includes('drizzle')) return 'rain'
  if (main.includes('cloud'))   return 'clouds'
  if (main.includes('mist') || main.includes('fog') || main.includes('haze')) return 'mist'
  return 'clear'
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('srw-history') || '[]') }
  catch { return [] }
}

export default function App() {
  const [city,    setCity]    = useState('')
  const [view,    setView]    = useState('weather')
  const [history, setHistory] = useState(loadHistory)
  const [toast,   setToast]   = useState({ open: false, message: '' })
  const [unit,    setUnit]    = useState(() => localStorage.getItem('srw-unit') || 'C')
  const [mode,    setMode]    = useState(() => {
    const saved = localStorage.getItem('srw-mode')
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  const { weather, forecast, hourly, aqi, loading, error, fetchByCity, fetchByCoords } = useWeather()

  const {
    favorites, cache, weatherData,
    loading: favLoading, errors: favErrors,
    addFavorite, removeFavorite, isFavorite, reorder, refreshAll,
  } = useFavorites()

  // Keep <html data-theme> in sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  // Follow system theme if user never manually picked one
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      if (!localStorage.getItem('srw-mode')) setMode(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleUnit = () => {
    setUnit(u => {
      const next = u === 'C' ? 'F' : 'C'
      localStorage.setItem('srw-unit', next)
      return next
    })
  }

  const toggleMode = () => {
    setMode(m => {
      const next = m === 'dark' ? 'light' : 'dark'
      localStorage.setItem('srw-mode', next)
      return next
    })
  }

  const theme = getTheme(weather)

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast.open) return
    const t = setTimeout(() => setToast({ open: false, message: '' }), 2500)
    return () => clearTimeout(t)
  }, [toast.open])

  const addHistory = useCallback((name) => {
    setHistory(prev => {
      const next = [name, ...prev.filter(i => i.toLowerCase() !== name.toLowerCase())].slice(0, 8)
      localStorage.setItem('srw-history', JSON.stringify(next))
      return next
    })
  }, [])

  const handleSearch = async () => {
    const name = await fetchByCity(city)
    if (name) { addHistory(name); setCity(name) }
  }

  const handleSelect = async (name) => {
    setCity(name)
    const result = await fetchByCity(name)
    if (result) addHistory(result)
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setToast({ open: true, message: 'Geolocation not supported by this browser' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const name = await fetchByCoords(coords.latitude, coords.longitude)
        if (name) { addHistory(name); setCity(name) }
      },
      () => setToast({ open: true, message: 'Location access denied' })
    )
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('srw-history')
  }

  const handleToggleFavorite = useCallback(() => {
    if (!weather) return
    const name = weather.name
    if (isFavorite(name)) {
      removeFavorite(name)
      setToast({ open: true, message: `${name} removed from favorites` })
    } else {
      addFavorite(name)
      setToast({ open: true, message: `${name} added to favorites ⭐` })
    }
  }, [weather, isFavorite, addFavorite, removeFavorite])

  const greeting = getGreeting()

  return (
    <div className={`app theme-${theme}`}>
      <div className="app__bg" />
      <div className="app__fx" />

      <main className="app__main">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="app__header">
          <h1 className="app__greeting">
            Hello, there! {greeting.icon} {greeting.text}
          </h1>
          <button className="mode-toggle ripple-host" onClick={toggleMode} onMouseDown={addRipple} aria-label="Toggle dark/light mode">
            {mode === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1"  x2="12" y2="3"/>  <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22"   x2="5.64"  y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1"  y1="12" x2="3"  y2="12"/> <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
                <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

        {/* ── Tab navigation ──────────────────────────────── */}
        <nav className="app__tabs">
          <button
            className={`tab-btn ripple-host${view === 'weather' ? ' tab-btn--active' : ''}`}
            onClick={() => setView('weather')}
            onMouseDown={addRipple}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
            </svg>
            Weather
          </button>
          <button
            className={`tab-btn ripple-host${view === 'favorites' ? ' tab-btn--active' : ''}`}
            onClick={() => setView('favorites')}
            onMouseDown={addRipple}
          >
            <svg viewBox="0 0 24 24" fill={view === 'favorites' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Favorites
            {favorites.length > 0 && (
              <span className="tab-count">{favorites.length}</span>
            )}
          </button>
        </nav>

        {/* ── Weather view ────────────────────────────────── */}
        {view === 'weather' && (
          <div className="app__body">
            <div className="app__content">
              <SearchBar
                value={city}
                onChange={setCity}
                onSearch={handleSearch}
                onGeolocate={handleGeolocate}
                error={error}
                loading={loading}
              />

              {error && !loading && (
                <p className="status-msg status-msg--error">
                  City not found. Check the spelling and try again.
                </p>
              )}

              {loading && (
                <div className="loading-ring">
                  <span className="loading-ring__circle" />
                </div>
              )}

              {!loading && weather && (
                <>
                  <WeatherTip weather={weather} />
                  <WeatherCard
                    weather={weather}
                    unit={unit}
                    onToggleUnit={toggleUnit}
                    isFavorite={isFavorite(weather.name)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                  <HourlyStrip hourly={hourly} unit={unit} />
                  <ForecastStrip forecast={forecast} unit={unit} />
                  <AqiCard aqi={aqi} />
                  <AlertsCard />
                </>
              )}

              {!loading && !weather && !error && (
                <p className="status-msg">Search a city above to see live weather</p>
              )}
            </div>

            <HistorySidebar
              history={history}
              onSelect={handleSelect}
              onClear={handleClearHistory}
            />
          </div>
        )}

        {/* ── Favorites dashboard ─────────────────────────── */}
        {view === 'favorites' && (
          <FavoritesDashboard
            favorites={favorites}
            cache={cache}
            weatherData={weatherData}
            loading={favLoading}
            errors={favErrors}
            unit={unit}
            onRemove={removeFavorite}
            onReorder={reorder}
            onRefresh={refreshAll}
          />
        )}

      </main>

      <footer className="app__footer">
        <p>&#9742;&nbsp;6304580822&nbsp;&nbsp;|&nbsp;&nbsp;&#9993;&nbsp;vennelajanardhan4@gmail.com</p>
        <div className="footer__links">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.whatsapp.com"  target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="https://www.twitter.com"   target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
      </footer>

      <FeedbackPanel
        onSubmit={() => setToast({ open: true, message: 'Report submitted — thanks for the feedback!' })}
      />

      {toast.open && (
        <Toast
          message={toast.message}
          onClose={() => setToast({ open: false, message: '' })}
        />
      )}
    </div>
  )
}
