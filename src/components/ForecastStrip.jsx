import React from 'react'

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ForecastStrip({ forecast, unit }) {
  if (!forecast.length) return null

  const toDisplay = (c) => unit === 'F' ? Math.round(c * 9 / 5 + 32) : Math.round(c)
  const symbol    = unit === 'F' ? '°F' : '°C'

  return (
    <div className="forecast-strip">
      <p className="strip-label">5-Day Forecast</p>
      <div className="forecast-scroll">
        {forecast.map(item => {
          const date = new Date(item.dt * 1000)
          return (
            <div className="forecast-day" key={item.dt}>
              <span className="forecast-day__name">{DAY[date.getDay()]}</span>
              <img
                className="forecast-day__icon"
                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                alt={item.weather[0].main}
              />
              <span className="forecast-day__cond">{item.weather[0].main}</span>
              <span className="forecast-day__high">{toDisplay(item.main.temp_max)}{symbol}</span>
              <span className="forecast-day__low">{toDisplay(item.main.temp_min)}{symbol}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
