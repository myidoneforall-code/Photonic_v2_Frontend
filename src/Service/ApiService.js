import axios from "./Axios";

export const changepasswordapi = (data) => {
  return axios.post("change_password/", data);
};

export const loginapi = (formdata) => {
  return axios.post("login/access-token", formdata);
};
export const registerapi = (formdata) => {
  return axios.post("user/signup", formdata);
};
export const forgotpasswordapi = (formdata) => {
  return axios.post("forgot_password", formdata);
};
export const resetforgotpwdapi = (formdata) => {
  return axios.post("reset_forgot_password", formdata);
};
export const resetotpapi = (formdata) => {
  return axios.post("resend_otp", formdata);
};
export const motordata = (formdata) => {
  return axios.get(`controller/view_controller/${formdata}`);
};
export const lastReceivedData = (product_code) => {
  return axios.get(
    `controller/last_received_data?product_code=${product_code}`
  );
};
export const lastReceivedDataBatch = (codes) => {
  const formdata = new FormData();
  formdata.append("codes", codes.join(","));
  return axios.post("controller/last_received_data_batch", formdata);
};

export const dashboardapi = (formdata) => {
  return axios.post("dashboard/dashboard", formdata);
};

export const Mapdashboardapi = (formdata) => {
  return axios.post("dashboard/map_location", formdata);
};

// export const map = (formdata) => {
//   return axios.post("dashboard/dashboard", formdata);
// };

export const listcontrollerapi = (formdata, page) => {
  return axios.post(
    `controller/list_controller?page=${page}&size=12`,
    formdata
  );
};

export const listControllerDeviceapi = (formdata, page) => {
  return axios.post(
    `controller/list_controller_device?page=${page}&size=12`,
    formdata
  );
};

export const ViewControllerDeviceapi = (formdata) => {
  return axios.post("controller/view_controller_device", formdata);
};
export const listusersapi = (formdata, page) => {
  return axios.post(
    `group/list_user_controller_mapping?page=${page}&size=${12}`,
    formdata
  );
};
export const servicedetailsapi = (formdata, page) => {
  return axios.post(
    `service_details/list_service_details?page=${page}&size=12`,
    formdata
  );
};
export const controllerhistorydetailsapi = (formdata, page, size) => {
  return axios.post(
    `report/runtime_report?page=${page}&size=${size}`,
    formdata
  );
};

export const devicehistorydetailsapi = (formdata, page, size) => {
  return axios.post(
    `report/device_runtime_report?page=${page}&size=${size}`,
    formdata
  );
};

export const usergroupdropdown = (formData) => {
  return axios.post("drop_down/user_group_dropdown", formData);
};
export const buttonapi = (formData, abortcontroller) => {
  return axios.post("controller_publish/refresh_data", formData, {
    signal: abortcontroller?.signal
  });
};
export const controllerrefreshapi = (formData, abortcontroller) => {
  return axios.post("controller_publish/refresh_data", formData, {
    signal: abortcontroller?.signal
  });
};
export const state = () => {
  return axios.post("drop_down/states_cities");
};
export const city = (formData) => {
  return axios.post("drop_down/states_cities", formData);
};
export const changegroup = (formData) => {
  return axios.post("group/change_group", formData);
};
export const editcontroller = (id, formData) => {
  return axios.put(`controller/update_controller/${id}`, formData);
};
export const profile = (formData) => {
  return axios.get(`user/profile/${formData}`);
};
export const editprofile = (datas, formData) => {
  return axios.put(`user/update_user/${formData}`, datas);
};
export const editdevice = (tankdetail, id) => {
  return axios.put(`device/update_device/${id}`, tankdetail);
};
export const editmotorsetting = (id, formData) => {
  return axios.put(
    `controller/update_motor_controller_setting/${id}`,
    formData
  );
};
export const addcontroller = (formData) => {
  return axios.post("controller/add_controller", formData);
};
export const Addgroupapi = (formData) => {
  return axios.post("group/add_group", formData);
};
export const editsettingapi = (id, formData, abortcontroller) => {
  return axios.post(`device/time_setting/${id}`, formData, {
    signal: abortcontroller?.signal
  });
};
export const detetemotortime = (formData) => {
  return axios.post("controller/remove_controller_time_setting", formData);
};
export const detetedevicetime = (formData) => {
  return axios.post("device/remove_device_time_setting", formData);
};
export const controllerdropdown = (formData) => {
  return axios.post("drop_down/list_controller_dropdown", formData);
};
export const deletecontrollerapi = (formData) => {
  return axios.delete(`controller/delete_controller?controller_id=${formData}`);
};
export const createuser = (formData) => {
  return axios.post(`user/create_user`, formData);
};
export const listuser = (formData, pgno) => {
  return axios.post(`user/list_user?page=${pgno}&size=12`, formData);
};
export const deleteuserapi = (formData) => {
  return axios.delete(`/user/delete_user/${formData}`);
};
export const listgroup = (page, size, formData) => {
  return axios.post(`group/list_group?page=${page}&size=${size}`, formData);
};
export const editservice = (formdata) => {
  return axios.post("service_details/edit_service_details", formdata);
};
export const addservice = (formdata) => {
  return axios.post("service_details/add_service_details", formdata);
};
export const removegroup = (formdata) => {
  return axios.post("group/remove_group", formdata);
};
export const Mergegroupapi = (formdata) => {
  return axios.post("group/merge_group", formdata);
};
export const userdropdown = (formdata) => {
  return axios.post("drop_down/list_user_dropdown", formdata);
};
export const createusergroupapi = (formdata) => {
  return axios.post("group/create_user_group_mapping", formdata);
};
export const createusercontrollerapi = (formdata) => {
  return axios.post("group/create_user_controller_mapping", formdata);
};
export const removeservice = (formdata) => {
  return axios.post("service_details/remove_service", formdata);
};
export const editlight = (formdata) => {
  return axios.post("device/edit_light", formdata);
};
export const addlight = (formdata) => {
  return axios.post("device/add_light", formdata);
};
export const usergroupdropdownapi = (formdata) => {
  return axios.post("drop_down/user_group_dropdown", formdata);
};
export const groupdropdownapi = (formdata) => {
  return axios.post("drop_down/group_dropdown", formdata);
};
export const usercontrollerdropdownapi = (formdata) => {
  return axios.post("drop_down/list_controller_dropdown", formdata);
};
export const viewuser = (formdata) => {
  return axios.post("user/view_user", formdata);
};
export const removeusergroupapi = (formdata) => {
  return axios.post("group/remove_user_group_mapping", formdata);
};
export const changeusergroupapi = (formdata) => {
  return axios.post("group/change_user_group_mapping", formdata);
};
export const removeusercontrollerapi = (formdata) => {
  return axios.post("group/remove_user_controller_mapping", formdata);
};
export const changeusercontrollerapi = (formdata) => {
  return axios.post("group/change_user_controller_mapping", formdata);
};
export const createcontrollergroupapi = (formdata) => {
  return axios.post("group/create_controller_group_mapping", formdata);
};
export const listcontrollergroupapi = (formdata, page) => {
  return axios.post(
    `group/list_controller_group_mapping?page=${page}&size=${12}`,
    formdata
  );
};

export const listusergroupapi = (formdata, page) => {
  return axios.post(
    `group/list_user_group_mapping?page=${page}&size=${12}`,
    formdata
  );
};
export const removecontrollergroupapi = (formdata) => {
  return axios.post("group/remove_controller_group_mapping", formdata);
};
export const resetpasswordapi = (formdata) => {
  return axios.post("reset_password", formdata);
};
export const devicerefreshapi = (formdata, abortcontroller) => {
  return axios.post("device_publish/refresh_data", formdata, {
    signal: abortcontroller?.signal
  });
};
export const checkproduct = (formdata) => {
  return axios.post("controller/check_product", formdata);
};
export const adddeviceapi = (formdata) => {
  return axios.post("device/add_device", formdata);
};

export const consumption = (formdata) => {
  return axios.post("dashboard/consumption_report_web", formdata);
};

export const changestatus = (id, status) => {
  return axios.post(
    `controller/change_status?controller_id=${id}&status=${status}`
  );
};
export const viewdeviceapi = (formdata) => {
  return axios.get(`device/view_device/${formdata}`);
};
export const dashboardbarchart = (formdata) => {
  return axios.post("report/consumption_report_chart", formdata);
};
export const devicechart = (formdata) => {
  return axios.post("report/device_chart", formdata);
};
export const viewcontrollerchart = (formdata) => {
  return axios.post("report/controller_chart", formdata);
};
export const mailreport = (formdata) => {
  return axios.post("report/mail_report", formdata);
};
export const flowreading = (formdata) => {
  return axios.post("dashboard/flow_reading_web", formdata);
};
export const ListDeviceApi = (formdata, page) => {
  return axios.post(`device/list_device?page=${page}&size=${12}`, formdata);
};
export const removedevice = (formdata) => {
  return axios.post("group/remove_controller_device_mapping", formdata);
};
export const deletedevice = (deviceid) => {
  return axios.delete(`device/delete_device?device_id=${deviceid}`);
};

///device

export const Adminlistdevice = (formData, page, size) => {
  return axios.post(`device/list_device?page=${page}&size=12`, formData);
};
export const EditDevice = (id, formdata) => {
  return axios.put(`device/update_device/${id}`, formdata);
};

export const AddadminDevice = (formdata) => {
  return axios.post("device/add_device", formdata);
};

export const ViewadminDevice = (id) => {
  return axios.get(`device/view_device/${id}`);
};

export const DeleteAdminDevice = (id) => {
  return axios.delete(`device/delete_device?device_id=${id}`);
};

export const Viewadmindevicedelete = (formdata, page, size) => {
  return axios.post(
    `drop_down/device_dropdown?page=${page}&size=${size}`,
    formdata
  );
};

export const ProductionHistoryService = (page, size, formdata) => {
  return axios.post(
    `/controller/list_production_history?page=${page}&size=${size}`,
    formdata
  );
};

export const MergerControllerService = (data) => {
  return axios.post("/merge/controller_device_merge", data);
};

export const MergerDeviceService = (data) => {
  return axios.post("/merge/device_merge", data);
};

export const DeleteMergerService = (data) => {
  return axios.post("/merge/remove_merge", data);
};

export const UpdateMergeSettingService = (data) => {
  return axios.post("/merge/update_merge_setting", data);
};

export const GetNotificationDropdown = () => {
  return axios.post("/drop_down/notificationTypeDropdown");
};
export const GetnotificationAccessDropdown = () => {
  return axios.post("/drop_down/notificationAccessDropdown");
};
export const UpdateNotificationSettings = (data) => {
  return axios.post("/controller/editNotificationAccess", data);
};

// MQTT

export const PublishMqttService = (data) => {
  return axios.post("/device_publish/publish_data", data);
};

export const FlowReadingService = (data) => {
  return axios.post("/dashboard/flow_reading", data);
};

// AMC report

export const AMSREportService = (page, size, data) => {
  return axios.post(
    `/subcription/listAllUnits?page=${page}&size=${size}`,
    data
  );
};
export const UpdateAMCReportService = (data) => {
  return axios.post("/subcription/EditAmc", data);
};

export const MultipleUpdateAMCReportService = (data) => {
  return axios.post("/subcription/MultiEditAmc", data);
};

export const SimDropdownService = (data) => {
  return axios.post("/drop_down/simDropdown", data);
};

// SIM

export const ListSimService = (page, size, data) => {
  return axios.post(`/sim/listSim?page=${page}&size=${size}`, data);
};

export const AddSimService = (data) => {
  return axios.post("/sim/addSim", data);
};

export const EditSimService = (data) => {
  return axios.post("/sim/editSim", data);
};

export const DeleteSimService = (data) => {
  return axios.post("/sim/deleteSim", data);
};

export const ImportSimService = (data, config = {}) => {
  return axios.post("/sim/importSim", data, { ...config });
};

// Payment History

export const ListPaymentHistoryService = (page, size, data) => {
  return axios.post(
    `/payment_gateway/list_payment_history?page=${page}&size=${size}`,
    data
  );
};

// SIM Settings
export const ListSmsSettingsService = (page, size, data) => {
  return axios.post(`/subcription/listAllSms?page=${page}&size=${size}`, data);
};

export const UpdateSmsSettingsService = (data) => {
  return axios.post(`/subcription/editSms`, data);
};

export const MonitoringListService = (page, size, data) => {
  return axios.post(
    `/dashboard/controller_manager?page=${page}&size=${size}`,
    data
  );
};

export const ChangeUserMenu = (user_id, data) => {
  return axios.post(`/user/change_menu?user_id=${user_id}`, data);
};
export const UpdateWeeklyValveSetting = (controller_id, data) => {
  return axios.post(
    `/device/weekly_setting?controller_id=${controller_id}`,
    data
  );
};
export const UpdateDeviceTimeSetting = (device_id, data) => {
  return axios.post(`/device/update_device_settings/${device_id}`, data);
};

export const UpdateControllerCode = (data) => {
  return axios.put("/controller/change_controller_code", data);
};

// Dashboard chart

// export const waterTankLevelChart = (data) => {
//   return axios.post("/dashboard/consumption_bar_chart", data);
// };
// Consumption line chart

export const PowerConsumptionLineChart = (data) => {
  return axios.post("/dashboard/consumption_report_line_chart", data);
};

export const WaterConsumptionLineChart = (data) => {
  return axios.post("/dashboard/flow_reading_line_chart", data);
};

export const WaterTankChart = (data) => {
  return axios.post("/dashboard/water_tank_chart", data);
};

export const PumpActivityChart = (data) => {
  return axios.post("/dashboard/pump_activity_report", data);
};

// export const ListControllerDropDown = (data) => {
//   return axios.post("/drop_down/list_controller_dropdown", data);
// };
export const ViewUserPermission = (data) => {
  return axios.post("/view_user_permission", data);
};

export const EditUserPermission = (data) => {
  return axios.post("/edit_user_permission", data);
};

export const DepthreportLineChart = (data) => {
  return axios.post("/dashboard/depth_report_line_chart", data);
};

export const handledimentionAddApi = (data) => {
  return axios.post("/controller/edit_controller_dimensions", data);
};

export const PressuerFlowreadinReport = (data) => {
  return axios.post("/dashboard/pressure_flow_reading", data);
};

export const PressureFlowLineReport = (data) => {
  return axios.post("/dashboard/pressure_flow_reading_line_chart", data);
};

export const UpdateProfileImage = (data) => {
  return axios.post("/user/update-profile-img", data);
};

export const AmpsLineChart = (data) => {
  return axios.post("/dashboard/ambs_line_chart", data);
};

export const VoltsLineChart = (data) => {
  return axios.post("/dashboard/volts_line_chart", data);
};

export const weatherReport = (data) => {
  return axios.post("/weather-report", data);
};
export const ListControllerTableReport = (page, size, data) => {
  return axios.post(
    `/controller/list_user_controller_log?page=${page}&size=${size}`,
    data
  );
};

// Super Admin: add and delete states and districts
export const AddStateService = (data) => {
  return axios.post("drop_down/add_state", data);
};
export const AddDistrictService = (data) => {
  return axios.post("drop_down/add_district", data);
};
export const LocationUsageService = (data) => {
  return axios.post("drop_down/location_usage", data);
};
export const DeleteLocationService = (data) => {
  return axios.post("drop_down/delete_location", data);
};

// Changes only the name of a device (Super Admin and Admin)
export const RenameDeviceService = (id, formdata) => {
  return axios.put(`device/rename_device/${id}`, formdata);
};

// The master (Super Admin) sets the TDS, chlorine and pH of one chlorinator by hand
export const SetChlorinatorValuesService = (id, formdata) => {
  return axios.put(`device/set_chlorinator_values/${id}`, formdata);
};
