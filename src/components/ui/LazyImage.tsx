import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  fallback?: string
  onLoad?: () => void
  onError?: () => void
  threshold?: number
  rootMargin?: string
  decoding?: 'async' | 'sync' | 'auto'
  loading?: 'lazy' | 'eager'
  sizes?: string
  srcSet?: string
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3C/svg%3E',
  fallback,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  decoding = 'async',
  loading = 'lazy',
  sizes,
  srcSet,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const imageSrc = hasError && fallback ? fallback : src

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      <img
        ref={imgRef}
        src={placeholder}
        alt={alt}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        aria-hidden="true"
      />
      
      {/* Actual image */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          srcSet={srcSet}
          sizes={sizes}
          decoding={decoding}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Error fallback */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  )
}

// Progressive Image Component with blur effect
export const ProgressiveImage: React.FC<LazyImageProps> = (props) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    props.onLoad?.()
  }

  return (
    <div className={cn('relative overflow-hidden', props.className)}>
      {/* Low quality placeholder */}
      <img
        ref={imgRef}
        src={props.placeholder}
        alt={props.alt}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-all duration-500',
          isLoaded ? 'scale-110 blur-sm opacity-50' : 'scale-100 blur-0 opacity-100'
        )}
        aria-hidden="true"
      />
      
      {/* High quality image */}
      {isInView && (
        <img
          src={props.src}
          alt={props.alt}
          srcSet={props.srcSet}
          sizes={props.sizes}
          decoding="async"
          loading="lazy"
          onLoad={handleLoad}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  )
}
