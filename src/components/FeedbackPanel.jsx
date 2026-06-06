import React, { useState, useRef, useEffect } from 'react'

export default function FeedbackPanel({ onSubmit }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const panelRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!open) return
    textareaRef.current?.focus()
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const handleSubmit = () => {
    if (!text.trim()) return
    onSubmit(text.trim())
    setText('')
    setOpen(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="feedback-wrap" ref={panelRef}>
      {open && (
        <div className="feedback-panel">
          <div className="feedback-panel__header">
            <span className="feedback-panel__title">Send a Report</span>
            <button className="feedback-panel__close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>
          <textarea
            ref={textareaRef}
            className="feedback-panel__textarea"
            placeholder="Describe the issue or share feedback…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={4}
          />
          <p className="feedback-panel__hint">Ctrl + Enter to send</p>
          <button
            className="feedback-panel__submit"
            onClick={handleSubmit}
            disabled={!text.trim()}
          >
            Submit Report
          </button>
        </div>
      )}
      <button
        className={`feedback-btn${open ? ' feedback-btn--active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Send a report"
        title="Send a report"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>
  )
}
