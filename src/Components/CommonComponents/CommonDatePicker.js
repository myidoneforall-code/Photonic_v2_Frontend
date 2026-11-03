import dayjs from "dayjs";
import classes from "./components.module.css";
import { DatePicker } from "antd";

export default function CommonDateTimePicker({
  placeholder,
  value,
  onChange,
  styles,
  disabled = false,
  allowClear = true,
  formate,
  disableDate = false,
  startDate,
  endDate,
  isFuture,
  isPast,
  picker,
  size,
  status = "",
  fromtodate,
  for_todate = false,
  inlinefield = false,
  filterformtoDate = false,
}) {
  const handledisableDates = (date) => {
    if (isFuture) {
      return date.isAfter(new Date());
    } else if (isPast) {
      return date.isBefore(dayjs().startOf("day"));
    } else if (fromtodate) {
      let startCheck = true;
      let endCheck = true;
      if (startDate) {
        startCheck =
          (date && date < dayjs(startDate, "YYYY-MM-DD")) ||
          date > dayjs(new Date());
      }
      if (endDate) {
        endCheck = date && date > dayjs(endDate, "YYYY-MM-DD");
      }
      return (startCheck && startDate) || (endCheck && endDate);
    } else if (filterformtoDate) {
      let startCheck = true;
      let endCheck = true;
      if (startDate) {
        startCheck = date && date < dayjs(startDate, "YYYY-MM-DD");
      }
      if (endDate) {
        endCheck = date && date > dayjs(endDate, "YYYY-MM-DD");
      }
      return (startCheck && startDate) || (endCheck && endDate);
    } else if (for_todate) {
      return date.isBefore(startDate);
    }
  };

  return (
    // <div className={classes.fieldBlock}>
    <DatePicker
      status={status}
      allowClear={allowClear}
      // showTime={showTime}
      format={formate}
      popupStyle={{ zIndex: 11000 }}
      placeholder={placeholder}
      value={value ? dayjs(value) : null}
      onChange={onChange}
      disabled={disabled}
      style={{
        ...styles,
        background: disabled ? "rgb(216 216 216 / 44%)" : "",
      }}
      className={`${inlinefield ? classes.inlinefield : classes.inputBox} `}
      disabledDate={(date) => (disableDate ? handledisableDates(date) : null)}
      picker={picker}
      size={size}
    />
    // </div>
  );
}
