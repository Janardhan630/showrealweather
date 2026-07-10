// Material-style click ripple. Attach via onMouseDown={addRipple} to any
// button with position:relative and overflow:hidden (see .ripple-host in App.css).
export function addRipple(e) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2
  const span = document.createElement('span')
  span.className = 'ripple'
  span.style.width = span.style.height = `${size}px`
  span.style.left = `${e.clientX - rect.left - size / 2}px`
  span.style.top  = `${e.clientY - rect.top  - size / 2}px`
  el.appendChild(span)
  span.addEventListener('animationend', () => span.remove())
}
