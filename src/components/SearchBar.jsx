import React, { useRef, useEffect } from 'react'

export default function SearchBar({ value, onChange, onSearch, onGeolocate, error, loading }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (!error) return
    const el = inputRef.current
    if (!el) return
    el.classList.remove('shake')
    void el.offsetWidth
    el.classList.add('shake')
  }, [error])

  return (
    <div className="search-wrapper">
      <div className="search-input-wrap">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Search for a city..."
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          aria-label="City name"
        />
      </div>
      <button className="search-btn" onClick={onSearch} disabled={loading} aria-label="Search">
        {loading ? <span className="spinner" /> : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span className="search-btn__label">Search</span>
          </>
        )}
      </button>
      <button className="geo-btn" onClick={onGeolocate} aria-label="Use my location" title="Use my location">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" strokeDasharray="3 4" strokeOpacity="0.5"/>
        </svg>
      </button>
    </div>
  )
}
