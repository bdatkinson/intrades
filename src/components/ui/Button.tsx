import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-mono font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
      ghost: 'text-slate-300 hover:bg-slate-900 hover:text-white',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-white" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
