import React from 'react'

function getTip(weather) {
  const temp     = weather.main.temp
  const main     = weather.weather[0].main.toLowerCase()
  const windKmh  = (weather.wind?.speed ?? 0) * 3.6
  const humidity = weather.main.humidity

  if (main.includes('thunder'))                              return { icon: '⚡', text: 'Stay indoors — thunderstorm warning.' }
  if (main.includes('snow'))                                 return { icon: '❄️', text: 'Roads may be icy. Drive carefully.' }
  if (main.includes('rain') || main.includes('drizzle'))    return { icon: '☂️', text: 'Carry an umbrella before heading out.' }
  if (main.includes('fog') || main.includes('mist') || main.includes('haze'))
                                                             return { icon: '🌫️', text: 'Low visibility — use headlights while driving.' }
  if (temp >= 35)    return { icon: '🥵', text: 'Extreme heat! Stay hydrated and avoid direct sun.' }
  if (temp >= 28)    return { icon: '🌞', text: 'Hot day ahead. Wear sunscreen and drink plenty of water.' }
  if (temp <= 0)     return { icon: '🥶', text: 'Freezing temperatures outside. Bundle up well.' }
  if (temp <= 10)    return { icon: '🧥', text: 'Cold outside. Wear a warm jacket.' }
  if (windKmh >= 50) return { icon: '💨', text: 'Strong winds expected. Secure loose items outdoors.' }
  if (humidity >= 85) return { icon: '💦', text: 'High humidity today — it may feel warmer than it is.' }
  if (main.includes('clear') && temp >= 18 && temp < 28)
                     return { icon: '😊', text: 'Perfect weather for outdoor activities!' }
  return             { icon: '🌤', text: 'Have a wonderful day!' }
}

export default function WeatherTip({ weather }) {
  if (!weather) return null
  const { icon, text } = getTip(weather)
  return (
    <div className="weather-tip">
      <span className="weather-tip__icon">{icon}</span>
      <span className="weather-tip__text">{text}</span>
    </div>
  )
}
