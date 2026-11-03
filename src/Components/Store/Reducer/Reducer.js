export const initialData = {
  lightcontrollerlist: [],
  ControllerId: {},
  Addgroupname: "",
  motorscheduleedit: [], //motorsettingedit
  valvescheduleedit: [], //valvesettingedit
  Deletecontrollerview: [], //delete controller
  userlist: {
    page: 1,
    size: 10,
    items: [],
    total: 0,
  },
  groupslist: [],
  groupmap: [],
  controllermap: [],
  groupuser: [],
  groupcontroller: [],
  filterdata: {
    controllername: "",
    controllercode: "",
    devicecode: "",
    usertype: "",
    user_id: "",
    sortby: "",
    groupid: "",
  },
  deletefilter: {
    controllername: "",
    controllercode: "",
    devicecode: "",
    usertype: "",
    sortby: "",
    groupid: "",
    empty_controller: "",
  },
  deletepageState: 1,
  groupnames: { user: "", controller: "" },
  webtest: "",
  CCMailStore: [],

  pagestate: 1,
  DeviceFilter: {
    page: 1,
    values: {
      device_code: "",
      device_name: "",
      controller_id: "",
      device_type: "",
      order_by: "",
      order: "",
    },
  },
  motorViewDatas: null,
  lightViewDatas: null,
  AMCfilters: {
    page: 1,
    size: 50,
    values: {
      code: "",
      sim_number: "",
      user_id: "",
      network: "",
      from_date: "",
      to_date: "",
      unit_type: 1,
      name: "",
      controller_id: null,
      device_id: null,
      controller_type: 1,
      device_type: null,
      status: null,
      amc_status: null,
      is_sim: 0,
    },
  },
  GroupFilters: {
    page: 1,
    values: {
      name: "",
      empty_group: 0,
    },
  },
  UserFilters: {
    page: 1,
    values: {
      is_empty: 0,
      usertype: "",
      group_id: "",
      name: "",
    },
  },
  LoginUserData: 0,
};

export const Reduxaction = {
  UpdateLoginUserData: (state, action) => {
    return {
      ...state,
      LoginUserData: action.payload,
    };
  },
  UpdateControllerId: (state, action) => {
    return {
      ...state,
      ControllerId: action.payload,
    };
  },
  Updatelightcontrollerlist: (state, action) => {
    return {
      ...state,
      lightcontrollerlist: action.payload,
    };
  },
  UpdateAddgroupname: (state, action) => {
    return {
      ...state,
      Addgroupname: action.payload,
    };
  },
  Updatemotorscheduleedit: (state, action) => {
    return {
      ...state,
      motorscheduleedit: action.payload,
    };
  },
  Updatevalvescheduleedit: (state, action) => {
    return {
      ...state,
      valvescheduleedit: action.payload,
    };
  },
  UpdateDeletecontrollerview: (state, action) => {
    return {
      ...state,
      Deletecontrollerview: action.payload,
    };
  },
  Updateuserlist: (state, action) => {
    return {
      ...state,
      userlist: action.payload,
    };
  },

  Updategroupmap: (state, action) => {
    return {
      ...state,
      groupmap: action.payload,
    };
  },
  Updatecontrollermap: (state, action) => {
    return {
      ...state,
      controllermap: action.payload,
    };
  },
  Updategroupuser: (state, action) => {
    return {
      ...state,
      groupuser: action.payload,
    };
  },
  Updategroupcontroller: (state, action) => {
    return {
      ...state,
      groupcontroller: action.payload,
    };
  },
  Updatefilterdata: (state, action) => {
    return {
      ...state,
      filterdata: action.payload,
    };
  },
  Updatedeletefilter: (state, action) => {
    return {
      ...state,
      deletefilter: action.payload,
    };
  },
  UpdatedeletepageState: (state, action) => {
    return {
      ...state,
      deletepageState: action.payload,
    };
  },
  Updategroupnames: (state, action) => {
    return {
      ...state,
      groupnames: action.payload,
    };
  },
  Updatewebtest: (state, action) => {
    return {
      ...state,
      webtest: action.payload,
    };
  },
  UpdateCCMail: (state, action) => {
    return {
      ...state,
      CCMailStore: action.payload,
    };
  },

  UpdatePageState: (state, action) => {
    return {
      ...state,
      pagestate: action.payload,
    };
  },
  UpdateDeviceFilter: (state, action) => {
    return {
      ...state,
      DeviceFilter: action.payload,
    };
  },
  UpdatemotorViewDatas: (state, action) => {
    return {
      ...state,
      motorViewDatas: action.payload,
    };
  },
  UpdatelightViewDatas: (state, action) => {
    return {
      ...state,
      lightViewDatas: action.payload,
    };
  },
  UpdateAMCfilters: (state, action) => {
    return {
      ...state,
      AMCfilters: action.payload,
    };
  },
  UpdateGroupFilters: (state, action) => {
    return {
      ...state,
      GroupFilters: action.payload,
    };
  },
  UpdateUserFilters: (state, action) => {
    return {
      ...state,
      UserFilters: action.payload,
    };
  },
};
