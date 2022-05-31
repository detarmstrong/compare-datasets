import * as React from 'react'
import Button from '@mui/material/Button'
import VpnKey from '@mui/icons-material/VpnKey'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import DataTable from './DataTable'
import DragAndDropForm from './DragNDropForm'
import VennFilterButtons from './VennFilterButtons'

import _ from 'lodash'
import { csvParse, autoType } from 'd3-dsv'

import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import * as SQLite from 'wa-sqlite'

import { Filter } from './types'
import { KeySelection } from './KeySelection'

async function initDb() {
  const module = await SQLiteESMFactory()
  const sqlite3 = SQLite.Factory(module)
  ;(window as any).sqlite3 = sqlite3
  const db = await sqlite3.open_v2('innerjoy')
  return db
}

export default function App() {
  interface KeyDesc {
    table: string
    colName: string
  }

  const [open, setOpen] = React.useState(true)
  const [keys, setKeys] = React.useState([] as KeyDesc[])
  const [filter, setFilter] = React.useState<Filter>('a-intersection-b')
  const [columns, setColumns] = React.useState([] as string[][])
  const [reportColumns, setReportColumns] = React.useState([] as string[])
  const [reportData, setReportData] = React.useState([] as any[][])
  const [tableNames, setTableNames] = React.useState([] as string[])
  const [db, setDb] = React.useState(0)

  React.useEffect(() => {
    async function doSelect() {
      const db = await initDb()
      console.log(db)
      setDb(db)
      return await (window as any).sqlite3.exec(db, `SELECT 'Hello, world!'`)
    }
    console.log(
      'Doselect',
      doSelect().then((res) => console.log('res', res))
    )
  }, []) // NOTE empty array will cause this to only update on init

  const handleClickOpen = () => {
    setOpen(true)
  }

  const execQuery = async (sql: string) => {
    const sqlite3 = (window as any).sqlite3
    let results = []
    let columnsTemp = [] // use array here and push to it instead of just setting the variable
    // because trying to set this variable
    // here won't work - it's silently ignored. I don't understand the mechanics of this yet.
    for await (let stmt of sqlite3.statements(db, sql)) {
      let rows = []
      let columns = sqlite3.column_names(stmt)

      //console.log('columns in for await', columns)
      while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
        let row = sqlite3.row(stmt)
        rows.push(row)
      }
      if (columns.length) {
        results.push(rows)
        columnsTemp.push(columns)
      }
    }
    await sqlite3.close(db)
    return { results: results[0], columns: columnsTemp[0] }
  }

  const handleOk = (keys: []) => {
    console.log('handleOk', keys, 'filter', filter)
    setKeys(keys)
    setOpen(false)
    // set some loading modal
    // refresh table data and render it per the key and filter selections
    const sql = reportSql(keys, filter)
    console.log(sql)
    /*
    let reportColumns: string[] = [];
    (window as any).sqlite3.exec(db, sql, function(row: [], cols: []) {
      let colsWereSet = false;
      if(!colsWereSet){
        setReportColumns(cols);
        colsWereSet = true;
      }
      console.log("row", row, cols);
    });
    */
    let results = execQuery(sql).then((res) => {
      console.log(res.results)
      setReportData(res.results)
      setReportColumns(res.columns)
    })

    console.log('reportData', reportData)
    // setReportData(execQuery(sql))

    console.log('handle ok end')

    // or useEffect instead?
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const reportSql = (keySelection: KeyDesc[], filter: Filter) => {
    let set = (setName: string): KeyDesc => {
      return keySelection[setName === 'a' ? 0 : 1]
    }

    let getSelectList = (tableName: string) => {
      let tmpIdx = _.indexOf(tableNames, tableName)
      let tableColumns = columns[tmpIdx]
      return _.map(tableColumns, (col) => {
        return `${tableName}."${col}" as "${tableName}.${col}"`
      }).join(',')
    }

    let theLight = `with left_only as (
      select 'a' as set_n, "${set('a').colName}" as key1
      from "${set('a').table}"
      except 
      select 'a' as set_n, "${set('b').colName}" as key1
      from "${set('b').table}"),
    right_only as (
      select 'b' as set_n, "${set('b').colName}" as key1
      from "${set('b').table}"
      except 
      select 'b' as set_n, "${set('a').colName}" as key1
      from "${set('a').table}"
    ),
    intersection_ as (
      select 'ab' as set_n, "${set('a').colName}" as key1
      from "${set('a').table}"
      intersect 
      select 'ab' as set_n, "${set('b').colName}" as key1
      from "${set('b').table}"
    ),
    unionish as (
      select set_n, key1
      from left_only
      union all
      select set_n, key1
      from right_only
      union all
      select set_n, key1
      from intersection_)
    select unionish.*,
           ${getSelectList(set('a').table)},
           ${getSelectList(set('b').table)}
    from unionish
    left join "${set('a').table}" on "${set('a').table}"."${set('a').colName}"
     = unionish.key1
    left join "${set('b').table}" on "${set('b').table}"."${set('b').colName}"
     = unionish.key1;`

    return theLight
  }

  React.useEffect(() => {
    console.log('in useEffect', filter)
    if (keys.length >= 2) {
      console.log(reportSql(keys, filter))
    }
  })

  const handleFilterChange = (
    e: React.MouseEvent<HTMLElement>,
    newValue: Filter
  ) => {
    setFilter(newValue)
  }

  const loadCsv = async (name: string, csvText: string) => {
    // parse csv
    let theSheet = csvParse(csvText, autoType)
    let columns = theSheet.columns

    // generate unique table name
    let tableName = name
    let columnsDDL = _.map(columns, (col) => `"${col}" varchar`)

    // create table
    let ddl = `create table ${tableName} (${columnsDDL.join()})`
    console.log('ddl', ddl)
    const sqlite3 = (window as any).sqlite3

    async function runSql() {
      await sqlite3.exec(db, ddl)

      // insert wa-sqlite way
      for await (const row of theSheet) {
        let insert_sql = `insert into ${tableName} (${columns
          .map((col) => `"${col}"`)
          .join()}) 
                          values (${Array(columns.length).fill('?').join()})`
        for await (let stmt of sqlite3.statements(db, insert_sql)) {
          sqlite3.bind_collection(stmt, _.valuesIn(row))
          while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
            // this is never executed. why not?
            console.log('stepped', row)

            // Just do nothing? This doesn't feel right
          }
        }
      }
    }
    await runSql()
    return { tableName, columns }
  }

  if (columns.length !== 2) {
    return (
      <DragAndDropForm
        loadCsv={loadCsv}
        setColumns={setColumns}
        setTableNames={setTableNames}
      />
    )
  }

  // else
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          margin: 'auto',
          maxWidth: 1280,
          flexGrow: 1,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography gutterBottom variant="subtitle1" component="div">
              <strong>{'{A}'}</strong> {_.get(keys, '0.table', 'Select keys')}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <Button
                variant="outlined"
                startIcon={<VpnKey />}
                onClick={handleClickOpen}
              >
                {_.get(keys, '0.colName', 'Select key')}
              </Button>
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <VennFilterButtons
              handleFilterChange={handleFilterChange}
              filter={filter}
            />
          </Grid>

          <Grid item xs={3}>
            <Typography gutterBottom variant="subtitle1" component="div">
              <strong>{'{B}'}</strong> {_.get(keys, '1.table', 'Select keys')}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <Button
                variant="outlined"
                startIcon={<VpnKey />}
                onClick={handleClickOpen}
              >
                {_.get(keys, '1.colName', 'Select key')}
              </Button>
            </Typography>
          </Grid>
        </Grid>

        <KeySelection
          keys={keys}
          tableNames={tableNames}
          columns={columns}
          open={open}
          handleOk_={handleOk}
          handleCancel_={handleCancel}
        />
      </Paper>

      {reportData.length > 0 ? (
        <DataTable
          columns={reportColumns}
          data={reportData}
          tableNames={tableNames}
        />
      ) : (
        ''
      )}
    </>
  )
}
