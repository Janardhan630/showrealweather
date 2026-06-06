import { useState, useCallback } from 'react'

const BASE = 'https://api.openweathermap.org/data/2.5'

function key() {
  return import.meta.env.VITE_OWM_API_KEY
}

function parseForecast(list) {
  const days = {}
  list.forEach(item => {
    const date = item.dt_txt.split(' ')[0]
    const hour = item.dt_txt.split(' ')[1]
    if (!days[date]) days[date] = item
    if (hour === '12:00:00') days[date] = item
  })
  return Object.values(days).slice(0, 5)
}

async function fetchAqi(lat, lon) {
  try {
    const res = await fetch(`${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${key()}`)
    const json = await res.json()
    return json.list?.[0] ?? null
  } catch {
    return null
  }
}

export function useWeather() {
  const [weather,  setWeather]  = useState(null)
  const [forecast, setForecast] = useState([])
  const [hourly,   setHourly]   = useState([])
  const [aqi,      setAqi]      = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(false)

  const applyData = async (wJson, fJson) => {
    setWeather(wJson)
    setForecast(fJson?.list ? parseForecast(fJson.list) : [])
    setHourly(fJson?.list ? fJson.list.slice(0, 8) : [])
    const aqiData = await fetchAqi(wJson.coord.lat, wJson.coord.lon)
    setAqi(aqiData)
    return wJson.name
  }

  const fetchByCity = useCallback(async (city) => {
    if (!city.trim()) return null
    setLoading(true)
    setError(false)
    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&appid=${key()}&units=metric`),
        fetch(`${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${key()}&units=metric`),
      ])
      const wJson = await wRes.json()
      const fJson = await fRes.json()
      if (Number(wJson.cod) === 404) {
        setError(true)
        setWeather(null)
        setForecast([])
        setHourly([])
        setAqi(null)
        return null
      }
      return await applyData(wJson, fJson)
    } catch {
      setError(true)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchByCoords = useCallback(async (lat, lon) => {
    setLoading(true)
    setError(false)
    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&appid=${key()}&units=metric`),
        fetch(`${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${key()}&units=metric`),
      ])
      const wJson = await wRes.json()
      const fJson = await fRes.json()
      return await applyData(wJson, fJson)
    } catch {
      setError(true)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { weather, forecast, hourly, aqi, loading, error, fetchByCity, fetchByCoords }
}
