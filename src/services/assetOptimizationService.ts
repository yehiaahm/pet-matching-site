// Asset optimization service for images and other media
export class AssetOptimizationService {
  private static instance: AssetOptimizationService
  private optimizedCache = new Map<string, string>()

  static getInstance(): AssetOptimizationService {
    if (!AssetOptimizationService.instance) {
      AssetOptimizationService.instance = new AssetOptimizationService()
    }
    return AssetOptimizationService.instance
  }

  // Generate responsive image srcset
  generateSrcSet(baseUrl: string, widths: number[] = [320, 640, 768, 1024, 1280, 1536]): string {
    return widths
      .map(width => `${baseUrl}?w=${width} ${width}w`)
      .join(', ')
  }

  // Generate responsive sizes attribute
  generateSizes(breakpoints: string[] = ['(max-width: 640px) 100vw', '(max-width: 1024px) 50vw', '33vw']): string {
    return breakpoints.join(', ')
  }

  // Optimize image URL with CDN parameters
  optimizeImageUrl(url: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpg' | 'png'
    crop?: 'fill' | 'fit' | 'pad'
  } = {}): string {
    const params = new URLSearchParams()
    
    if (options.width) params.append('w', options.width.toString())
    if (options.height) params.append('h', options.height.toString())
    if (options.quality) params.append('q', options.quality.toString())
    if (options.format) params.append('f', options.format)
    if (options.crop) params.append('c', options.crop)

    const paramString = params.toString()
    return paramString ? `${url}?${paramString}` : url
  }

  // Check if browser supports modern image formats
  async getSupportedFormat(): Promise<'webp' | 'avif' | 'jpg'> {
    if (await this.supportsFormat('avif')) return 'avif'
    if (await this.supportsFormat('webp')) return 'webp'
    return 'jpg'
  }

  private supportsFormat(format: string): Promise<boolean> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(false)
        return
      }

      const data = ctx.getImageData(0, 0, 1, 1).data
      const support = data[3] === 0
      resolve(support)
    })
  }

  // Preload critical images
  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => this.preloadImage(url))
    )
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      link.onload = () => resolve()
      link.onerror = reject
      document.head.appendChild(link)
    })
  }

  // Generate low-quality image placeholder (LQIP)
  async generateLQIP(url: string): Promise<string> {
    if (this.optimizedCache.has(url)) {
      return this.optimizedCache.get(url)!
    }

    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(url)
          return
        }

        // Create tiny placeholder
        const scale = 0.1
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Apply blur and return as data URL
        ctx.filter = 'blur(2px)'
        ctx.drawImage(canvas, 0, 0)
        
        const lqip = canvas.toDataURL('image/jpeg', 0.1)
        this.optimizedCache.set(url, lqip)
        resolve(lqip)
      }
      img.onerror = () => resolve(url)
      img.src = url
    })
  }

  // Critical CSS extraction (simplified)
  extractCriticalCSS(): string {
    const criticalSelectors = [
      'header', 'nav', '.hero', '.cta-button', '.loading-skeleton'
    ]
    
    return criticalSelectors.map(selector => {
      const element = document.querySelector(selector)
      if (!element) return ''
      
      const styles = getComputedStyle(element)
      return `${selector} { ${this.cssPropertiesToString(styles)} }`
    }).join('\n')
  }

  private cssPropertiesToString(styles: CSSStyleDeclaration): string {
    const properties: string[] = []
    for (let i = 0; i < styles.length; i++) {
      const property = styles[i]
      const value = styles.getPropertyValue(property)
      if (value && property !== 'cssText') {
        properties.push(`${property}: ${value};`)
      }
    }
    return properties.join(' ')
  }
}

// React hook for asset optimization
export const useAssetOptimization = () => {
  const service = AssetOptimizationService.getInstance()

  const optimizeImage = (url: string, options?: Parameters<typeof service.optimizeImageUrl>[1]) => {
    return service.optimizeImageUrl(url, options)
  }

  const generateSrcSet = (baseUrl: string, widths?: number[]) => {
    return service.generateSrcSet(baseUrl, widths)
  }

  const generateSizes = (breakpoints?: string[]) => {
    return service.generateSizes(breakpoints)
  }

  const preloadImages = (urls: string[]) => {
    return service.preloadImages(urls)
  }

  const generateLQIP = (url: string) => {
    return service.generateLQIP(url)
  }

  return {
    optimizeImage,
    generateSrcSet,
    generateSizes,
    preloadImages,
    generateLQIP,
  }
}

// Image optimization component
export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false 
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}) => {
  const { optimizeImage, generateSrcSet, generateSizes, generateLQIP } = useAssetOptimization()
  const [lqip, setLqip] = useState<string>('')

  useEffect(() => {
    if (!priority) {
      generateLQIP(src).then(setLqip)
    }
  }, [src, priority, generateLQIP])

  const optimizedSrc = optimizeImage(src, { width, height, quality: 80 })
  const srcSet = generateSrcSet(src)
  const sizes = generateSizes()

  if (priority) {
    return (
      <img
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        loading="eager"
        decoding="sync"
      />
    )
  }

  return (
    <LazyImage
      src={optimizedSrc}
      alt={alt}
      placeholder={lqip}
      srcSet={srcSet}
      sizes={sizes}
      className={className}
    />
  )
}
