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

import { Filter, KeyDesc, KeyDescArray } from './types'
import { KeySelection } from './KeySelection'

export default function App() {
  const [open, setOpen] = React.useState(true)
  const [keys, setKeys] = React.useState([[], []] as KeyDescArray)
  const [filter, setFilter] = React.useState<Filter>('a-intersection-b')
  const [columns, setColumns] = React.useState([] as string[][])
  const [reportColumns, setReportColumns] = React.useState([] as string[])
  const [reportData, setReportData] = React.useState([] as {}[])
  const [tableNames, setTableNames] = React.useState([] as string[])
  const [db, setDb] = React.useState(0)

  React.useEffect(() => {
    async function initDb() {
      const module = await SQLiteESMFactory()
      const sqlite3 = SQLite.Factory(module)
      ;(window as any).sqlite3 = sqlite3
      const db = await sqlite3.open_v2('innerjoy')
      setDb(db)
    }
    initDb()
  }, []) // NOTE empty array will cause this to only update on init

  const handleClickOpen = () => {
    setOpen(true)
  }

  const execQuery = async (
    sql: string
  ): Promise<{ results: {}[]; columns: string[] }> => {
    const sqlite3 = (window as any).sqlite3
    let results = []
    let columnsTemp = [] // use array here and push to it instead of just setting the variable
    // because trying to set this variable
    // in the for await block scope won't work - it's silently ignored. I don't understand the mechanics of this yet.
    for await (let stmt of sqlite3.statements(db, sql)) {
      let rows = []
      let columns = sqlite3.column_names(stmt)

      while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
        let row = sqlite3.row(stmt)
        let rowObj: any = { id: rows.length }
        let itemCounter = 0
        for (const rowValue of row) {
          rowObj[columns[itemCounter]] = rowValue
          itemCounter++
        }
        rows.push(rowObj)
      }
      if (columns.length) {
        results.push(rows)
        columnsTemp.push(columns)
      }
    }
    return { results: results[0], columns: columnsTemp[0] }
  }

  const handleOk = (keys: KeyDescArray) => {
    console.log('handleOk', keys, 'filter', filter)
    setKeys(keys)
    setOpen(false)

    const sql = reportSql(keys, filter)
    execQuery(sql).then((res) => {
      setReportData(res.results)
      setReportColumns(res.columns)
    })
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const reportSql = (keySelection: KeyDescArray, filter: Filter) => {
    let set = (setName: 'a' | 'b') => {
      return {
        getKeyCols: (): KeyDesc[] => keySelection[setName === 'a' ? 0 : 1],
        getTable: function (): string {
          return this.getKeyCols()[0].table
        },
        getKeyList: function (): string {
          return this.getKeyCols()
            .map((e, i) => `"${e.colName}" as key${i}`)
            .join(',')
        },
        getKeyAliasList: function (): string {
          return this.getKeyCols()
            .map((e, i) => `key${i}`)
            .join(',')
        },
        getLeftJoinPredicates: function (): string {
          return this.getKeyCols()
            .map((e, i) => {
              return `"${this.getTable()}"."${e.colName}" = unionish.key${i}`
            })
            .join(' AND ')
        },
        getSelectList: function (): string {
          let tableName = this.getTable()
          let tmpIdx = _.indexOf(tableNames, tableName)
          let tableColumns = columns[tmpIdx]
          return _.map(tableColumns, (col) => {
            return `${tableName}."${col}" as "${tableName}.${col}"`
          }).join(',')
        },
      }
    }

    // just a or b
    if (['just-a', 'just-b'].includes(filter)) {
      let setName: 'a' | 'b' = filter === 'just-a' ? 'a' : 'b'
      return `select '${setName}' as set_n,
                     ${set(setName).getKeyList()},
                     ${set(setName).getSelectList()}
              from "${set(setName).getTable()}"`
    }

    // A - B
    // How can I construct this so the compiler can tell me if I'm looking
    // for a valid member of the enum type?
    if (['a-minus-b', 'b-minus-a'].includes(filter)) {
      let setName: 'a' | 'b' = filter === 'a-minus-b' ? 'a' : 'b'
      let contraSet: 'a' | 'b' = setName === 'a' ? 'b' : 'a'
      // take all rows from a and subtract where there is key match on b
      let querySql = `with left_only as (
        select '${setName}' as set_n, ${set(setName).getKeyList()}
        from "${set(setName).getTable()}"
        except 
        select '${setName}' as set_n, ${set(contraSet).getKeyList()}
        from "${set(contraSet).getTable()}"),
      unionish as (
        select set_n, ${set(setName).getKeyAliasList()}
        from left_only)
      select unionish.set_n,
             ${set(setName).getKeyAliasList()},
             ${set(setName).getSelectList()}
      from unionish
      left join "${set(setName).getTable()}" on
        ${set(setName).getLeftJoinPredicates()}`
      return querySql
    }

    // intersection: a intersect b
    let xxx_x = `with 
    intersection_ as (
      select 'ab' as set_n, "MRN" as key1
      from "snowflake_report"
      intersect 
      select 'ab' as set_n, "PATIENT ID" as key1
      from "vtoc_report"
    )
    select intersection_.*,
           snowflake_report."LNAME" as "snowflake_report.LNAME"
    from intersection_
    left join "snowflake_report" on "snowflake_report"."MRN"
     = intersection_.key1
    left join "vtoc_report" on "vtoc_report"."PATIENT ID"
     = intersection_.key1;`

    // all data
    let theLight = `with left_only as (
      select 'a' as set_n, ${set('a').getKeyList()}
      from "${set('a').getTable()}"
      except 
      select 'a' as set_n, ${set('b').getKeyList()}
      from "${set('b').getTable()}"),
    right_only as (
      select 'b' as set_n, ${set('b').getKeyList()}
      from "${set('b').getTable()}"
      except 
      select 'b' as set_n, ${set('a').getKeyList()}
      from "${set('a').getTable()}"
    ),
    intersection_ as (
      select 'ab' as set_n, ${set('a').getKeyList()}
      from "${set('a').getTable()}"
      intersect 
      select 'ab' as set_n, ${set('b').getKeyList()}
      from "${set('b').getTable()}"
    ),
    unionish as (
      select set_n, ${set('a').getKeyAliasList()}
      from left_only
      union all
      select set_n, ${set('a').getKeyAliasList()}
      from right_only
      union all
      select set_n, ${set('a').getKeyAliasList()}
      from intersection_)
    select unionish.set_n,
           ${set('a').getKeyAliasList()},
           ${set('a').getSelectList()},
           ${set('b').getSelectList()}
    from unionish
    left join "${set('a').getTable()}" on
      ${set('a').getLeftJoinPredicates()}
    left join "${set('b').getTable()}" on
      ${set('b').getLeftJoinPredicates()}`
    return theLight
  }

  React.useEffect(() => {})

  const handleFilterChange = (
    e: React.MouseEvent<HTMLElement>,
    newValue: Filter
  ) => {
    setFilter(newValue)
    const sql = reportSql(keys, newValue)
    console.log('sql', sql)
    execQuery(sql).then((res) => {
      setReportData(res.results)
      setReportColumns(res.columns)
    })
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
        let insert_sql = `insert into ${tableName}
                          (${columns.map((col) => `"${col}"`).join()}) 
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
      <Grid container spacing={2} sx={{ margin: '10px' }}>
        <Grid item xs={3}>
          <Typography gutterBottom variant="subtitle1" component="div">
            <strong>{'{A}'}</strong> {keys[0][0]?.table || 'Select keys'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <Button
              variant="outlined"
              startIcon={<VpnKey />}
              onClick={handleClickOpen}
              sx={{ textAlign: 'left' }}
            >
              {keys[0].map((o: KeyDesc) => {
                return (
                  <>
                    {o.colName}
                    <br />
                  </>
                )
              })}
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
            <strong>{'{B}'}</strong> {keys[1][0]?.table || 'Select keys'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <Button
              variant="outlined"
              startIcon={<VpnKey />}
              onClick={handleClickOpen}
              sx={{ textAlign: 'left' }}
            >
              {keys[1].map((o: KeyDesc) => {
                return (
                  <>
                    {o.colName}
                    <br />
                  </>
                )
              })}
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
