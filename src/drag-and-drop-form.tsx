// TODO next steps:
// OK start with just drag target
// OK drop files onto it
// OK load all files to sqlite (use filename as table name or use internal table to link internal table id to the user given name)
//   Chose to use filename as table name as tech debt
// list column names in two parallel vertical lists

import { Typography } from "@mui/material";
import _ from "lodash";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { ReactComponent as JustA } from "./images/just-a.svg";
import "./styles.scss";

function Form(props) {
  const [sheetNames, setSheetNames] = useState([]);
  const [files, setFiles] = useState("");

  const fileTypes = ["CSV", "DB"];

  function handleFileChange(files) {
    setFiles(files);
    setSheetNames(_.map(files, (f) => f.name));

    let promises = _.map(files, (f) => {
      let fileName = f.name.split(".")[0];
      return f.text().then((csvText) => {
        return props.loadCsv(fileName, csvText);
      });
    });

    Promise.allSettled(promises).then((results) =>
      props.setColumns(_.map(results, (r) => r.value.columns))
    );
  }

  const backgroundImage = `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='18' ry='18' stroke='%23000000FF' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`;
  const borderRadius = `18px`;

  const stack2 = (
    <div
      className="container"
      style={{ backgroundImage: backgroundImage, borderRadius: borderRadius }}
    >
      <div className="box box-1">
        <div>
          <JustA width="75" />
        </div>
      </div>
      <div className="box box-2">
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Drop two CSV files here
        </Typography>
      </div>
    </div>
  );

  return (
    <form>
      <FileUploader
        multiple={true}
        handleChange={handleFileChange}
        name="file"
        types={fileTypes}
        label="Upload or drop two CSV files here"
        children={stack2}
      />
      {/*<p>
        {files
          ? `File names: ${_.map(files, (f: { name }) => f.name).join()}`
          : "no files uploaded yet"}
      </p>
        */}
    </form>
  );
}

export default Form;
