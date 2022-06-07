import * as React from 'react'
import DataGrid from 'react-data-grid'
import _ from 'lodash'

interface DataTableProps {
  columns: string[]
  data: {}[]
  tableNames: string[]
}

export default function DataTable({
  columns,
  data,
  tableNames,
}: DataTableProps) {
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
  return (
    <DataGrid
      className="datatable rdg-light"
      rows={data}
      columns={columnDef}
      defaultColumnOptions={{
        sortable: true,
        resizable: true,
      }}
    />
  )
}
