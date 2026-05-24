import React, {
  ClipboardEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
} from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

export interface PasteZoneSummary {
  rows: number
  cols: number
}

export interface PasteZoneProps {
  label: string
  placeholder: string
  summary: PasteZoneSummary | null
  focused: boolean
  onPaste: (rawText: string) => void
  onClear: () => void
  testId?: string
}

function PasteZone(props: PasteZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (props.focused) {
      containerRef.current?.focus()
    }
  }, [props.focused])

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    const rawText = e.clipboardData.getData('Text')
    props.onPaste(rawText)
  }

  function handleClear(e: MouseEvent) {
    e.stopPropagation()
    props.onClear()
    containerRef.current?.focus()
  }

  // Allow keyboard activation to bring focus back to a zone (e.g. tabbing through).
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      containerRef.current?.focus()
    }
  }

  const isFilled = props.summary !== null
  const borderColor = props.focused
    ? '#1976d2'
    : isFilled
    ? '#2e7d32'
    : '#9e9e9e'

  return (
    <Box
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={`${props.label} paste target`}
      data-testid={props.testId}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      sx={{
        flex: 1,
        minHeight: 140,
        border: `2px dashed ${borderColor}`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'text',
        outline: 'none',
        transition: 'border-color 120ms ease-in-out',
        backgroundColor: isFilled ? 'rgba(46, 125, 50, 0.04)' : 'transparent',
        '&:focus': {
          borderColor: '#1976d2',
          boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)',
        },
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        {props.label}
      </Typography>

      {isFilled ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {props.summary!.rows.toLocaleString()}{' '}
            {props.summary!.rows === 1 ? 'row' : 'rows'} ·{' '}
            {props.summary!.cols} {props.summary!.cols === 1 ? 'col' : 'cols'}
          </Typography>
          <IconButton
            size="small"
            aria-label={`Clear ${props.label}`}
            onClick={handleClear}
            sx={{ mt: 1 }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {props.placeholder}
        </Typography>
      )}
    </Box>
  )
}

export default PasteZone
