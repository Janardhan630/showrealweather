import { useState, useCallback } from 'react'
import {
  geocode, reverseGeocode, fetchWeatherBundle,
  buildWeatherJson, buildHourly, buildForecast, fetchAqi,
} from '../api/openMeteo'

export function useWeather() {
  const [weather,  setWeather]  = useState(null)
  const [forecast, setForecast] = useState([])
  const [hourly,   setHourly]   = useState([])
  const [aqi,      setAqi]      = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(false)

  const applyData = async (geo, data) => {
    const wJson = buildWeatherJson(geo, data)
    setWeather(wJson)
    setForecast(buildForecast(data))
    setHourly(buildHourly(data))
    const aqiData = await fetchAqi(geo.lat, geo.lon)
    setAqi(aqiData)
    return wJson.name
  }

  const fetchByCity = useCallback(async (city) => {
    if (!city.trim()) return null
    setLoading(true)
    setError(false)
    try {
      const geo = await geocode(city)
      if (!geo) {
        setError(true)
        setWeather(null)
        setForecast([])
        setHourly([])
        setAqi(null)
        return null
      }
      const data = await fetchWeatherBundle(geo.lat, geo.lon)
      return await applyData(geo, data)
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
      const [geo, data] = await Promise.all([
        reverseGeocode(lat, lon),
        fetchWeatherBundle(lat, lon),
      ])
      return await applyData(geo, data)
    } catch {
      setError(true)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { weather, forecast, hourly, aqi, loading, error, fetchByCity, fetchByCoords }
}
