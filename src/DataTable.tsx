import * as React from 'react'
import DataGrid from 'react-data-grid'
import _ from 'lodash'
import { Card, Chip, Paper, Typography, Button } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'

interface DataTableProps {
  columns: string[]
  data: {}[]
  tableNames: string[]
  reportCounts: { A: number; B: number; AB: number }
}

export default function DataTable({
  columns,
  data,
  tableNames,
  reportCounts,
}: DataTableProps) {
  const countsLabel = `{A} ${reportCounts.A}  {B} ${reportCounts.B}  {AB} ${reportCounts.AB}`

  // bucket collection by the field prefix and then count
  let bucket = _.groupBy(columns, (c) => {
    return c.match(/[^\.]+/) // parse out table prefix from column names
  })
  let tableAColLen = 0
  if (_.has(bucket, tableNames[0])) {
    tableAColLen = bucket[tableNames[0]].length
  }
  // if just A or just B, then one or the other table won't even be rendered
  let tableBColLen = 0
  if (_.has(bucket, tableNames[1])) {
    tableBColLen = bucket[tableNames[1]].length
  }

  let columnDef = _.map(columns, (col) => {
    return { key: col, name: col }
  })

  const downloadSQLiteDatabase = async () => {
    try {
      // Load SQL.js library dynamically
      const loadSqlJs = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          // Check if already loaded
          if ((window as any).initSqlJs) {
            resolve((window as any).initSqlJs)
            return
          }

          const script = document.createElement('script')
          script.src = 'https://sql.js.org/dist/sql-wasm.js'
          script.onload = () => {
            resolve((window as any).initSqlJs)
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      const initSqlJs = await loadSqlJs()

      // Initialize SQL.js
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      })

      // Create a new database
      const db = new SQL.Database()

      // Create the table with all columns
      const columnDefs = columns.map((col) => `"${col}" TEXT`).join(', ')
      const createTableSQL = `CREATE TABLE compare_results (${columnDefs})`
      db.run(createTableSQL)

      // Insert all data rows
      if (data.length > 0) {
        const placeholders = columns.map(() => '?').join(', ')
        const insertSQL = `INSERT INTO compare_results VALUES (${placeholders})`
        const stmt = db.prepare(insertSQL)

        data.forEach((row: any) => {
          const values = columns.map((col) => {
            const value = row[col]
            return value === null || value === undefined ? null : String(value)
          })
          stmt.run(values)
        })
        stmt.free()
      }

      // Export the database to a binary array
      const binaryArray = db.export()
      const blob = new Blob([binaryArray], {
        type: 'application/x-sqlite3',
      })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'compare-results.sqlite'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Clean up
      db.close()
    } catch (error) {
      console.error('Error creating SQLite database:', error)
      alert('Failed to create SQLite database. Please try again.')
    }
  }

  return (
    <>
      <DataGrid
        className="datatable rdg-light"
        rows={data}
        columns={columnDef}
        defaultColumnOptions={{
          sortable: true,
          resizable: true,
        }}
      />
      <Typography
        component="div"
        style={{
          position: 'fixed',
          right: '12px',
          bottom: '8px',
          width: 'fit-content',
          display: 'flex',
          gap: '8px',
        }}
      >
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={downloadSQLiteDatabase}
          sx={{ backgroundColor: 'rgba(25, 118, 210, 0.9)' }}
        >
          Download SQLite
        </Button>
        <Chip
          label={countsLabel}
          sx={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />
      </Typography>
    </>
  )
}
