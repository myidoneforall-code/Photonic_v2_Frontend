export const GOOFLE_API_KEY = "AIzaSyCMEYVBewYi-ZOZYrZYDTNFt0yKrdYWXpY";
// export const BASE_URL = "http://192.168.1.209:8005/photonic/";
// export const BASE_URL = "https://psdas.in/photonic/";
// "homepage": "https://psdas.in/psdas",
// export const BASE_URL = "http://3.108.54.84/photonic";
export const baseURL = window.appConfig.BASE_URL;
//new
// AIzaSyCMEYVBewYi-ZOZYrZYDTNFt0yKrdYWXpY

//old
// AIzaSyClx385mEpQwwx9KhhxTjUNq-OD50vithU

// dev

// BASE_URL="https://psdas.in/dev/photonic",
// homepage="https://psdas.in/dev/"

export const DeviceTypeDropdown = [
  {
    value: 0,
    lable: "All",
  },
  {
    value: 1,
    lable: "Tank",
  },
  {
    value: 2,
    lable: "Flow Meter",
  },
  {
    value: 3,
    lable: "Valve",
  },
  {
    value: 5,
    lable: "Multi",
  },
];

// REGEX
export const REGEX = {
  NAME_REGEX: /^[A-Za-z_ ]+$/,
  NUMBER_REGEX: /^[0-9]*$/,
  MULTY_NUMBER_REGEX: /^[0-9 ,]*$/,

  SPECIAL_CHARACTER_REGEX: /^[A-Za-z0-9]+$/,
  MOBILE_REGEX: /^[6-9]{1}[0-9]{9}$/,
  PASSWORD_REGEX: /(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])/,
  AMOUNT: /^[0-9][0-9]*[.]?[0-9]{0,2}$/,
  SIGN_AMOUNT: /^[-+|0-9]{1}[0-9]*[.]?[0-9]{0,2}$/,
  EMAIL:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
};
export const UserTypeOptions = [
  {
    value: 0,
    label: "All",
  },
  {
    value: 1,
    label: "Private",
  },
  {
    value: 2,
    label: "Goverment",
  },
];

export const ControllerTypeDropdown = [
  {
    value: 0,
    label: "All",
  },
  {
    value: 1,
    label: "Motor",
  },
  {
    value: 2,
    label: "Light",
  },
];

export const FilterDeviceTypeDropdown = [
  {
    value: 0,
    label: "All",
  },
  {
    value: 1,
    label: "Tank",
  },
  {
    value: 2,
    label: "Flow Meter",
  },
  {
    value: 3,
    label: "Valve",
  },
  {
    value: 4,
    label: "Light",
  },
];

export const AccessTypes = [
  {
    value: 0,
    label: "Admin",
  },
  {
    value: 1,
    label: "Control",
  },
  {
    value: 2,
    label: "Operator",
  },
  {
    value: 3,
    label: "View only",
  },
];

export const SORT_OPTIONS = [
  {
    value: 0,
    label: "All",
  },
  {
    value: 1,
    label: "On",
  },
  {
    value: 2,
    label: "Off",
  },
  {
    value: 3,
    label: "Notification",
  },
];

export const PaginationSize = [
  {
    value: 10,
    label: "10 / page",
  },
  {
    value: 25,
    label: "25 / page",
  },
  {
    value: 50,
    label: "50 / page",
  },
];

export const PAYMENT_STATUS = [
  {
    value: 0,
    label: "Failed",
  },
  {
    value: 1,
    label: "Success",
  },
  {
    value: 2,
    label: "Processing",
  },
];

export const WeeklyDaysList = [
  {
    label: "Sunday",
    holiday_id: 6,
    name: "Sun",
    status: 0,
  },
  {
    label: "Monday",
    holiday_id: 0,
    name: "Mon",
    status: 0,
  },
  {
    label: "Tuesday",
    holiday_id: 1,
    name: "Tue",
    status: 0,
  },
  {
    label: "Wednesday",
    holiday_id: 2,
    name: "Wed",
    status: 0,
  },
  {
    label: "Thursday",
    holiday_id: 3,
    name: "Thu",
    status: 0,
  },
  {
    label: "Friday",
    holiday_id: 4,
    name: "Fri",
    status: 0,
  },
  {
    label: "Saturday",
    holiday_id: 5,
    name: "Sat",
    status: 0,
  },
];

export const ValveModalList = [
  {
    value: 0,
    label: "Manual",
  },
  // {
  //   value: 1,
  //   label: "",
  // },
  {
    value: 2,
    label: "Weekly",
  },
];
export const timePickerToolbarTitle = (device_name = "") =>
  `Select how many hours ${device_name} should run`;

export const UsageLimit = [
  {
    id: 0,
    name: "Not Reached",
  },
  {
    id: 1,
    name: "Reached",
  },
];

export const MultiDeviceList = ["tank", "flow", "valve"].reduce(
  (acc, key, i) => ({
    ...acc,
    [key]: Array(i === 0 ? 3 : 9)
      .fill("")
      .map((_, index) => ({ id: index + 1, status: 0 })),
  }),
  {}
);


// The checklist of a chlorinator on the production page, like the positions of a
// multi device: R1 is the unit status, R2 the pH, R3 the TDS and R4 the chlorine.
export const ChlorinatorChecklist = [
  { id: 1, label: "R1 Chlorinator" },
  { id: 2, label: "R2 pH" },
  { id: 3, label: "R3 TDS" },
  { id: 4, label: "R4 Chlorine" },
];

// The R numbers ticked on the checklist. Nothing is ticked by default (null), like the
// multi positions: only what is ticked is shown.
export const chlorinatorTicked = (position) => {
  if (position === null || position === undefined) {
    return [];
  }
  return String(position)
    .split(",")
    .map((part) => parseInt(part, 10))
    .filter((part) => !Number.isNaN(part));
};
