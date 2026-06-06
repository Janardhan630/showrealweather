import React, { useState, useEffect, useCallback } from 'react'
import { useWeather } from './hooks/useWeather'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import ForecastStrip from './components/ForecastStrip'
import HistorySidebar from './components/HistorySidebar'
import Toast from './components/Toast'
import FeedbackPanel from './components/FeedbackPanel'
import HourlyStrip from './components/HourlyStrip'
import AqiCard from './components/AqiCard'
import WeatherTip from './components/WeatherTip'
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
  if (main.includes('snow')) return 'snow'
  if (main.includes('rain') || main.includes('drizzle')) return 'rain'
  if (main.includes('cloud')) return 'clouds'
  if (main.includes('mist') || main.includes('fog') || main.includes('haze')) return 'mist'
  return 'clear'
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('srw-history') || '[]') }
  catch { return [] }
}

export default function App() {
  const [city, setCity] = useState('')
  const [history, setHistory] = useState(loadHistory)
  const [toast, setToast] = useState({ open: false, message: '' })
  const [unit, setUnit] = useState(() => localStorage.getItem('srw-unit') || 'C')
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('srw-mode')
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })
  const { weather, forecast, hourly, aqi, loading, error, fetchByCity, fetchByCoords } = useWeather()

  // Keep <html data-theme> in sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  // Follow system theme if user never manually picked one
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      if (!localStorage.getItem('srw-mode')) {
        setMode(e.matches ? 'dark' : 'light')
      }
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

  return (
    <div className={`app theme-${theme}`}>
      <div className="app__bg" />

      <main className="app__main">
        <div className="app__header">
          <h1 className="app__greeting">
            Hello, there! {getGreeting().icon} {getGreeting().text}
          </h1>
          <button className="mode-toggle" onClick={toggleMode} aria-label="Toggle dark/light mode">
            {mode === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

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
                <WeatherCard weather={weather} unit={unit} onToggleUnit={toggleUnit} />
                <HourlyStrip hourly={hourly} unit={unit} />
                <ForecastStrip forecast={forecast} unit={unit} />
                <AqiCard aqi={aqi} />
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
      </main>

      <footer className="app__footer">
        <p>&#9742;&nbsp;6304580822&nbsp;&nbsp;|&nbsp;&nbsp;&#9993;&nbsp;vennelajanardhan4@gmail.com</p>
        <div className="footer__links">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.whatsapp.com" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
      </footer>

      <FeedbackPanel
        onSubmit={(msg) => setToast({ open: true, message: `Report submitted — thanks for the feedback!` })}
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
