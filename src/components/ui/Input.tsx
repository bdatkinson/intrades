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
            className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          {icon ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {icon}
            </div>
          ) : null}
          
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={`
              w-full rounded border font-mono text-sm bg-slate-950 px-3 py-2 text-slate-100 transition-colors placeholder:text-slate-600
              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              disabled:opacity-50 disabled:bg-slate-900 disabled:pointer-events-none
              ${icon ? 'pl-9' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-blue-500'}
              ${className}
            `}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-xs font-mono text-red-500">{error}</p>
        ) : helperText ? (
          <p className="text-xs font-mono text-slate-500">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
