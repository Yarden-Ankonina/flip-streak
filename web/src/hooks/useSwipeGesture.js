import { useRef, useCallback } from 'react'

export function useSwipeGesture(onPan, onFlick) {
  const touchStartRef = useRef(null)
  const touchStartTimeRef = useRef(null)
  const lastTouchRef = useRef(null)
  const isPanningRef = useRef(false)

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
    isPanningRef.current = false
    
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
    
    // If moved enough, start panning
    if (distance > 2) {
      isPanningRef.current = true
      
      // Convert screen movement to 3D rotation
      // Horizontal movement = Y-axis rotation (left/right)
      // Vertical movement = X-axis rotation (up/down)
      // Also calculate Z-axis rotation based on circular motion
      
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      // Calculate rotation deltas
      // Map screen movement to 3D rotation (sensitivity factor)
      const sensitivity = 0.01
      const rotationY = deltaX * sensitivity // Horizontal drag = Y rotation
      const rotationX = -deltaY * sensitivity // Vertical drag = X rotation (inverted)
      
      // Z-axis rotation from circular motion around center
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
      const rotationZ = deltaAngle * 0.5 // Scale for Z rotation
      
      // Call pan callback with rotation deltas (direct rotation, no velocity)
      if (onPan) {
        onPan({
          rotationX,
          rotationY,
          rotationZ,
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
  }, [onPan])

  const handleTouchEnd = useCallback((e) => {
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
    
    // Flick detection: quick upward swipe (only if not panning)
    const minFlickDistance = 30 // pixels
    const minFlickVelocity = 400 // pixels per second
    const isVerticalFlick = Math.abs(deltaY) > Math.abs(deltaX) * 1.5 // More vertical than horizontal
    const isUpwardFlick = deltaY < -20 // Must be upward
    
    // Only trigger flick if:
    // 1. Not panning (was a quick gesture)
    // 2. Fast enough
    // 3. Vertical and upward
    if (!isPanningRef.current && 
        distance > minFlickDistance && 
        velocity > minFlickVelocity && 
        isVerticalFlick &&
        isUpwardFlick &&
        onFlick) {
      
      // Heavy haptic feedback on flick
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(50)
      }
      
      onFlick({
        velocity,
        direction: 'up',
        deltaY,
      })
    }
    
    // Reset
    touchStartRef.current = null
    lastTouchRef.current = null
    touchStartTimeRef.current = null
    isPanningRef.current = false
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
    isPanningRef.current = false
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!touchStartRef.current || !lastTouchRef.current) return
    e.preventDefault()
    
    const currentX = e.clientX
    const currentY = e.clientY
    
    const deltaX = currentX - lastTouchRef.current.x
    const deltaY = currentY - lastTouchRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance > 2) {
      isPanningRef.current = true
      
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      const sensitivity = 0.01
      const rotationY = deltaX * sensitivity
      const rotationX = -deltaY * sensitivity
      
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
      const rotationZ = deltaAngle * 0.5
      
      if (onPan) {
        onPan({
          rotationX,
          rotationY,
          rotationZ,
          deltaX,
          deltaY,
          x: currentX,
          y: currentY,
        })
      }
    }
    
    lastTouchRef.current = { x: currentX, y: currentY }
  }, [onPan])

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
    const isUpwardFlick = deltaY < -20
    
    if (!isPanningRef.current && 
        distance > minFlickDistance && 
        velocity > minFlickVelocity && 
        isVerticalFlick &&
        isUpwardFlick &&
        onFlick) {
      onFlick({
        velocity,
        direction: 'up',
        deltaY,
      })
    }
    
    touchStartRef.current = null
    lastTouchRef.current = null
    touchStartTimeRef.current = null
    isPanningRef.current = false
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
