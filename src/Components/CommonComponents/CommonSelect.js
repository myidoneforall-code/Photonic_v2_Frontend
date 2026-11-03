import React, { useState } from "react";
import { Select } from "antd";
import classes from "./components.module.css";
import { SimDropdownService } from "../../Service/ApiService";
import toast from "react-hot-toast";

let timeout;
let currentValue;

const fetchData = (value, callback) => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;

  const formData = new FormData();
  formData.append("search_key", value);

  const fake = () => {
    SimDropdownService(formData).then(({ data }) => {
      if (currentValue === value) {
        if (data.status === 1) {
          const mappedData = data.data.map((item) => ({
            value: item.id,
            label: item.sim_number, // assuming 'sim_number' is the label you want
          }));
          callback(mappedData);
        } else {
          toast.error(data.msg);
        }
      }
    });
  };

  if (value) {
    timeout = setTimeout(fake, 300); // Set debounce to 300ms
  } else {
    callback([]); // Clear the dropdown if search is empty
  }
};

const CommonSelect = ({
  placeholder,
  OtherClassName,
  value,
  options,
  onChange,
  styles,
  disabled = false,
  mode,
  allowClear = true,
  onKeyDown,
  optionFilterProp,
  onBlur = () => {},
  inlinefield = false,
  responsiveClassName,
  isSearchable = false,
  valueName,
}) => {
  const [data, setData] = useState([]);
  const [searchKey, setSearchKey] = useState("");

  const handleSearch = (newValue) => {
    setSearchKey(newValue);
    if (newValue?.length >= 5) {
      fetchData(newValue, setData);
    } else if (!value) {
      setData([]);
    }
  };

  const getFinalOptions = () => {
    if (isSearchable && searchKey.length >= 5) {
      return data; // Return the fetched options when searchKey length is >= 5
    }
    return data; // Return default options if not searching
  };
  const getValue = () => {
    let findValue = getFinalOptions()?.find((ele) => ele?.value === value);
    return findValue ? value : valueName;
  };
  return (
    <Select
      mode={mode}
      allowClear={allowClear}
      showSearch={true}
      options={isSearchable ? getFinalOptions() : options}
      dropdownStyle={{ zIndex: 11000 }}
      placeholder={placeholder}
      value={valueName ? getValue() : value}
      onChange={onChange}
      disabled={disabled}
      className={`${
        OtherClassName ? "searchInputClass" : classes.filterselectinput
      } 
      ${responsiveClassName ? "responsiveStyels" : ""}
      ${inlinefield ? "inlineSelect" : ""}
      `}
      onClick={(e) => {
        if (onKeyDown) {
          onKeyDown(e);
        }
      }}
      onBlur={onBlur}
      optionFilterProp={optionFilterProp || "label"}
      filterOption={(input, option) =>
        (option[optionFilterProp || "label"] ?? "")
          .toLocaleLowerCase()
          .includes(input.toLocaleLowerCase())
      }
      style={{
        ...styles,
        border: "none",
        background: disabled ? "rgb(216 216 216 / 44%)" : "#fff",
      }}
      onSearch={handleSearch} // Using the onSearch prop to capture the typing
    />
  );
};

export default CommonSelect;
