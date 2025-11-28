import { useRef, useCallback, useEffect } from 'react'

interface PanInfo {
  deltaX: number
  deltaY: number
  x: number
  y: number
}

interface FlickInfo {
  velocity: number
  direction: 'up' | 'down'
  deltaY: number
}

export function useSwipeGesture(
  onPan: ((panInfo: PanInfo) => void) | null,
  onFlick: ((flickInfo: FlickInfo) => void) | null,
  onTouchEnd: (() => void) | null
) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const touchStartTimeRef = useRef<number | null>(null)
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null)
  const isPanningRef = useRef(false)
  const panDistanceRef = useRef(0) // Track total pan distance
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    console.log('[useSwipeGesture] Touch start');
    e.preventDefault()
    const touch = e.touches[0]
    if (!touch) {
      console.warn('[useSwipeGesture] No touch found');
      return
    }
    
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
    panDistanceRef.current = 0
    
    console.log('[useSwipeGesture] Touch start position:', touchStartRef.current);
    
    // Light haptic feedback on touch start
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(10)
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    if (!touchStartRef.current || !lastTouchRef.current) {
      console.warn('[useSwipeGesture] Touch move but no start position');
      return
    }
    
    const touch = e.touches[0]
    if (!touch) {
      console.warn('[useSwipeGesture] Touch move but no touch');
      return
    }
    
    const currentX = touch.clientX
    const currentY = touch.clientY
    
    // Calculate movement from last position
    const deltaX = currentX - lastTouchRef.current.x
    const deltaY = currentY - lastTouchRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // If moved enough, start panning (translation only, no rotation)
    if (distance > 2) {
      isPanningRef.current = true
      panDistanceRef.current += distance
      
      // Convert screen movement to 3D translation (not rotation)
      // Map screen pixels to 3D world units
      const sensitivity = 0.01 // Adjust for feel
      const translationX = deltaX * sensitivity
      const translationY = -deltaY * sensitivity // Invert Y for natural movement
      
      console.log('[useSwipeGesture] Pan detected:', {
        deltaX,
        deltaY,
        distance,
        translationX,
        translationY,
        hasOnPan: !!onPan,
      });
      
      // Call pan callback with translation deltas
      if (onPan) {
        onPan({
          deltaX: translationX,
          deltaY: translationY,
          x: currentX,
          y: currentY,
        })
      } else {
        console.warn('[useSwipeGesture] onPan callback is null!');
      }
    }
    
    // Update last position
    lastTouchRef.current = {
      x: currentX,
      y: currentY,
    }
  }, [onPan])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
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
    const deltaTime = Date.now() - (touchStartTimeRef.current || 0)
    
    // Calculate velocity
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = deltaTime > 0 ? distance / (deltaTime / 1000) : 0
    
    // Flick detection: quick upward swipe
    const minFlickDistance = 20 // pixels
    const minFlickVelocity = 300 // pixels per second
    const isVerticalFlick = Math.abs(deltaY) > Math.abs(deltaX) * 1.2
    const isUpwardFlick = deltaY < -15
    
    const wasQuickGesture = velocity > minFlickVelocity
    const wasMinimalPan = panDistanceRef.current < 50
    
    if (wasQuickGesture && 
        distance > minFlickDistance && 
        isVerticalFlick &&
        isUpwardFlick &&
        (wasMinimalPan || velocity > 600) &&
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
    } else if (onTouchEnd) {
      // Not a flick, trigger snap back
      onTouchEnd()
    }
    
    // Reset
    touchStartRef.current = null
    lastTouchRef.current = null
    touchStartTimeRef.current = null
    isPanningRef.current = false
    panDistanceRef.current = 0
  }, [onFlick, onTouchEnd])

  // Mouse support for desktop
  const handleMouseDown = useCallback((e: MouseEvent) => {
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
    panDistanceRef.current = 0
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!touchStartRef.current || !lastTouchRef.current) return
    e.preventDefault()
    
    const currentX = e.clientX
    const currentY = e.clientY
    
    const deltaX = currentX - lastTouchRef.current.x
    const deltaY = currentY - lastTouchRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance > 2) {
      isPanningRef.current = true
      panDistanceRef.current += distance
      
      const sensitivity = 0.01
      const translationX = deltaX * sensitivity
      const translationY = -deltaY * sensitivity
      
      if (onPan) {
        onPan({
          deltaX: translationX,
          deltaY: translationY,
          x: currentX,
          y: currentY,
        })
      }
    }
    
    lastTouchRef.current = { x: currentX, y: currentY }
  }, [onPan])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!touchStartRef.current) return
    e.preventDefault()
    
    const touchEnd = {
      x: e.clientX,
      y: e.clientY,
    }
    
    const deltaX = touchEnd.x - touchStartRef.current.x
    const deltaY = touchEnd.y - touchStartRef.current.y
    const deltaTime = Date.now() - (touchStartTimeRef.current || 0)
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = deltaTime > 0 ? distance / (deltaTime / 1000) : 0
    
    const minFlickDistance = 20
    const minFlickVelocity = 300
    const isVerticalFlick = Math.abs(deltaY) > Math.abs(deltaX) * 1.2
    const isUpwardFlick = deltaY < -15
    const wasQuickGesture = velocity > minFlickVelocity
    const wasMinimalPan = panDistanceRef.current < 50
    
    if (wasQuickGesture && 
        distance > minFlickDistance && 
        isVerticalFlick &&
        isUpwardFlick &&
        (wasMinimalPan || velocity > 600) &&
        onFlick) {
      onFlick({
        velocity,
        direction: 'up',
        deltaY,
      })
    } else if (onTouchEnd) {
      onTouchEnd()
    }
    
    touchStartRef.current = null
    lastTouchRef.current = null
    touchStartTimeRef.current = null
    isPanningRef.current = false
    panDistanceRef.current = 0
  }, [onFlick, onTouchEnd])

  // Use useEffect to attach touch listeners with passive: false
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Add touch listeners with passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    containerRef,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
  }
}

