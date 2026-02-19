import { useEffect, useRef, useState, useCallback } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  reRenderCount: number
  memoryUsage?: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift?: number
}

interface PerformanceEntry {
  name: string
  startTime: number
  duration: number
  type: 'render' | 'api' | 'image' | 'component'
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    reRenderCount: 0,
  })
  const [entries, setEntries] = useState<PerformanceEntry[]>([])
  const renderCountRef = useRef(0)
  const startTimeRef = useRef<number>(Date.now())
  const lastRenderTimeRef = useRef<number>(Date.now())

  // Track render performance
  useEffect(() => {
    renderCountRef.current += 1
    const renderTime = Date.now() - lastRenderTimeRef.current
    lastRenderTimeRef.current = Date.now()

    setMetrics(prev => ({
      ...prev,
      renderTime,
      reRenderCount: renderCountRef.current,
    }))

    // Add performance entry
    const entry: PerformanceEntry = {
      name: `${componentName}-render-${renderCountRef.current}`,
      startTime: startTimeRef.current,
      duration: renderTime,
      type: 'render',
    }
    setEntries(prev => [...prev.slice(-49), entry]) // Keep last 50 entries
  }, [componentName])

  // Track Web Vitals
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lcp = entries[entries.length - 1] as PerformanceEntry
        setMetrics(prev => ({ ...prev, largestContentfulPaint: lcp.startTime }))
      })
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        // LCP not supported
      }

      // Track First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fid = entries[0] as PerformanceEntry
        setMetrics(prev => ({ ...prev, firstInputDelay: fid.processingStart - fid.startTime }))
      })
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        // FID not supported
      }

      // Track Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        setMetrics(prev => ({ ...prev, cumulativeLayoutShift: clsValue }))
      })
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        // CLS not supported
      }

      return () => {
        observer.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    }
  }, [])

  // Track memory usage
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window && (performance as any).memory) {
      const interval = setInterval(() => {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize,
        }))
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [])

  // Track API calls
  const trackAPICall = useCallback((apiName: string, duration: number) => {
    const entry: PerformanceEntry = {
      name: apiName,
      startTime: Date.now() - duration,
      duration,
      type: 'api',
    }
    setEntries(prev => [...prev.slice(-49), entry])
  }, [])

  // Track image loading
  const trackImageLoad = useCallback((imageName: string, duration: number) => {
    const entry: PerformanceEntry = {
      name: imageName,
      startTime: Date.now() - duration,
      duration,
      type: 'image',
    })
    setEntries(prev => [...prev.slice(-49), entry])
  }, [])

  // Get performance score
  const getPerformanceScore = useCallback(() => {
    let score = 100
    
    // Penalize slow renders
    if (metrics.renderTime > 100) score -= Math.min(30, metrics.renderTime / 10)
    
    // Penalize too many re-renders
    if (metrics.reRenderCount > 10) score -= Math.min(20, metrics.reRenderCount)
    
    // Penalize high memory usage
    if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) {
      score -= Math.min(20, (metrics.memoryUsage - 50 * 1024 * 1024) / (1024 * 1024))
    }
    
    // Penalize poor Web Vitals
    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
      score -= Math.min(15, metrics.largestContentfulPaint / 500)
    }
    
    if (metrics.firstInputDelay && metrics.firstInputDelay > 100) {
      score -= Math.min(10, metrics.firstInputDelay / 10)
    }
    
    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1) {
      score -= Math.min(15, metrics.cumulativeLayoutShift * 100)
    }
    
    return Math.max(0, Math.round(score))
  }, [metrics])

  return {
    metrics,
    entries,
    trackAPICall,
    trackImageLoad,
    getPerformanceScore,
  }
}

// Performance monitoring for API calls
export const useAPIMonitor = () => {
  const trackAPICall = useCallback((apiCall: () => Promise<any>, apiName: string) => {
    const startTime = Date.now()
    return apiCall().finally(() => {
      const duration = Date.now() - startTime
      console.log(`API Call ${apiName} took ${duration}ms`)
    })
  }, [])

  return { trackAPICall }
}

// Performance monitoring for images
export const useImageMonitor = () => {
  const trackImageLoad = useCallback((imageElement: HTMLImageElement, imageName: string) => {
    const startTime = Date.now()
    
    const handleLoad = () => {
      const duration = Date.now() - startTime
      console.log(`Image ${imageName} loaded in ${duration}ms`)
    }
    
    const handleError = () => {
      const duration = Date.now() - startTime
      console.error(`Image ${imageName} failed to load after ${duration}ms`)
    }
    
    imageElement.addEventListener('load', handleLoad)
    imageElement.addEventListener('error', handleError)
    
    return () => {
      imageElement.removeEventListener('load', handleLoad)
      imageElement.removeEventListener('error', handleError)
    }
  }, [])

  return { trackImageLoad }
}
