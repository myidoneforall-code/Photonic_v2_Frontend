import dayjs from "dayjs";
import toast from "react-hot-toast";
import { REGEX } from "./Constants";

export const JSONtoformdata = (object) => {
  const formData = new FormData();
  for (const key in object) {
    if (object[key] !== "") {
      // if (object[key] === null) {
      // }
      formData.append(
        key,
        typeof object[key] === "string" ? object[key]?.trim() : object[key]
      );
    }
  }

  return formData;
};

export const JSONtoformdatawithempty = (object) => {
  const formData = new FormData();
  for (const key in object) {
    formData.append(
      key,
      object[key] && typeof object[key] === "string"
        ? object[key]?.trim()
        : object[key]
    );
  }

  return formData;
};
export const getCurrentStartandEndDate = (date, prev) => {
  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD 00:00:00");
  const currentDate = dayjs().format("YYYY-MM-DD 23:59:59");
  if (date) {
    const start = dayjs(date).startOf("month").format("YYYY-MM-DD 00:00:00");
    const end = dayjs(date).endOf("month").format("YYYY-MM-DD 23:59:59");
    return { start_date: start, end_date: end };
  }
  const StartPrevmonthDate = dayjs()
    .subtract(1, "month")
    .format("YYYY-MM-DD 00:00:00");
  return {
    start_date: StartPrevmonthDate,
    end_date: currentDate
  };
};

export const RemoveNonNumeric = (value) => {
  return value.replace(/[^0-9]/g, "");
};

export const AllowAlphaNumeric = (data) => {
  return REGEX.SPECIAL_CHARACTER_REGEX.test(data) || data === "" ? true : false;
};

//SHOW TOAST FOR ERROR MASSEGE FROM API RESPONS

export function getCatchMsg(error) {
  if (error?.response?.data?.detail) {
    if (typeof error?.response?.data?.detail === "string") {
      return toast.error(error?.response?.data?.detail);
    } else {
      return Array.isArray(error?.response?.data?.detail)
        ? toast.error(error?.response?.data?.detail?.[0]?.msg)
        : toast.error(error?.response?.data?.detail?.msg);
    }
  } else if (error.response) {
    if (error.response.status === 404) {
      toast.error("The requested resource does not exist or has been deleted");
    } else if (error.response.status === 401) {
      toast.error("Please login to access this resource!");
    } else if (error.response.status === 500) {
      toast.error("Internal Server Error !");
    } else {
      toast.error("An error occurred");
    }
  } else if (error.request) {
    toast.error("Unable to connect to the server !");
  } else {
    return toast.error("Something went wrong nottt!");
  }
}

export const GetViewTabKey = (Data) => {
  for (let keys in Data) {
    if (Data[keys] === true) {
      return keys;
    }
  }
};

export const getlimitAction = (limit) => {
  if (limit === 0) {
    return "No Action";
  } else if (limit === 1) {
    return "Off Motor";
  } else if (limit === 2) {
    return "On Motor";
  } else return "";
};
export const getUsagelimitAction = (limit) => {
  if (limit === 0) {
    return "No Action";
  } else if (limit === 1) {
    return "Off Motor";
  } else if (limit === 2) {
    return "On Motor";
  } else return "";
};
export const Float_Validation = (value) => {
  if (value.match(REGEX.AMOUNT) || value === "") {
    return true;
  } else {
    return false;
  }
  // return !isNaN(value) || value === "" ? true : false;
};

export const Sim_Number_Validation = (value) => {
  if (value.match(REGEX.MULTY_NUMBER_REGEX) || value === "") {
    return true;
  } else {
    return false;
  }
  // return !isNaN(value) || value === "" ? true : false;
};

export const formatIndianNumber = (num) => {
  const numStr = num.toString();
  const lastThreeDigits = numStr.slice(-3);
  const otherDigits = numStr.slice(0, -3);

  const formattedNumber =
    otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "" + lastThreeDigits;
  if (formattedNumber[0] === ",") {
    return formattedNumber.substr(1, 3);
  }

  return formattedNumber;
};
export const TableCheckData = (data) => {
  return data ? data : "-";
};

export function filterValidObject(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== "Select branch" && value !== "Select Created By") {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
    }
    return acc;
  }, {});
}

export const GetSerialNo = (page, size, index) => {
  return (page - 1) * size + (index + 1);
};

export const StatusOptions = (type) => {
  return [
    {
      label: "All",
      value: -1
    },
    {
      label: type === 1 ? "Active" : "Activate",
      value: 1
    },
    {
      label: type === 1 ? "InActive" : "DeActivate",
      value: 0
    }
  ];
};

export const RequestType = [
  {
    value: 3,
    label: "ON"
  },
  {
    value: 4,
    label: "OFF"
  }
];

export const FindAvilable = (data) => {
  if (data?.controller_code) {
    return {
      data: {
        amc_msg: data.amc_msg,
        id: data.controller_code,
        name: data.controller_name
      },
      show: data.amc_status >= 1 ? false : true
    };
  } else if (data.tank_level?.length > 0) {
    return {
      data: {
        amc_msg: data.tank_level[0].amc_msg,
        id: data.tank_level[0].device_code,
        name: data?.tank_level[0].device_name
      },

      show: data.tank_level[0]?.amc_status >= 1 ? false : true
    };
  } else if (data.flow_meter?.length > 0) {
    return {
      data: {
        amc_msg: data.flow_meter[0].amc_msg,
        id: data.flow_meter[0].device_code,
        name: data?.flow_meter[0].device_name
      },
      show: data.flow_meter[0]?.amc_status >= 1 ? false : true
    };
  } else if (data.valve_device?.length > 0) {
    return {
      data: {
        amc_msg: data.valve_device[0].amc_msg,
        id: data.valve_device[0].device_code,
        name: data?.valve_device[0].device_name
      },
      show: data.valve_device[0]?.amc_status >= 1 ? false : true
    };
  } else if (data.multi_device?.length > 0) {
    return {
      data: {
        amc_msg: data.multi_device[0].amc_msg,
        id: data.multi_device[0].device_code,
        name: data?.multi_device[0].device_name
      },
      show: data.multi_device[0]?.amc_status >= 1 ? false : true
    };
  } else {
    return {
      show: false,
      data: {
        amc_msg: "",
        id: "",
        name: ""
      }
    };
  }
};

export const NavigateToPreviousScreen = (usertype, filterUserType) => {
  if (usertype === 1) {
    return filterUserType === 2
      ? "/dashboard/user/viewuser/admin"
      : "/dashboard/user/viewuser/production";
  } else {
    return "/dashboard/user/viewuser/subuser";
  }
};
export const TypeBasednames = (filters) => {
  if (filters?.unit_type === 1) {
    return {
      name: "Controller Name",
      code: "Controller Code",
      type: "Controller Type",
      key_name: "controller_name",
      key_code: "controller_code",
      key_type: "controller_type"
    };
  } else {
    return {
      name: "Device Name",
      code: "Device Code",
      type: "Device Type",
      key_name: "device_name",
      key_code: "device_code",
      key_type: "device_type"
    };
  }
};
// get table list serial number
export const getTableSNO = (page, size, index) => {
  return (page - 1) * size + (index + 1);
};

export const getValveTimeNames = (motorMode) => {
  return {
    time1:
      motorMode == 0 || motorMode == 1 || motorMode == 2
        ? "Start at"
        : "On Time",
    time2:
      motorMode == 0 || motorMode == 1 || motorMode == 2
        ? "Run for"
        : "Off Time"
  };
};
