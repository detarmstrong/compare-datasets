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
import { KeyDesc, KeyDescArray } from './types'

interface SimpleDialogProps {
  open: boolean
  keys: {}
  tableNames: string[]
  columns: string[][]
  handleOk_: (value: any) => void
  handleCancel_: () => void
}

export function KeySelection(props: SimpleDialogProps) {
  const { handleOk_, handleCancel_, open } = props
  const defaultSelectedKeys: KeyDescArray = [[], []]
  const [selectedKeys, setSelectedKeys] = React.useState(defaultSelectedKeys)

  const handleListItemClick = (
    table: string,
    colName: string,
    tableIndex: number
  ) => {
    let keyClone = _.cloneDeep(selectedKeys)
    let keys: KeyDesc[] = keyClone[tableIndex]

    let newKeys: KeyDesc[] = _.xorBy(
      keys,
      [{ colName, table }] as KeyDesc[],
      'colName'
    )

    keyClone[tableIndex] = newKeys

    setSelectedKeys(keyClone)
  }

  let table_descriptions = [
    { tableName: props.tableNames[0], columns: props.columns[0] },
    { tableName: props.tableNames[1], columns: props.columns[1] },
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
                <Grid item xs={6}>
                  <Typography variant="subtitle1" component="div">
                    "{t.tableName}"
                  </Typography>
                  <List sx={{ pt: 0 }}>
                    {t.columns.map((name, i) => {
                      let keyRank = _.findIndex(
                        selectedKeys[table_index],
                        (elem) => elem.colName === name
                      )

                      return (
                        <ListItem
                          disablePadding
                          button
                          onClick={() =>
                            handleListItemClick(t.tableName, name, table_index)
                          }
                          key={t.tableName + name}
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
                              primary={name}
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
