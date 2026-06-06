import React from 'react'

export default function HistorySidebar({ history, onSelect, onClear }) {
  return (
    <aside className="history-sidebar">
      <div className="history-sidebar__head">
        <span className="history-sidebar__title">Recent</span>
        {history.length > 0 && (
          <button className="history-clear-btn" onClick={onClear}>Clear</button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="history-empty">No searches yet</p>
      ) : (
        <ul className="history-list">
          {history.map(item => (
            <li key={item}>
              <button className="history-item" onClick={() => onSelect(item)}>
                <svg className="history-item__pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
