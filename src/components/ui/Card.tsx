import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div 
      className={`rounded-none border border-zinc-700 bg-zinc-900 text-zinc-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`px-6 py-4 border-b border-zinc-700 ${className}`}
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
      className={`px-6 py-4 border-t border-zinc-700 bg-zinc-950/40 rounded-none ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
