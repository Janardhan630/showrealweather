import React from 'react'
import { useState, useRef, useEffect } from 'react'
import backgroundImg from './weather.jpg'
export default function App() {
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState({})
  const [searchHistory, setSearchHistory] = useState([]);
  const [reportToast, setReportToast] = useState({ open: false, message: "" });
  const dropdownRef = useRef(null);
  const getWeather = (cityToSearch = city) => {
    const safeCity = typeof cityToSearch === "string" ? cityToSearch : city;
    const trimmedCity = safeCity.trim();
    if (!trimmedCity) return;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${trimmedCity}&appid=2d53650153839110beb7bb45ebcf13a8&units=metric`)
      .then(res => res.json())
      // .then(json=>console.log(json.data))
      // .then(json => setWeather(json.main))
      .then(json => {
        const input = document.querySelector('.search-bar');
        if (Number(json.cod) === 404) {
          setError(true);
          setWeather({});
          if (input) {
          input.classList.remove('shake'); // ✅ Remove class to restart animation
          void input.offsetWidth;          // ✅ Force reflow
          input.classList.add('shake');    // ✅ Add shake class
        }
        } else {
          setError(false);
          setWeather(json.main);
          const locationLabel = json.name || trimmedCity;
          setSearchHistory((prev) => {
            const next = [locationLabel, ...prev.filter((item) => item.toLowerCase() !== locationLabel.toLowerCase())];
            return next.slice(0, 8);
          });
        }
      })
      .catch(()=>setError(true));
  }
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);

      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!reportToast.open) return;
    const timer = setTimeout(() => {
      setReportToast({ open: false, message: "" });
    }, 2200);
    return () => clearTimeout(timer);
  }, [reportToast.open]);

  const handleClick = (item) => {
    setOpen(!open);
    const textArea = document.querySelector('.text-area');
    if (textArea) {
      if (textArea.style.display === 'block') {
        textArea.style.display = 'none';
      } else {
        textArea.style.display = 'block';
      }
    }
    // if (open) {
    //   textArea.style.display = 'none';
    // } else {
    //   textArea.style.display = 'block';
    // }

  }
  const handleSubmit = () => {
    const textArea = document.querySelector('.text-area');
    const textareaField = textArea?.querySelector('textarea');
    if (textareaField) textareaField.value = ''; // clear textarea
    if (textArea) textArea.style.display = 'none'; // hide textarea
    setReportToast({ open: true, message: "Report submitted" });
    // // alert(`Report Submitted: ${report}`);
    // setReport(""); // clear textarea
    // setOpen(false); // close textarea

  };

  return (
    <>
      <div>
        <div className='background'></div>
        <aside className='history-sidebar'>
          <h3>Search History</h3>
          {searchHistory.length === 0 ? (
            <p className='history-empty'>No locations searched yet</p>
          ) : (
            <ul>
              {searchHistory.map((item) => (
                <li key={item}>
                  <button
                    type='button'
                    className='history-item'
                    onClick={() => {
                      setCity(item);
                      getWeather(item);
                    }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <div className='container'>
          <div className='inner-container'>
            <input
            className={`search-bar ${error ? "error" : ""}`}

            // className={'search-bar ${error ? "error" : ""}'}
            type="text"
            placeholder='Enter Your City'
            value={city}
            onChange={(e) => setCity(e.target.value)}
          /><br />
          <button className='search-bt' onClick={() => getWeather()}>Search Icon</button>

          {weather && (
            <div className='details'>
              <p>🌡 Temperature: {weather.temp} °C</p>
              <p>🤗 Feels Like: {weather.feels_like} °C</p>
              <p>💧 Humidity: {weather.humidity} %</p>
              <p>📊 Pressure: {weather.pressure} hPa</p>
              <p>⬆️ Max Temp: {weather.temp_max} °C</p>
              <p>⬇️ Min Temp: {weather.temp_min} °C</p>
            </div>
          )}
          </div>
        </div>
        {reportToast.open && (
          <div className='report-toast' role="status" aria-live="polite">
            <span className='report-toast__text'>{reportToast.message}</span>
            <button
              className='report-toast__close'
              type="button"
              onClick={() => setReportToast({ open: false, message: "" })}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <div className='#'><button className='help-bt' onClick={handleClick}></button></div>
        <div className='text-area'><textarea></textarea><br /><button className='text-sub-bt' onClick={handleSubmit}>Submit</button></div>
        <footer>
          <p>Call Us:&nbsp;&#9742;&nbsp;&nbsp;6304580822&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Email Us:&nbsp;&#9993;&nbsp;&nbsp;vennelajanardhan4@gmail.com</p>
          <a href='https://www.instagram.com'>Instagram📷</a>&nbsp;&nbsp;
          <a href='https://www.whatsapp.com'>Whatspp-🗨️</a>&nbsp;&nbsp;
          <a href='https://www.twitter.com'>Twitter-☁️</a>
        </footer>
      </div>
    </>
  )
}
