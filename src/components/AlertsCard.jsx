import React from 'react'

export default function AlertsCard() {
  return (
    <div className="alerts-card">
      <span className="alerts-card__icon">🛡️</span>
      <div className="alerts-card__body">
        <span className="alerts-card__title">No active weather alerts</span>
        <span className="alerts-card__sub">Live severe-weather alerts — coming soon</span>
      </div>
      <span className="alerts-card__soon">Soon</span>
    </div>
  )
}
