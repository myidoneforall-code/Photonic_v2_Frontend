import { LocalizationProvider, MobileTimePicker } from "@mui/x-date-pickers";
import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import classes from "./components.module.css";
import dayjs from "dayjs";

export default function CommonClockTimePicker({
  value,
  onChange,
  format = "HH:mm",
  istestFieldStyle = false,
  disabled = false,
  isTimeSetting = false,
  defaultValue,
  inputBoxStyles = {},
  istimeField = false,
  ampm = true,
}) {
  const timeSettingStyle = {
    borderRadius: "30px",
    height: "35px",
    width: "100px",
    background: "#ffd8d8",
    color: "gray",
  };
  const timeField = {
    outline: "none",
    background: "#ffffff",
    border: "none",
    // border: "0.5px solid rgba(0, 0, 0, 0.1)",
    // boxShadow: "0px 3px 4px rgb(0 0 0 / 8%)",
    borderRadius: "8px",
    // width: "100px",
    height: "51px",
    fontFamily: "Nunitos",
    fontSize: "14px",
    fontWeight: 500,
    color: "rgba(0, 0, 0, 0.7)",
    appearance: "none",
    minWidth: "100px",
    maxWidth: "150px",
  };

  const testFieldStyle = {
    "&.MuiFormControl-root": istimeField
      ? { ...timeField }
      : isTimeSetting
      ? { ...timeSettingStyle, ...inputBoxStyles }
      : {
          borderRadius: "30px",
          height: 40,
          width: 100,
        },
    "& .MuiOutlinedInput-root": istimeField
      ? { ...timeField }
      : isTimeSetting
      ? { ...timeSettingStyle, ...inputBoxStyles }
      : {
          borderRadius: "30px",
          width: 100,
          height: 40,
          "&:hover fieldset": {
            borderColor: "blue",
          },
          "&.Mui-focused fieldset": {
            borderColor: "green",
          },
        },
    "& .MuiOutlinedInput-root.Mui-error fieldset": {
      borderColor: "#d9d9d9 !important", // Remove error border color
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MobileTimePicker
        value={dayjs(value) ?? ""}
        format={format}
        ampm={ampm}
        onChange={onChange}
        defaultValue={defaultValue}
        className={classes.TimePickerStyle}
        slotProps={{
          textField: {
            sx: istestFieldStyle ? testFieldStyle : {},
          },
        }}
        disabled={disabled}
      />
    </LocalizationProvider>
  );
}
