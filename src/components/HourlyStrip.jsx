import React from 'react'

export default function HourlyStrip({ hourly, unit }) {
  if (!hourly.length) return null

  const toDisplay = (c) => unit === 'F' ? Math.round(c * 9 / 5 + 32) : Math.round(c)
  const symbol = unit === 'F' ? '°F' : '°C'

  return (
    <div className="hourly-strip">
      <p className="strip-label">Hourly</p>
      <div className="hourly-scroll">
        {hourly.map(item => {
          const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          return (
            <div className="hourly-item" key={item.dt}>
              <span className="hourly-item__time">{time}</span>
              <img
                className="hourly-item__icon"
                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                alt={item.weather[0].main}
              />
              <span className="hourly-item__temp">{toDisplay(item.main.temp)}{symbol}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
