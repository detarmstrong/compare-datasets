import { Typography } from '@mui/material'
import _ from 'lodash'
import React, { useState, ClipboardEvent } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import './styles.scss'
import { TSVToCSV } from './util'

interface FormProps {
  loadCsv: (name: string, csvText: string) => {}
  setColumns: (cols: string[][]) => void
  setTableNames: (tableNames: string[]) => void
  setSheetNames: (sheetNames: string[]) => void
  setOpen: (open: boolean) => void
}

function Form(props: FormProps) {
  const [files, setFiles] = useState([])
  const [pastes, setPastes] = useState([] as string[])

  const fileTypes = ['CSV']

  function handleFileChange(files: []) {
    setFiles(files)
    props.setSheetNames(_.map(files, (f: File) => f.name.split('.')[0]))

    let promises = _.map(files, (f: File) => {
      let displayFileName = f.name.split('.')[0]
      let tableName = displayFileName.replace(/[^0-9A-Za-z _-]/g, '_')

      return f
        .text()
        .then((csvText) => {
          return props.loadCsv(tableName, csvText)
        })
        .catch((error) => console.error('file error', error))
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

  function handleOnPaste(e: ClipboardEvent<HTMLInputElement>) {
    const clipboardData: string = e.clipboardData.getData('Text')
    let clipboardDataNormalized: string = ''
    // User will be pasting one string at a time. We reasonably expect either csv text or tab-delimited
    // like would come from copying some range out of excel.
    // Wait for 2 csv strings pasted before moving on
    if (typeof clipboardData !== 'string') {
      return false
    }
    //convert clipboard data to csv if it's not already
    if (clipboardData.indexOf('\t') > 0) {
      // TODO come up with a better heuristic
      clipboardDataNormalized = TSVToCSV(clipboardData)
    } else {
      clipboardDataNormalized = clipboardData
    }
    pastes.push(clipboardDataNormalized)
    setPastes(pastes)
    // got 2 pastes, ready for business
    // but how does the user know that?
    if (pastes.length >= 2) {
      props.setSheetNames(['clipboard1', 'clipboard2'])
      let promises = _.map(pastes, (p, i) => {
        return new Promise((resolve, reject) => {
          // HACKY ALERT: I have to do the set timeout. If it's just resolve() with no setTimeout
          // an error is encountered when running the sql
          // WHY?
          setTimeout(() => resolve(1), 1)
        })
          .then((result) => {
            console.log('csv text', result, p)
            return props.loadCsv('clipboard' + (i + 1), p)
          })
          .catch((error) => {
            console.error('Error loading csv from paste', error)
          })
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
          console.error('Error on setting props after paste', error)
        })
    }
  }

  const backgroundImage = `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='18' ry='18' stroke='%23000000FF' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`
  const borderRadius = `18px`

  const stack2 = (
    <div
      className="dragNDropContainer"
      style={{ backgroundImage: backgroundImage, borderRadius: borderRadius }}
      onPaste={handleOnPaste}
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
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        maxWidth: '400px',
        margin: '40px auto 0'
      }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Compare datasets
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
          1. Upload two datasets<br />
          2. Join datasets by key<br />
          3. Compare - view discrepancies and similarities
        </Typography>
      </div>
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
