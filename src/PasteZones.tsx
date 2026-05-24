import React, { useState } from 'react'
import { Box } from '@mui/material'
import _ from 'lodash'

import PasteZone, { PasteZoneSummary } from './PasteZone'
import { normalizePastedTabular, summarizeCsv } from './util'

export interface PasteZonesProps {
  loadCsv: (name: string, csvText: string) => {}
  setColumns: (cols: string[][]) => void
  setTableNames: (tableNames: string[]) => void
  setSheetNames: (sheetNames: string[]) => void
  setOpen: (open: boolean) => void
}

type PasteSlot = { csv: string; summary: PasteZoneSummary } | null

function PasteZones(props: PasteZonesProps) {
  const [slots, setSlots] = useState<[PasteSlot, PasteSlot]>([null, null])
  const [focusIndex, setFocusIndex] = useState<0 | 1>(0)

  function handlePaste(index: 0 | 1, rawText: string) {
    const normalized = normalizePastedTabular(rawText)
    if (normalized === null) return

    const summary = summarizeCsv(normalized)
    const nextSlots: [PasteSlot, PasteSlot] = [slots[0], slots[1]]
    nextSlots[index] = { csv: normalized, summary }
    setSlots(nextSlots)

    // Move focus to the other zone if it's still empty.
    const otherIndex: 0 | 1 = index === 0 ? 1 : 0
    if (nextSlots[otherIndex] === null) {
      setFocusIndex(otherIndex)
    }

    if (nextSlots[0] !== null && nextSlots[1] !== null) {
      advance(nextSlots as [NonNullable<PasteSlot>, NonNullable<PasteSlot>])
    }
  }

  function handleClear(index: 0 | 1) {
    const nextSlots: [PasteSlot, PasteSlot] = [slots[0], slots[1]]
    nextSlots[index] = null
    setSlots(nextSlots)
    setFocusIndex(index)
  }

  function advance(
    filled: [NonNullable<PasteSlot>, NonNullable<PasteSlot>]
  ) {
    const sheetNames = ['clipboard1', 'clipboard2']
    props.setSheetNames(sheetNames)

    const promises = filled.map((slot, i) =>
      // Defer so React can flush state updates before SQLite work begins.
      // (Matches the historical setTimeout hack in the previous paste handler.)
      new Promise((resolve) => setTimeout(() => resolve(1), 1)).then(() =>
        props.loadCsv(sheetNames[i], slot.csv)
      )
    )

    Promise.allSettled(promises)
      .then((results) => {
        const columns = _.map(results, (r) =>
          r.status === 'fulfilled'
            ? (r.value as { columns: string[] }).columns
            : []
        )
        const tableNames = _.map(results, (r) =>
          r.status === 'fulfilled'
            ? (r.value as { tableName: string }).tableName
            : ''
        )
        props.setTableNames(tableNames as string[])
        props.setColumns(columns)
        props.setOpen(true)
      })
      .catch((error) => {
        console.error('Error on loading CSV from paste', error)
      })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        width: '100%',
        maxWidth: 520,
        margin: '24px auto 16px',
      }}
    >
      <PasteZone
        label="Dataset 1"
        placeholder="Press Cmd/Ctrl+V to paste"
        summary={slots[0]?.summary ?? null}
        focused={focusIndex === 0 && slots[0] === null}
        onPaste={(rawText) => handlePaste(0, rawText)}
        onClear={() => handleClear(0)}
        testId="paste-zone-1"
      />
      <PasteZone
        label="Dataset 2"
        placeholder={
          slots[0] === null
            ? 'Paste Dataset 1 first'
            : 'Press Cmd/Ctrl+V to paste'
        }
        summary={slots[1]?.summary ?? null}
        focused={focusIndex === 1 && slots[1] === null}
        onPaste={(rawText) => handlePaste(1, rawText)}
        onClear={() => handleClear(1)}
        testId="paste-zone-2"
      />
    </Box>
  )
}

export default PasteZones
