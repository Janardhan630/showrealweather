import React from 'react'

export default function Toast({ message, onClose }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast__msg">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close">×</button>
    </div>
  )
}
