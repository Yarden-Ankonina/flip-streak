import { useRef, useCallback } from 'react'

export function useSwipeGesture(onDrag, onFlick) {
  const touchStartRef = useRef(null)
  const touchStartTimeRef = useRef(null)
  const lastTouchRef = useRef(null)
  const isDraggingRef = useRef(false)

  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (!touch) return
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
    lastTouchRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
    touchStartTimeRef.current = Date.now()
    isDraggingRef.current = false
    
    // Light haptic feedback on touch start
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(10)
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    if (!touchStartRef.current || !lastTouchRef.current) return
    
    const touch = e.touches[0]
    if (!touch) return
    
    const currentX = touch.clientX
    const currentY = touch.clientY
    
    // Calculate movement from last position
    const deltaX = currentX - lastTouchRef.current.x
    const deltaY = currentY - lastTouchRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // If moved enough, start dragging
    if (distance > 5) {
      isDraggingRef.current = true
      
      // Calculate rotation angle based on finger movement
      // Convert screen movement to rotation around Z-axis (spinning)
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      // Calculate angle from center to current touch
      const angle1 = Math.atan2(
        lastTouchRef.current.y - centerY,
        lastTouchRef.current.x - centerX
      )
      const angle2 = Math.atan2(
        currentY - centerY,
        currentX - centerX
      )
      
      // Delta angle for rotation
      let deltaAngle = angle2 - angle1
      
      // Normalize to [-PI, PI]
      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI
      
      // Call drag callback with rotation delta
      if (onDrag && Math.abs(deltaAngle) > 0.005) {
        onDrag({
          deltaAngle,
          deltaX,
          deltaY,
          x: currentX,
          y: currentY,
        })
      }
    }
    
    // Update last position
    lastTouchRef.current = {
      x: currentX,
      y: currentY,
    }
  }, [onDrag])

  const handleTouchEnd = useCallback((e) => {
    console.log('👆 TOUCH END');
    if (!touchStartRef.current) return
    
    e.preventDefault()
    const touch = e.changedTouches[0]
    if (!touch) return
    
    const touchEnd = {
      x: touch.clientX,
      y: touch.clientY,
    }
    
    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartTimeRef.current
    
    // Calculate velocity
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = deltaTime > 0 ? distance / (deltaTime / 1000) : 0
    
    // Flick detection: quick vertical swipe (up or down)
    const minFlickDistance = 30 // pixels
    const minFlickVelocity = 400 // pixels per second (faster for flick)
    const isVerticalFlick = Math.abs(deltaY) > Math.abs(deltaX) * 1.5 // More vertical than horizontal
    
    // If it was a quick vertical swipe, treat it as a flick
    if (!isDraggingRef.current && 
        distance > minFlickDistance && 
        velocity > minFlickVelocity && 
        isVerticalFlick &&
        onFlick) {
      const direction = deltaY < 0 ? 'up' : 'down'
      
      onFlick({
        velocity,
        direction,
        deltaY,
      })
    }
    
    // Reset
    touchStartRef.current = null
    lastTouchRef.current = null
    touchStartTimeRef.current = null
    isDraggingRef.current = false
  }, [onFlick])

  // Mouse support for desktop
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
    }
    lastTouchRef.current = {
      x: e.clientX,
      y: e.clientY,
    }
    touchStartTimeRef.current = Date.now()
    isDraggingRef.current = false
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!touchStartRef.current || !lastTouchRef.current) return
    e.preventDefault()
    
    const currentX = e.clientX
    const currentY = e.clientY
    
    const deltaX = currentX - lastTouchRef.current.x
    const deltaY = currentY - lastTouchRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance > 5) {
      isDraggingRef.current = true
      
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      const angle1 = Math.atan2(
        lastTouchRef.current.y - centerY,
        lastTouchRef.current.x - centerX
      )
      const angle2 = Math.atan2(
        currentY - centerY,
        currentX - centerX
      )
      
      let deltaAngle = angle2 - angle1
      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI
      
      if (onDrag && Math.abs(deltaAngle) > 0.01) {
        onDrag({
          deltaAngle,
          deltaX,
          deltaY,
          x: currentX,
          y: currentY,
        })
      }
    }
    
    lastTouchRef.current = { x: currentX, y: currentY }
  }, [onDrag])

  const handleMouseUp = useCallback((e) => {
    if (!touchStartRef.current) return
    e.preventDefault()
    
    const touchEnd = {
      x: e.clientX,
      y: e.clientY,
    }
    
    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartTimeRef.current
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = deltaTime > 0 ? distance / (deltaTime / 1000) : 0
    
    const minFlickDistance = 30
    const minFlickVelocity = 400
    const isVerticalFlick = Math.abs(deltaY) > Math.abs(deltaX) * 1.5
    
    if (!isDraggingRef.current && 
        distance > minFlickDistance && 
        velocity > minFlickVelocity && 
        isVerticalFlick &&
        onFlick) {
      const direction = deltaY < 0 ? 'up' : 'down'
      onFlick({
        velocity,
        direction,
        deltaY,
      })
    }
    
    touchStartRef.current = null
    lastTouchRef.current = null
    touchStartTimeRef.current = null
    isDraggingRef.current = false
  }, [onFlick])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
  }
}
