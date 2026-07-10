import { useState, useEffect, useCallback, useRef } from 'react'
import { geocode, fetchWeatherBundle, buildWeatherJson } from '../api/openMeteo'

const TTL  = 5 * 60 * 1000   // 5-minute cache TTL
const LS_LIST  = 'srw-favorites'
const LS_CACHE = 'srw-fav-cache'

const persist = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const restore = (k, fb) => { try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? fb } catch { return fb } }

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => restore(LS_LIST, []))
  const [cache,     setCache]     = useState(() => restore(LS_CACHE, {}))
  const [loading,   setLoading]   = useState({})
  const [errors,    setErrors]    = useState({})

  // Mutable refs so callbacks read current values without becoming deps
  const cacheRef = useRef(cache)
  const favRef   = useRef(favorites)
  const pending  = useRef({})   // in-flight guard

  useEffect(() => { favRef.current = favorites; persist(LS_LIST, favorites) },  [favorites])
  useEffect(() => { cacheRef.current = cache;   persist(LS_CACHE, cache) }, [cache])

  // ── Core fetch (stable — no deps) ─────────────────────────
  const fetchWeather = useCallback(async (city, force = false) => {
    if (!city || pending.current[city]) return
    const now    = Date.now()
    const cached = cacheRef.current[city]
    if (!force && cached && now - cached.fetchedAt < TTL) return

    pending.current[city] = true
    setLoading(l => ({ ...l, [city]: true }))
    setErrors(e => { const n = { ...e }; delete n[city]; return n })

    try {
      const geo = await geocode(city)
      if (!geo) throw new Error('City not found')
      const bundle = await fetchWeatherBundle(geo.lat, geo.lon)
      const data  = buildWeatherJson(geo, bundle)
      const entry = { weather: data, fetchedAt: now }
      cacheRef.current = { ...cacheRef.current, [city]: entry }
      setCache(c => ({ ...c, [city]: entry }))
    } catch (err) {
      setErrors(e => ({ ...e, [city]: err.message }))
    } finally {
      delete pending.current[city]
      setLoading(l => { const n = { ...l }; delete n[city]; return n })
    }
  }, [])  // stable — reads via refs

  // ── Internal refresh (stable) ──────────────────────────────
  const _refresh = useCallback((force = false) => {
    favRef.current.forEach(city => fetchWeather(city, force))
  }, [fetchWeather])

  // ── Fetch missing/stale cities when list changes ───────────
  useEffect(() => {
    favorites.forEach(city => fetchWeather(city))
  }, [favorites, fetchWeather])

  // ── Auto-refresh every 5 min ───────────────────────────────
  useEffect(() => {
    const id = setInterval(() => _refresh(true), TTL)
    return () => clearInterval(id)
  }, [_refresh])

  // ── CRUD ───────────────────────────────────────────────────
  const addFavorite = useCallback((city) => {
    setFavorites(prev =>
      prev.some(c => c.toLowerCase() === city.toLowerCase()) ? prev : [...prev, city]
    )
  }, [])

  const removeFavorite = useCallback((city) => {
    setFavorites(prev => prev.filter(c => c.toLowerCase() !== city.toLowerCase()))
  }, [])

  const isFavorite = useCallback((city = '') =>
    favRef.current.some(c => c.toLowerCase() === city.toLowerCase()),
  [])  // reads via ref — stable

  const reorder = useCallback((fromIdx, toIdx) => {
    setFavorites(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  const refreshAll = useCallback(() => _refresh(true), [_refresh])

  // ── Derived weather map ────────────────────────────────────
  const weatherData = Object.fromEntries(
    favorites.map(city => [city, cache[city]?.weather ?? null])
  )

  return {
    favorites,
    cache,           // { [city]: { weather, fetchedAt } }
    weatherData,
    loading,         // { [city]: true } while in-flight
    errors,          // { [city]: message }
    addFavorite,
    removeFavorite,
    isFavorite,
    reorder,
    refreshAll,
  }
}
