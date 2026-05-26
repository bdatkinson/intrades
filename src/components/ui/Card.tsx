import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div 
      className={`rounded-lg border border-slate-800 bg-slate-900 shadow-lg text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`px-6 py-4 border-b border-slate-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`p-6 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`px-6 py-4 border-t border-slate-800 bg-slate-950/40 rounded-b-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
