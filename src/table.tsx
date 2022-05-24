import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

import VpnKey from "@mui/icons-material/VpnKey";
import { Stack, Typography } from "@mui/material";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
}

const columns: Column[] = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "code", label: "ISO\u00a0Code", minWidth: 100 },
  {
    id: "population",
    label: "Population",
    minWidth: 170
  },
  {
    id: "size",
    label: "Size\u00a0(km\u00b2)",
    minWidth: 170
  },
  {
    id: "density",
    label: "Density",
    minWidth: 170
  }
];

interface Data {
  name: string;
  code: string;
  population: number;
  size: number;
  density: number;
}

function createData(
  name: string,
  code: string,
  population: number,
  size: number
): Data {
  const density = population / size;
  return { name, code, population, size, density };
}

const rows = [
  createData("India", "IN", 44, 3287263),
  createData("China", "CN", 1403500365, 9596961),
  createData("Italy", "IT", 60483973, 301340),
  createData("United States", "US", 327167434, 9833520),
  createData("Canada", "CA", 37602103, 9984670),
  createData("Australia", "AU", 25475400, 7692024),
  createData("Germany", "DE", 83019200, 357578),
  createData("Ireland", "IE", 4857000, 70273),
  createData("Mexico", "MX", 126577691, 1972550),
  createData("Japan", "JP", 126317000, 377973),
  createData("France", "FR", 67022000, 640679),
  createData("United Kingdom", "GB", 67545757, 242495),
  createData("Russia", "RU", 146793744, 17098246),
  createData("Nigeria", "NG", 200962417, 923768),
  createData("Brazil", "BR", 210147125, 8515767)
];

export default function DataTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer sx={{ height: "75vh" }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="left" colSpan={2}>
                <Stack direction="row" spacing={2}>
                  <VpnKey /> <Typography>Keys</Typography>
                </Stack>
              </TableCell>
              <TableCell align="left" colSpan={2}>
                <Typography>Dataset A</Typography>
              </TableCell>
              <TableCell align="left" colSpan={2}>
                <Typography>Dataset B</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                key="key:setname-td"
                align="left"
                style={{ minWidth: 35 }}
              >
                Set
              </TableCell>
              <TableCell
                key="key:table-a:pk_user_id; table-b:patient_id"
                align="left"
                style={{ minWidth: 35 }}
              >
                pk_user_id:patient_id
              </TableCell>
              <TableCell
                key="key:table-a:age; table-b:age"
                align="left"
                style={{ minWidth: 35 }}
              >
                age
              </TableCell>
              <TableCell
                key="key:table-a:fk_company_id"
                align="left"
                style={{ minWidth: 35 }}
              >
                fk_company_id
              </TableCell>
              <TableCell
                key="key:table-a:roles[]"
                align="left"
                style={{ minWidth: 35 }}
              >
                roles[]
              </TableCell>
              <TableCell
                key="key:table-a:treasure_id"
                align="left"
                style={{ minWidth: 35 }}
              >
                treasure_id
              </TableCell>
              <TableCell
                key="key:table-a:treaures[]"
                align="left"
                style={{ minWidth: 35 }}
              >
                treasures[]
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align="left">
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      {/*
      <TablePagination
        rowsPerPageOptions={[25, 100, 300]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
            */}
    </Paper>
  );
}
