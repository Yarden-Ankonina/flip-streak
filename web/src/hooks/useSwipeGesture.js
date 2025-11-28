import { useRef, useCallback } from 'react'

export function useSwipeGesture(onSwipe) {
  const touchStartRef = useRef(null)
  const touchStartTimeRef = useRef(null)

  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
    touchStartTimeRef.current = Date.now()
    
    // Light haptic feedback on touch start
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(10) // 10ms light vibration
    }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return
    
    e.preventDefault()
    const touch = e.changedTouches[0]
    const touchEnd = {
      x: touch.clientX,
      y: touch.clientY,
    }
    
    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartTimeRef.current
    
    // Calculate velocity (pixels per second)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / (deltaTime / 1000)
    
    // Only trigger if swipe is significant (minimum distance and speed)
    const minSwipeDistance = 30 // pixels
    const minSwipeVelocity = 200 // pixels per second
    
    if (distance > minSwipeDistance && velocity > minSwipeVelocity) {
      // Determine swipe direction (upward swipe for flip)
      const isUpwardSwipe = deltaY < -50 && Math.abs(deltaY) > Math.abs(deltaX)
      
      if (isUpwardSwipe && onSwipe) {
        onSwipe({
          velocity,
          direction: 'up',
          deltaX,
          deltaY,
        })
      }
    }
    
    touchStartRef.current = null
    touchStartTimeRef.current = null
  }, [onSwipe])

  const handleTouchMove = useCallback((e) => {
    // Prevent scrolling while swiping
    e.preventDefault()
  }, [])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  }
}

