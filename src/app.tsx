import * as React from "react";
import Button from "@mui/material/Button";
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

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import DataTable from "./table";
import DragAndDropForm from "./drag-and-drop-form";
import VennFilterButtons from "./venn-filter-buttons";

import _ from "lodash";
import { csvParse, autoType } from "d3-dsv";

import { createDbWorker } from "sql.js-httpvfs";
const workerUrl = "/sqlite.worker.js";
const wasmUrl = "/sql-wasm.wasm";

async function loadDb() {
  console.log("start load");
  const worker = await createDbWorker(
    [
      {
        from: "inline",
        config: {
          serverMode: "full",
          url: "/example.sqlite3",
          requestChunkSize: 4096
        }
      }
    ],
    workerUrl,
    wasmUrl
  );
  const result = await worker.db.query(`select * from mytable`);
  console.log("result", result);
  console.log("before awaitworkerdb");
  return worker;
}

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
  const [columns, setColumns] = React.useState([]);
  const [sqlWorker, setSqlWorker] = React.useState();

  React.useEffect(() => {
    async function doSelect() {
      const worker = await loadDb();
      setSqlWorker(worker);
      return await worker.db.query(`select * from mytable`);
    }
    doSelect();
  }, []); // NOTE empty array will cause this to only update on init

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

  const loadCsv = (name, csvText) => {
    // parse csv
    let theSheet = csvParse(csvText, autoType);
    let columns = theSheet.columns;

    // generate unique table name
    let tableName = name;
    let columnsDDL = _.map(columns, (col) => `${col} varchar`);

    // create table
    let ddl = `create table ${tableName} (${columnsDDL.join()})`;
    console.log("ddl", ddl);
    async function runSql() {
      await sqlWorker.db.run(ddl);

      // insert data
      _.each(theSheet, (row) => {
        let stmt = sqlWorker.db
          .prepare(`insert into ${tableName} (${columns.join()}) 
                             values (${Array(columns.length)
                               .fill("?")
                               .join()})`);
        stmt.bind(_.valuesIn(row));
        stmt.step();
      });
    }
    runSql();
    console.log({ tableName, columns });
    return { tableName, columns };
  };

  if (columns.length !== 2) {
    return <DragAndDropForm loadCsv={loadCsv} setColumns={setColumns} />;
  }

  // else
  return (
    <>
      <Paper
        elevation={0}
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
            <VennFilterButtons
              handleFilterChange={handleFilterChange}
              filter={filter}
            />
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

      <DataTable />
    </>
  );
}
