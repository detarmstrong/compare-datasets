import React from "react";
import { ReactComponent as JustA } from "./images/just-a.svg";
import { ReactComponent as AMinusB } from "./images/a-minus-b.svg";
import { ReactComponent as AIntersectionB } from "./images/a-intersection-b.svg";
import { ReactComponent as BMinusA } from "./images/b-minus-a.svg";
import { ReactComponent as JustB } from "./images/just-b.svg";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Tooltip } from "@mui/material";
import "./styles.scss";

function VennFilterButtons(props) {
  return (
    <>
      <ToggleButtonGroup
        onChange={props.handleFilterChange}
        exclusive
        size="small"
        color="primary"
        fullWidth={true}
        sx={{ height: 56 }}
      >
        <ToggleButton value="just-a" sx={{ border: 0 }}>
          <JustA width="95%" height="40" />
        </ToggleButton>
        <ToggleButton value="a-minus-b" sx={{ border: 0 }}>
          <AMinusB width="95%" height="40" />
        </ToggleButton>
        <ToggleButton value="a-intersection-b" sx={{ border: 0 }}>
          <AIntersectionB width="95%" height="40" />
        </ToggleButton>
        <ToggleButton value="b-minus-a" sx={{ border: 0 }}>
          <BMinusA width="95%" height="40" />
        </ToggleButton>
        <ToggleButton value="just-b" sx={{ border: 0 }}>
          <JustB width="95%" height="40" />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup
        value={props.filter}
        onChange={props.handleFilterChange}
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
    </>
  );
}

export default VennFilterButtons;
