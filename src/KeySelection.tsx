import * as React from 'react'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import VpnKey from '@mui/icons-material/VpnKey'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import _ from 'lodash'
import { Badge } from '@mui/material'
import { KeyDescription, KeyDescriptionArray } from './types'

interface SimpleDialogProps {
  open: boolean
  keys: {}
  tableNames: string[]
  sheetNames: string[]
  columns: string[][]
  handleOk_: (value: any) => void
  handleCancel_: () => void
}

export function KeySelection(props: SimpleDialogProps) {
  const { handleOk_, handleCancel_, open } = props
  const defaultSelectedKeys: KeyDescriptionArray = [[], []]
  const [selectedKeys, setSelectedKeys] = React.useState(defaultSelectedKeys)

  const handleListItemClick = (
    table: string,
    colName: string,
    tableIndex: number,
    sheetName: string
  ) => {
    let keyClone = _.cloneDeep(selectedKeys)
    let keys: KeyDescription[] = keyClone[tableIndex]

    let newKeys: KeyDescription[] = _.xorBy(
      keys,
      [{ colName, table, sheetName }] as KeyDescription[],
      'colName'
    )

    keyClone[tableIndex] = newKeys

    setSelectedKeys(keyClone)
  }

  let table_descriptions = [
    {
      tableName: props.tableNames[0],
      sheetName: props.sheetNames[0],
      columns: props.columns[0],
    },
    {
      tableName: props.tableNames[1],
      sheetName: props.sheetNames[1],
      columns: props.columns[1],
    },
  ]
  return (
    <Dialog open={open} maxWidth={false}>
      <DialogTitle>How are these datasets related?</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" component="div">
            Choose key from left list and it's match on the right:
          </Typography>
          <Grid container spacing={2}>
            {table_descriptions.map((t, table_index) => {
              return (
                <Grid item xs={6} key={t.tableName + name}>
                  <Typography variant="subtitle1" component="div">
                    "{t.sheetName}"
                  </Typography>
                  <List sx={{ pt: 0 }}>
                    {t.columns.map((colName, i) => {
                      let keyRank = _.findIndex(
                        selectedKeys[table_index],
                        (elem) => elem.colName === colName
                      )

                      return (
                        <ListItem
                          disablePadding
                          button
                          onClick={() =>
                            handleListItemClick(
                              t.tableName,
                              colName,
                              table_index,
                              t.sheetName
                            )
                          }
                          key={t.tableName + colName}
                        >
                          <ListItemButton>
                            {keyRank >= 0 && (
                              <ListItemIcon>
                                <Badge
                                  badgeContent={keyRank + 1}
                                  color="primary"
                                >
                                  <VpnKey />
                                </Badge>
                              </ListItemIcon>
                            )}
                            <ListItemText
                              inset={keyRank == -1}
                              primary={colName}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => handleCancel_()}>Cancel</Button>
        <Button onClick={(e) => handleOk_(selectedKeys)}>Ok</Button>
      </DialogActions>
    </Dialog>
  )
}
