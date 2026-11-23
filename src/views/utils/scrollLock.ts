let activeLocks = 0
let previousBodyOverflow = ''
let previousBodyPaddingRight = ''

export function lockBodyScroll(): () => void {
  if (activeLocks === 0) {
    const body = document.body
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const paddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0

    previousBodyOverflow = body.style.overflow
    previousBodyPaddingRight = body.style.paddingRight
    body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${paddingRight + scrollbarWidth}px`
    }
  }

  activeLocks += 1

  let unlocked = false
  return () => {
    if (unlocked) return
    unlocked = true
    activeLocks -= 1

    if (activeLocks === 0) {
      const body = document.body
      body.style.overflow = previousBodyOverflow
      body.style.paddingRight = previousBodyPaddingRight
    }
  }
}
