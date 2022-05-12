import * as React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import VpnKey from "@mui/icons-material/VpnKey";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

import _ from "lodash";
import { Avatar, Tooltip } from "@mui/material";
import { ReactComponent as JustA } from "./images/just-a.svg";
import { ReactComponent as AMinusB } from "./images/a-minus-b.svg";
import { ReactComponent as AIntersectionB } from "./images/a-intersection-b.svg";
import { ReactComponent as BMinusA } from "./images/b-minus-a.svg";
import { ReactComponent as JustB } from "./images/just-b.svg";

const table_descriptions = [
  {
    tableName: "pos1",
    columns: [
      "Symbol",
      "Description",
      "Quantity",
      "Price",
      "Price Change $",
      "Price Change %",
      "Market Value",
      "Day Change $",
      "Day Change %",
      "Cost Basis",
      "Gain/Loss $",
      "Gain/Loss %",
      "Reinvest Dividends?",
      "Capital Gains?",
      "% Of Account",
      "Dividend Yield",
      "Last Dividend",
      "Ex-Dividend Date",
      "P/E Ratio",
      "52 Week Low",
      "52 Week High",
      "Volume",
      "Intrinsic Value",
      "In The Money",
      "Security Type",
      "field26"
    ]
  },
  {
    tableName: "pos2",
    columns: [
      "Symbol",
      "Description",
      "Quantity",
      "Price",
      "Price Change $",
      "Price Change %",
      "Market Value",
      "Day Change $",
      "Day Change %",
      "Cost Basis",
      "Gain/Loss $",
      "Gain/Loss %",
      "Reinvest Dividends?",
      "Capital Gains?",
      "% Of Account",
      "Dividend Yield",
      "Last Dividend",
      "Ex-Dividend Date",
      "P/E Ratio",
      "52 Week Low",
      "52 Week High",
      "Volume",
      "Intrinsic Value",
      "In The Money",
      "Security Type"
    ]
  }
];

export interface SimpleDialogProps {
  open: boolean;
  keys: {};
  handleOk_: (value: any) => void;
  handleCancel_: () => void;
}

function KeySelection(props: SimpleDialogProps) {
  const { handleOk_, handleCancel_, open } = props;
  const [selectedKeys, setSelectedKeys] = React.useState({});

  const handleListItemClick = (
    table: string,
    colName: string,
    index: number
  ) => {
    console.log(table, colName, index);
    setSelectedKeys({ ...selectedKeys, [index]: { table, colName } });
    console.log(selectedKeys);
  };

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
                    {t.columns.map((name, i) => (
                      <ListItem
                        disablePadding
                        button
                        onClick={() =>
                          handleListItemClick(t.tableName, name, table_index)
                        }
                        key={t.tableName + name}
                      >
                        <ListItemButton>
                          {_.get(selectedKeys, `${table_index}.colName`) ===
                            name && (
                            <ListItemIcon>
                              <VpnKey />
                            </ListItemIcon>
                          )}
                          <ListItemText
                            inset={
                              _.get(selectedKeys, `${table_index}.colName`) !==
                              name
                            }
                            primary={name}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => handleCancel_()}>Cancel</Button>
        <Button onClick={(e) => handleOk_(selectedKeys)}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function App() {
  const [open, setOpen] = React.useState(true);
  const [keys, setKeys] = React.useState({});
  const [filter, setFilter] = React.useState<Filter>("a-intersection-b");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleOk = (keys: { 0; 1 }) => {
    console.log("handleOk", keys, "filter", filter);
    setKeys(keys);
    setOpen(false);
    // set some loading modal
    // refresh table data and render it per the key and filter selections
    // or useEffect instead?
  };

  const handleCancel = () => {
    setOpen(false);
  };

  type Filter =
    | "just-a"
    | "a-minus-b"
    | "a-intersection-b"
    | "b-minus-a"
    | "just-b";

  const joinFormat = (keySelection, filter: Filter) => {
    let set = (setName): { table: string; colName: string } => {
      return keySelection[setName === "a" ? 0 : 1];
    };
    let theLight = `with left_only as (
      select 'a' as set_n, ${set("a").colName} as key1
      from ${set("a").table}
      except 
      select 'a' as set_n, ${set("b").colName} as key1
      from ${set("b").table}),
    right_only as (
      select 'b' as set_n, ${set("b").colName} as key1
      from ${set("b").table}
      except 
      select 'b' as set_n, ${set("a").colName} as key1
      from ${set("a").table}
    ),
    intersection_ as (
      select 'ab' as set_n, ${set("a").colName} as key1
      from ${set("a").table}
      intersect 
      select 'ab' as set_n, ${set("b").colName} as key1
      from ${set("b").table}
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
    select *
    from unionish
    left join ${set("a").table} on ${set("a").table}.${set("a").colName}
    } = unionish.key1
    left join ${set("b").table} on ${set("b").table}.${set("b").colName}
    } = unionish.key1;`;

    return theLight;
  };

  React.useEffect(() => {
    console.log("in useEffect", filter);
    if (Object.keys(keys).length >= 2) {
      console.log(joinFormat(keys, filter));
    }
  });

  const handleFilterChange = (
    e: React.MouseEvent<HTMLElement>,
    newValue: Filter
  ) => {
    setFilter(newValue);
  };

  return (
    <Paper
      sx={{
        p: 2,
        margin: "auto",
        maxWidth: 1280,
        flexGrow: 1,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "#1A2027" : "#fff"
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography gutterBottom variant="subtitle1" component="div">
            <strong>{"{A}"}</strong> {_.get(keys, "0.table", "Select keys")}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <Button
              variant="outlined"
              startIcon={<VpnKey />}
              onClick={handleClickOpen}
            >
              {_.get(keys, "0.colName", "Select key")}
            </Button>
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <ToggleButtonGroup
            onChange={handleFilterChange}
            exclusive
            size="small"
            color="primary"
            fullWidth={true}
            sx={{ height: 56 }}
          >
            <ToggleButton value="just-a" sx={{ border: 0 }}>
              <JustA width="95%" />
            </ToggleButton>
            <ToggleButton value="a-minus-b" sx={{ border: 0 }}>
              <AMinusB width="95%" />
            </ToggleButton>
            <ToggleButton value="a-intersection-b" sx={{ border: 0 }}>
              <AIntersectionB width="95%" />
            </ToggleButton>
            <ToggleButton value="b-minus-a" sx={{ border: 0 }}>
              <BMinusA width="95%" />
            </ToggleButton>
            <ToggleButton value="just-b" sx={{ border: 0 }}>
              <JustB width="95%" />
            </ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={filter}
            onChange={handleFilterChange}
            exclusive
            size="small"
            color="primary"
            fullWidth={true}
          >
            <ToggleButton value="just-a">
              <Tooltip arrow title={"Just show table A by itself"}>
                <span>Just A</span>
              </Tooltip>
            </ToggleButton>

            <ToggleButton value="a-minus-b">
              <Tooltip
                arrow
                title={
                  "Show table A, subtracting rows that match by key in table B"
                }
              >
                <span>A - B</span>
              </Tooltip>
            </ToggleButton>

            <ToggleButton value="a-intersection-b">
              <Tooltip
                arrow
                title={
                  "Show only rows that match by key across tables A and B, the intersection."
                }
              >
                <span>A ∩ B</span>
              </Tooltip>
            </ToggleButton>

            <ToggleButton value="b-minus-a">
              <Tooltip
                arrow
                title={
                  "Show table B, subtracting rows that match by key in table A"
                }
              >
                <span>B - A</span>
              </Tooltip>
            </ToggleButton>

            <ToggleButton value="just-b">
              <Tooltip arrow title={"Just show table B by itself"}>
                <span>Just B</span>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        <Grid item xs={3}>
          <Typography gutterBottom variant="subtitle1" component="div">
            <strong>{"{B}"}</strong> {_.get(keys, "1.table", "Select keys")}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <Button
              variant="outlined"
              startIcon={<VpnKey />}
              onClick={handleClickOpen}
            >
              {_.get(keys, "1.colName", "Select key")}
            </Button>
          </Typography>
        </Grid>
      </Grid>

      <KeySelection
        keys={keys}
        open={open}
        handleOk_={handleOk}
        handleCancel_={handleCancel}
      />
    </Paper>
  );
}
