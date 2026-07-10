// Open-Meteo is free and requires no API key.
// This module adapts its responses into the OpenWeatherMap-shaped objects
// the rest of the app already expects (weather.main.temp, weather.weather[0].icon, etc.)
const GEO_URL      = 'https://geocoding-api.open-meteo.com/v1/search'
const REVERSE_URL  = 'https://api.bigdatacloud.net/data/reverse-geocode-client'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AQI_URL      = 'https://air-quality-api.open-meteo.com/v1/air-quality'

// WMO weather code -> [OWM-style main, description, icon base]
const WMO = {
  0:  ['Clear',       'clear sky',               '01'],
  1:  ['Clouds',      'mainly clear',            '02'],
  2:  ['Clouds',      'partly cloudy',           '03'],
  3:  ['Clouds',      'overcast',                '04'],
  45: ['Fog',         'fog',                     '50'],
  48: ['Fog',         'depositing rime fog',     '50'],
  51: ['Drizzle',     'light drizzle',           '09'],
  53: ['Drizzle',     'moderate drizzle',        '09'],
  55: ['Drizzle',     'dense drizzle',           '09'],
  56: ['Drizzle',     'freezing drizzle',        '09'],
  57: ['Drizzle',     'dense freezing drizzle',  '09'],
  61: ['Rain',        'slight rain',             '10'],
  63: ['Rain',        'moderate rain',           '10'],
  65: ['Rain',        'heavy rain',              '10'],
  66: ['Rain',        'freezing rain',           '13'],
  67: ['Rain',        'heavy freezing rain',     '13'],
  71: ['Snow',        'slight snow fall',        '13'],
  73: ['Snow',        'moderate snow fall',      '13'],
  75: ['Snow',        'heavy snow fall',         '13'],
  77: ['Snow',        'snow grains',             '13'],
  80: ['Rain',        'slight rain showers',     '09'],
  81: ['Rain',        'moderate rain showers',   '09'],
  82: ['Rain',        'violent rain showers',    '09'],
  85: ['Snow',        'slight snow showers',     '13'],
  86: ['Snow',        'heavy snow showers',      '13'],
  95: ['Thunderstorm', 'thunderstorm',           '11'],
  96: ['Thunderstorm', 'thunderstorm with hail', '11'],
  99: ['Thunderstorm', 'thunderstorm with hail', '11'],
}

function describeCode(code, isDay = 1) {
  const [main, description, iconBase] = WMO[code] ?? ['Clear', 'clear sky', '01']
  return { main, description, icon: `${iconBase}${isDay ? 'd' : 'n'}` }
}

// Treats a "local" timestamp string from Open-Meteo (no timezone suffix) as UTC,
// giving a value where reading it back with getUTC* returns the original local clock digits.
function localToEpoch(str) {
  return Math.floor(Date.parse(`${str}Z`) / 1000)
}

// current.time is minute-snapped (e.g. 19:45); hourly.time is on the hour (19:00).
function hourIndex(hourlyTimes, currentTime) {
  const hourKey = currentTime.slice(0, 13)
  return hourlyTimes.findIndex(t => t.slice(0, 13) === hourKey)
}

export async function geocode(cityName) {
  const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`)
  const json = await res.json()
  const r = json.results?.[0]
  if (!r) return null
  return { lat: r.latitude, lon: r.longitude, name: r.name, country: r.country_code ?? '' }
}

export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`${REVERSE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
    const json = await res.json()
    return {
      lat, lon,
      name: json.city || json.locality || json.principalSubdivision || 'My Location',
      country: json.countryCode ?? '',
    }
  } catch {
    return { lat, lon, name: 'My Location', country: '' }
  }
}

export async function fetchWeatherBundle(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure',
    hourly: 'temperature_2m,weather_code,is_day,visibility',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    forecast_days: 6,
    wind_speed_unit: 'ms',
  })
  const res = await fetch(`${FORECAST_URL}?${params}`)
  return res.json()
}

export function buildWeatherJson(geo, data) {
  const offset = data.utc_offset_seconds ?? 0
  const cur = data.current
  const { main, description, icon } = describeCode(cur.weather_code, cur.is_day)
  const hIdx = data.hourly?.time ? hourIndex(data.hourly.time, cur.time) : -1
  const visibility = hIdx >= 0 ? data.hourly.visibility?.[hIdx] : undefined

  return {
    name: geo.name,
    timezone: offset,
    coord: { lat: geo.lat, lon: geo.lon },
    sys: {
      country: geo.country,
      sunrise: localToEpoch(data.daily.sunrise[0]) - offset,
      sunset:  localToEpoch(data.daily.sunset[0])  - offset,
    },
    main: {
      temp: cur.temperature_2m,
      feels_like: cur.apparent_temperature,
      humidity: cur.relative_humidity_2m,
      pressure: Math.round(cur.surface_pressure ?? 0),
      temp_max: data.daily.temperature_2m_max[0],
      temp_min: data.daily.temperature_2m_min[0],
    },
    wind: { speed: cur.wind_speed_10m },
    visibility,
    weather: [{ main, description, icon }],
  }
}

export function buildHourly(data) {
  const offset = data.utc_offset_seconds ?? 0
  const times = data.hourly?.time ?? []
  const start = Math.max(hourIndex(times, data.current.time), 0)
  return times.slice(start, start + 8).map((t, i) => {
    const j = start + i
    const { main, icon } = describeCode(data.hourly.weather_code[j], data.hourly.is_day[j])
    return {
      dt: localToEpoch(t) - offset,
      main: { temp: data.hourly.temperature_2m[j] },
      weather: [{ main, icon }],
    }
  })
}

export function buildForecast(data) {
  const offset = data.utc_offset_seconds ?? 0
  return data.daily.time.slice(0, 5).map((t, i) => {
    const { main, icon } = describeCode(data.daily.weather_code[i], 1)
    return {
      dt: localToEpoch(`${t}T12:00`) - offset,
      main: {
        temp_max: data.daily.temperature_2m_max[i],
        temp_min: data.daily.temperature_2m_min[i],
      },
      weather: [{ main, icon }],
    }
  })
}

export async function fetchAqi(lat, lon) {
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'pm10,pm2_5,ozone,nitrogen_dioxide,european_aqi',
    })
    const res = await fetch(`${AQI_URL}?${params}`)
    const json = await res.json()
    const c = json.current
    if (!c) return null
    const eaqi = c.european_aqi ?? 0
    const level = eaqi <= 20 ? 1 : eaqi <= 40 ? 2 : eaqi <= 60 ? 3 : eaqi <= 80 ? 4 : 5
    return {
      main: { aqi: level },
      components: { pm2_5: c.pm2_5, pm10: c.pm10, o3: c.ozone, no2: c.nitrogen_dioxide },
    }
  } catch {
    return null
  }
}
