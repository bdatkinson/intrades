import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent, CardFooter } from '../Card'

describe('Card', () => {
  it('renders card and its subcomponents correctly', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )

    expect(screen.getByText('Header content')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('passes class names down to wrappers', () => {
    const { container } = render(
      <Card className="custom-card-class">
        <CardContent className="custom-content-class">Content</CardContent>
      </Card>
    )

    expect(container.firstChild).toHaveClass('custom-card-class')
    expect(screen.getByText('Content')).toHaveClass('custom-content-class')
  })
})
