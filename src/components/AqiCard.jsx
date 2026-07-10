import React from 'react'

const LEVELS = [
  { label: 'Good',      color: '#10B981' },
  { label: 'Fair',      color: '#FBBF24' },
  { label: 'Moderate',  color: '#F97316' },
  { label: 'Poor',      color: '#EF4444' },
  { label: 'Very Poor', color: '#7C3AED' },
]

export default function AqiCard({ aqi }) {
  if (!aqi) return null

  const level = LEVELS[aqi.main.aqi - 1]
  const { pm2_5, pm10, o3, no2 } = aqi.components

  return (
    <div className="aqi-card" style={{ borderColor: level.color }}>
      <div className="aqi-card__header">
        <span className="aqi-card__title">Air Quality Index</span>
        <span className="aqi-card__badge" style={{ background: level.color }}>
          {level.label}
        </span>
      </div>
      <div className="aqi-card__stats">
        {[
          { label: 'PM2.5', value: pm2_5 },
          { label: 'PM10',  value: pm10 },
          { label: 'O₃',    value: o3 },
          { label: 'NO₂',   value: no2 },
        ].map(({ label, value }) => (
          <div className="aqi-stat" key={label}>
            <span className="aqi-stat__label">{label}</span>
            <span className="aqi-stat__value">{value != null ? value.toFixed(1) : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
