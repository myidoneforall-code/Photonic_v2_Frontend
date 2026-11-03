import { Checkbox } from "antd";
import React from "react";
import classes from "./components.module.css";

export default function CommonCheckbox({
  checked,
  lable,
  onChange,
  lableStyles = {},
  disabled = false,
}) {
  return (
    <div className={classes.checkBoxContainer}>
      <Checkbox
        checked={checked}
        onChange={() => {
          onChange(!checked);
        }}
        disabled={disabled}
        className={"CheckBox_innerStyle"}
      />
      {lable && (
        <p className={classes.checkTitle} style={{ ...lableStyles }}>
          {lable}
        </p>
      )}
    </div>
  );
}
