import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, icon, id, disabled, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label ? (
          <label 
            htmlFor={id} 
            className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          {icon ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              {icon}
            </div>
          ) : null}
          
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={`
              w-full rounded-none border font-mono text-sm bg-zinc-900 px-3 py-2 text-zinc-100 transition-colors placeholder:text-zinc-600
              focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
              disabled:opacity-50 disabled:bg-zinc-900 disabled:pointer-events-none
              ${icon ? 'pl-9' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:border-amber-500'}
              ${className}
            `}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-xs font-mono text-red-500">{error}</p>
        ) : helperText ? (
          <p className="text-xs font-mono text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
