import React, { Suspense, lazy } from 'react'

interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>
  fallback?: React.ReactNode
  delay?: number
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

const DefaultErrorComponent = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 mb-4">Failed to load component</div>
    <div className="text-sm text-gray-600 mb-4">{error.message}</div>
    <button
      onClick={retry}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Retry
    </button>
  </div>
)

export const LazyComponent: React.FC<LazyComponentProps> = ({
  loader,
  fallback = <DefaultFallback />,
  delay = 200,
  errorComponent: ErrorComponent = DefaultErrorComponent,
}) => {
  const LazyComp = lazy(loader)

  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary ErrorComponent={ErrorComponent}>
        <LazyComp />
      </ErrorBoundary>
    </Suspense>
  )
}

// Error boundary for lazy components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; ErrorComponent: React.ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyComponent error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { ErrorComponent } = this.props
      return <ErrorComponent error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

// Preload hook for components
export const usePreloadComponent = (loader: () => Promise<{ default: React.ComponentType<any> }>) => {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const preload = React.useCallback(async () => {
    try {
      await loader()
      setIsLoaded(true)
    } catch (err) {
      setError(err as Error)
    }
  }, [loader])

  return { isLoaded, error, preload }
}

// Route-based lazy loading examples
export const LazyAuthPage = () => LazyComponent({
  loader: () => import('@/components/AuthPage'),
})

export const LazyLandingPage = () => LazyComponent({
  loader: () => import('@/components/LandingPage'),
})

export const LazyChatSystem = () => LazyComponent({
  loader: () => import('@/components/ChatSystem'),
})

export const LazyPetRegistration = () => LazyComponent({
  loader: () => import('@/components/PetRegistrationForm'),
})

// Feature-based lazy loading
export const LazyAIRecommendations = () => LazyComponent({
  loader: () => import('@/components/AIRecommendations'),
})

export const LazyFileManager = () => LazyComponent({
  loader: () => import('@/components/FileManager'),
})

// Admin components (loaded only when needed)
export const LazyAdminDashboard = () => LazyComponent({
  loader: () => import('@/components/admin/Dashboard'),
})

export const LazyAnalyticsPanel = () => LazyComponent({
  loader: () => import('@/components/admin/Analytics'),
})
