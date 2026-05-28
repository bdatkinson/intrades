import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// ─── ErrorBoundary ─────────────────────────────────────────────────
// React error boundary that catches render errors in child components.
// Shows a friendly fallback UI with the error message and a retry button.
// Retry resets internal state so the children re-mount from scratch.

interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback UI. Receives error + reset function if you want full control. */
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for debugging; production would send to monitoring
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="flex items-center gap-2 mb-4 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-mono text-sm font-semibold">
              Something went wrong
            </span>
          </div>
          <p className="text-sm text-zinc-400 mb-2 max-w-md text-center font-mono">
            {this.state.error.message}
          </p>
          <p className="text-xs text-zinc-600 mb-6 text-center">
            An unexpected error occurred. You can try again or refresh the page.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-none border border-zinc-700 bg-zinc-900 text-zinc-300 font-mono text-sm hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
            aria-label="Try again"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
