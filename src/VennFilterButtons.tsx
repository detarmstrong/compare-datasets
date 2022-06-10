import React from 'react'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { Tooltip } from '@mui/material'
import './styles.scss'
import { Filter } from './types'

interface VennFilterButtonsProps {
  handleFilterChange: (
    e: React.MouseEvent<HTMLElement>,
    newValue: Filter
  ) => void
  filter: string
}

function VennFilterButtons(props: VennFilterButtonsProps) {
  return (
    <>
      <ToggleButtonGroup
        onChange={props.handleFilterChange}
        exclusive
        size="small"
        color="primary"
        fullWidth={true}
        sx={{ height: 56 }}
      >
        <ToggleButton value="inner-joy-report" sx={{ border: 0 }}>
          <img
            src={process.env.PUBLIC_URL + '/svg/inner-joy-report.svg'}
            width="95%"
            height="40"
          />
        </ToggleButton>
        <ToggleButton value="just-a" sx={{ border: 0 }}>
          <img
            src={process.env.PUBLIC_URL + '/svg/just-a.svg'}
            width="95%"
            height="40"
          />
        </ToggleButton>
        <ToggleButton value="a-minus-b" sx={{ border: 0 }}>
          <img
            src={process.env.PUBLIC_URL + '/svg/a-minus-b.svg'}
            width="95%"
            height="40"
          />
        </ToggleButton>
        <ToggleButton value="a-intersection-b" sx={{ border: 0 }}>
          <img
            src={process.env.PUBLIC_URL + '/svg/a-intersection-b.svg'}
            width="95%"
            height="40"
          />
        </ToggleButton>
        <ToggleButton value="b-minus-a" sx={{ border: 0 }}>
          <img
            src={process.env.PUBLIC_URL + '/svg/b-minus-a.svg'}
            width="95%"
            height="40"
          />
        </ToggleButton>
        <ToggleButton value="just-b" sx={{ border: 0 }}>
          <img
            src={process.env.PUBLIC_URL + '/svg/just-b.svg'}
            width="95%"
            height="40"
          />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        value={props.filter}
        onChange={props.handleFilterChange}
        exclusive
        size="small"
        color="primary"
        fullWidth={true}
      >
        <ToggleButton value="inner-joy-report">
          <Tooltip arrow title={'Show all data'}>
            <span>All Data</span>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="just-a">
          <Tooltip arrow title={'Just show table A by itself'}>
            <span>Just A</span>
          </Tooltip>
        </ToggleButton>

        <ToggleButton value="a-minus-b">
          <Tooltip
            arrow
            title={
              'Show table A, subtracting rows that match by key in table B'
            }
          >
            <span>A - B</span>
          </Tooltip>
        </ToggleButton>

        <ToggleButton value="a-intersection-b">
          <Tooltip
            arrow
            title={
              'Show only rows that match by key across tables A and B, the intersection.'
            }
          >
            <span>A ∩ B</span>
          </Tooltip>
        </ToggleButton>

        <ToggleButton value="b-minus-a">
          <Tooltip
            arrow
            title={
              'Show table B, subtracting rows that match by key in table A'
            }
          >
            <span>B - A</span>
          </Tooltip>
        </ToggleButton>

        <ToggleButton value="just-b">
          <Tooltip arrow title={'Just show table B by itself'}>
            <span>Just B</span>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  )
}

export default VennFilterButtons
