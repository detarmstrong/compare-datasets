import * as React from 'react'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'

import VpnKey from '@mui/icons-material/VpnKey'
import { Stack, Typography } from '@mui/material'
import { TableDescription } from './types'
import _ from 'lodash'

interface DataTableProps {
  columns: string[]
  data: string[][]
  tableNames: string[]
}

export default function DataTable({
  columns,
  data,
  tableNames,
}: DataTableProps) {
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(100)

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  // bucket collection by regex and then count
  let bucket = _.groupBy(columns, (c) => {
    return c.match(/[^\.]+/) // parse out table prefix from column names
  })
  let tableAColLen = bucket[tableNames[0]].length
  let tableBColLen = bucket[tableNames[1]].length

  console.log('datatable columns', columns)
  console.log('datatables data', data)
  return (
    <Paper sx={{ width: '100%' }}>
      <TableContainer sx={{ height: '75vh' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="left" colSpan={1}>
                <Stack direction="row" spacing={2}>
                  <VpnKey /> <Typography>Key</Typography>
                </Stack>
              </TableCell>
              <TableCell align="left" colSpan={tableAColLen}>
                <Typography>Dataset A</Typography>
              </TableCell>
              <TableCell align="left" colSpan={tableBColLen}>
                <Typography>Dataset B</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              {columns.map((column: string) => {
                return (
                  <TableCell key={column} align="left" style={{ minWidth: 35 }}>
                    {column.replace(/.+\./, '')}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: any[], i) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                    {row.map((value, i) => {
                      return (
                        <TableCell key={i + 'cell'} align="left">
                          {value}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
      {/*
      <TablePagination
        rowsPerPageOptions={[25, 100, 300]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
            */}
    </Paper>
  )
}
