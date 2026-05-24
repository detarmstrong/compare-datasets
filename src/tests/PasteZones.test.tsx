import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PasteZones from '../PasteZones'

function setup(overrides = {}) {
  const props = {
    loadCsv: jest.fn(async (tableName: string) => ({
      tableName,
      columns: ['a', 'b'],
    })),
    setColumns: jest.fn(),
    setTableNames: jest.fn(),
    setSheetNames: jest.fn(),
    setOpen: jest.fn(),
    ...overrides,
  }
  const utils = render(<PasteZones {...props} />)
  return { ...utils, props }
}

function paste(testId: string, text: string) {
  fireEvent.paste(screen.getByTestId(testId), {
    clipboardData: { getData: () => text },
  })
}

describe('PasteZones', () => {
  it('focuses the left zone on mount', () => {
    setup()
    expect(screen.getByTestId('paste-zone-1')).toHaveFocus()
  })

  it('shows a guidance placeholder on the right zone until the left is filled', () => {
    setup()
    expect(screen.getByText('Paste Dataset 1 first')).toBeInTheDocument()
  })

  it('moves focus to the right zone after the first paste lands', async () => {
    setup()
    paste('paste-zone-1', 'name,age\nAda,36\nGrace,85')
    await waitFor(() =>
      expect(screen.getByTestId('paste-zone-2')).toHaveFocus()
    )
    expect(screen.getByText(/2 rows · 2 cols/)).toBeInTheDocument()
  })

  it('normalizes TSV input to CSV before passing to loadCsv', async () => {
    const { props } = setup()
    paste('paste-zone-1', 'name\tage\nAda\t36')
    paste('paste-zone-2', 'name\tcity\nAda\tLondon')

    await waitFor(() => expect(props.setOpen).toHaveBeenCalledWith(true))

    expect(props.loadCsv).toHaveBeenCalledTimes(2)
    expect(props.loadCsv).toHaveBeenNthCalledWith(
      1,
      'clipboard1',
      '"name","age"\n"Ada","36"'
    )
    expect(props.loadCsv).toHaveBeenNthCalledWith(
      2,
      'clipboard2',
      '"name","city"\n"Ada","London"'
    )
  })

  it('advances only after both zones are filled', async () => {
    const { props } = setup()
    paste('paste-zone-1', 'a,b\n1,2')
    // First paste alone should not advance.
    expect(props.setOpen).not.toHaveBeenCalled()

    paste('paste-zone-2', 'a,c\n1,3')
    await waitFor(() => expect(props.setOpen).toHaveBeenCalledWith(true))
    expect(props.setSheetNames).toHaveBeenCalledWith([
      'clipboard1',
      'clipboard2',
    ])
  })

  it('clearing a filled zone returns it to empty and refocuses it', async () => {
    setup()
    paste('paste-zone-1', 'a,b\n1,2')
    await waitFor(() =>
      expect(screen.getByTestId('paste-zone-2')).toHaveFocus()
    )

    fireEvent.click(screen.getByRole('button', { name: /Clear Dataset 1/i }))

    expect(screen.queryByText(/1 row · 2 cols/)).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId('paste-zone-1')).toHaveFocus()
    )
  })

  it('ignores empty or whitespace-only pastes', () => {
    const { props } = setup()
    paste('paste-zone-1', '   \n  ')
    expect(props.setOpen).not.toHaveBeenCalled()
    expect(screen.getByText('Paste Dataset 1 first')).toBeInTheDocument()
  })
})
