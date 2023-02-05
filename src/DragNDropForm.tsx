// TODO next steps:
// OK start with just drag target
// OK drop files onto it
// OK load all files to sqlite (use filename as table name or use internal table to link internal table id to the user given name)
//   Chose to use filename as table name as tech debt
// list column names in two parallel vertical lists

import { Typography } from '@mui/material'
import _ from 'lodash'
import React, { useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import './styles.scss'

interface FormProps {
  loadCsv: (name: string, csvText: string) => {}
  setColumns: (cols: string[][]) => void
  setTableNames: (tableNames: string[]) => void
  setSheetNames: (sheetNames: string[]) => void
  setOpen: (open: boolean) => void
}

function Form(props: FormProps) {
  const [files, setFiles] = useState([])

  const fileTypes = ['CSV', 'DB']

  function handleFileChange(files: []) {
    setFiles(files)
    props.setSheetNames(_.map(files, (f: File) => f.name.split('.')[0]))

    let promises = _.map(files, (f: File) => {
      let displayFileName = f.name.split('.')[0]
      let fileName = displayFileName.replace(/[^0-9A-Za-z _-]/g, '_')

      return f
        .text()
        .then((csvText) => {
          return props.loadCsv(fileName, csvText)
        })
        .catch((error) => console.error('error', error))
    })

    Promise.allSettled(promises)
      .then((results) => {
        console.log('results', results)
        let columns = _.map(results, (r) =>
          r.status === 'fulfilled'
            ? (r.value as { columns: string[] }).columns
            : []
        )

        let tableNames = _.map(results, (r) =>
          r.status === 'fulfilled'
            ? (r.value as { tableName: string[] }).tableName
            : []
        ).flat()
        props.setTableNames(tableNames)
        props.setColumns(columns)
        props.setOpen(true)
      })
      .catch((error) => {
        console.error('Error on loading CSV', error)
      })
  }

  const backgroundImage = `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='18' ry='18' stroke='%23000000FF' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`
  const borderRadius = `18px`

  const stack2 = (
    <div
      className="dragNDropContainer"
      style={{ backgroundImage: backgroundImage, borderRadius: borderRadius }}
    >
      <div className="box box-1">
        <div>
          {/* I gave up on trying to unravel the riddle of loading an svg in react/typescript without
            compile errors. A hill to die on for another day. */}
          <img src={process.env.PUBLIC_URL + '/svg/just-a.svg'} width="75" />
        </div>
      </div>
      <div className="box box-2">
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Drop two .csv files here
        </Typography>
      </div>
    </div>
  )

  return (
    <form>
      <FileUploader
        multiple={true}
        handleChange={handleFileChange}
        name="file"
        types={fileTypes}
        label="Upload or drop two .csv files here"
        children={stack2}
      />
      {/*<p>
        {files
          ? `File names: ${_.map(files, (f: { name }) => f.name).join()}`
          : "no files uploaded yet"}
      </p>
        */}
    </form>
  )
}

export default Form
