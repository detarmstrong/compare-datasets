import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PasteZone from '../PasteZone'

function renderZone(overrides = {}) {
  const props = {
    label: 'Dataset 1',
    placeholder: 'Press Cmd/Ctrl+V to paste',
    summary: null as null | { rows: number; cols: number },
    focused: false,
    onPaste: jest.fn(),
    onClear: jest.fn(),
    testId: 'zone',
    ...overrides,
  }
  const utils = render(<PasteZone {...props} />)
  return { ...utils, props }
}

describe('PasteZone', () => {
  it('renders the placeholder when empty', () => {
    renderZone()
    expect(screen.getByText('Dataset 1')).toBeInTheDocument()
    expect(screen.getByText('Press Cmd/Ctrl+V to paste')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders row/column summary and a clear button when filled', () => {
    renderZone({ summary: { rows: 250, cols: 4 } })
    expect(screen.getByText(/250 rows · 4 cols/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Clear Dataset 1/i })
    ).toBeInTheDocument()
  })

  it('uses singular wording when row or column count is 1', () => {
    renderZone({ summary: { rows: 1, cols: 1 } })
    expect(screen.getByText(/1 row · 1 col/)).toBeInTheDocument()
  })

  it('focuses the zone on mount when focused prop is true', () => {
    renderZone({ focused: true })
    expect(screen.getByTestId('zone')).toHaveFocus()
  })

  it('calls onPaste with the raw clipboard text', () => {
    const { props } = renderZone({ focused: true })
    fireEvent.paste(screen.getByTestId('zone'), {
      clipboardData: { getData: () => 'a,b\n1,2' },
    })
    expect(props.onPaste).toHaveBeenCalledWith('a,b\n1,2')
  })

  it('calls onClear when the clear button is clicked', () => {
    const { props } = renderZone({ summary: { rows: 3, cols: 2 } })
    fireEvent.click(screen.getByRole('button', { name: /Clear Dataset 1/i }))
    expect(props.onClear).toHaveBeenCalledTimes(1)
  })
})
