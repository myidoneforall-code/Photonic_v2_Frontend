import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import Maplocationfinder from "./Map";
import { useFormik } from "formik";
import {
  consumption,
  dashboardapi,
  FlowReadingService,
  groupdropdownapi,
  Mapdashboardapi,
  profile,
  userdropdown
} from "../../../Service/ApiService";
import {
  Updatefilterdata,
  UpdatePageState
} from "../../Store/Config/Configuration";
import "../../../Assets/css/Dashboard.modules.css";
import Loader from "../../Loader";
import { UserTypeOptions } from "../../../Utilities/Constants";
import "../../View/ViewController.modules.css";
import CommonDateTimePicker from "../../CommonComponents/CommonDatePicker";
import CommonSelect from "../../CommonComponents/CommonSelect";
import {
  GetCookieStorage,
  GetLocalStorage,
  GetSessionStorage,
  SetSessionStorage
} from "../../../Utilities/Storage";
import { getCatchMsg } from "../../../Utilities/Methods";
import { Checkbox } from "antd";
import { ExportedImages } from "../../../Utilities/ImageExport";
import { getCookie } from "../../../Utilities/Cookie";

export default function Admindashboard() {
  let navigate = useNavigate();
  let dispatch = useDispatch();
  const { LoginUserData } = useSelector((state) => state);

  const { filterdata } = useSelector((state) => state);
  const [dashboardData, setDashboardData] = useState({});
  const [showCards, seShowCards] = useState({
    power: 1,
    water: 1
  });
  let LoginDatas = JSON.parse(getCookie("cookiedata"));

  // storage api

  let sessiongroup = JSON.parse(GetSessionStorage("groupid"));
  let sessiongroupName = GetSessionStorage("groupname")
    ? JSON.parse(GetSessionStorage("groupname"))
    : "";
  let sessiongroupLightName = GetSessionStorage("grouplightname")
    ? JSON.parse(GetSessionStorage("grouplightname"))
    : "";

  let controllertype = parseInt(GetLocalStorage("contollertype"));
  let sessiontype = JSON.parse(GetSessionStorage("usertype"));
  let sessiongrouplight = JSON.parse(GetSessionStorage("groupidlight"));
  let sessiontypelight = JSON.parse(GetSessionStorage("usertypelight"));
  let cookie = JSON.parse(GetCookieStorage("cookiedata"));

  let SessionUserId = JSON.parse(GetSessionStorage("mainUserId"));
  const { light, motor } = SessionUserId || {};
  let usertype = cookie?.user_type;

  const { values, errors, touched, setValues, handleSubmit } = useFormik({
    initialValues: {
      from_date: new Date(
        moment().subtract(3, "d").format("YYYY-MM-DD HH:mm:ss")
      ),
      to_date: new Date(),
      from_date_format: 1,
      to_date_format: 1
    },
    onSubmit: () => {
      GetConsumptionReport();
    }
  });

  const [flowReadingFilters, setflowReadingFilters] = useState({
    from_date: new Date(
      moment().subtract(3, "d").format("YYYY-MM-DD HH:mm:ss")
    ),
    to_date: new Date(),
    from_date_format: 1,
    to_date_format: 1
  });
  const [FlowReadingData, setFlowReadingData] = useState("");
  const [groupList, setGroupList] = useState([]);
  const [mapData, setMapdata] = useState();
  const [ConsumptionReport, setConsumptionReport] = useState();
  const [loader, setloader] = useState(false);
  const [userList, setUserList] = useState([]);
  const [controllerID, setControllerID] = useState([]);
  const mainFilterref = useRef({
    group: {
      motor: sessiongroup,
      light: sessiongrouplight
    },
    user_type: {
      motor: sessiontype,
      light: sessiontypelight
    },
    user_id: {
      motor: motor?.id,
      light: light?.id
    }
  });

  // Consumption Report

  const GetConsumptionReport = (controller_id = null) => {
    setloader(true);
    let formData = new FormData();
    formData.append(
      "from_date",
      moment(values?.from_date).format("YYYY-MM-DD 00:00:00")
    );
    formData.append(
      "to_date",
      moment(values?.to_date).format("YYYY-MM-DD 23:59:59")
    );
    formData.append("controller_type", controllertype);

    formData.append("from_date_format", values?.from_date_format);
    formData.append("to_date_format", values?.to_date_format);

    if (controllerID) {
      formData.append("controller_id", controllerID);
    }
    consumption(formData)
      .then(({ data }) => {
        setConsumptionReport(data);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  // Flow Reading Report

  const GetFlowReadingReport = (controller_id = null) => {
    setloader(true);
    let formData = new FormData();
    formData.append(
      "from_date",
      moment(flowReadingFilters?.from_date).format("YYYY-MM-DD 00:00:00")
    );
    formData.append(
      "to_date",
      moment(flowReadingFilters?.to_date).format("YYYY-MM-DD 23:59:59")
    );
    formData.append("controller_type", controllertype);

    formData.append("from_date_format", flowReadingFilters?.from_date_format);
    formData.append("to_date_format", flowReadingFilters?.to_date_format);
    if (controllerID) {
      formData.append("controller_id", controllerID);
    }

    // if (controllertype === 1 && (motor?.id || controller_id)) {
    //   formData.append(
    //     "controller_id",
    //     controller_id ? controller_id : controllerID
    //   );
    // } else if (controllertype === 2 && (light?.id || controller_id)) {
    //   formData.append(
    //     "controller_id",
    //     controller_id ? controller_id : controllerID
    //   );
    // }
    FlowReadingService(formData)
      .then(({ data }) => {
        setFlowReadingData(data);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  // Group Dropdown

  const GetGroupDropdown = () => {
    groupdropdownapi()
      .then((res) => {
        if (res?.data?.length > 0) {
          let finalList = res?.data?.map((ele) => {
            return { ...ele, label: ele?.group_name, value: ele?.group_id };
          });
          setGroupList(finalList);
        } else {
          setGroupList(res?.data);
        }
      })
      .catch((err) => {});
  };

  // USer Dropdown
  const GetUserDropdown = (id) => {
    const formdata = new FormData();
    console.log(id, sessiongroup, "sessiongroup");
    if (id != 0) {
      formdata.append("group_id", id);
      userdropdown(formdata)
        .then((res) => {
          if (res?.data?.length > 0) {
            let finalList = res?.data?.map((ele) => {
              return { ...ele, label: ele?.username, value: ele?.user_id };
            });
            setUserList(finalList);
          } else {
            setUserList(res?.data);
          }
        })
        .catch((err) => {});
    } else {
      userdropdown()
        .then((res) => {
          if (res?.data?.length > 0) {
            let finalList = res?.data?.map((ele) => {
              return { ...ele, label: ele?.username, value: ele?.user_id };
            });
            setUserList(finalList);
          } else {
            setUserList(res?.data);
          }
        })
        .catch((err) => {});
    }
  };

  const NavigatetocontrollerPage = () => {
    dispatch(
      Updatefilterdata({
        controllername: "",
        controllercode: "",
        devicecode: "",
        usertype: "",
        groupid: "",
        sortby: 0,
        user_id: "",
        empty_controller: ""
      })
    );
    dispatch(UpdatePageState(1));
    if (controllertype == 1) {
      navigate("/dashboard/motorcontrollerview");
      SetSessionStorage("sorttype", 0);
    } else if (controllertype == 2) {
      navigate("/dashboard/lightcontrollerview");
      SetSessionStorage("sorttype", 0);
    }
  };

  const Navigatetonotification = () => {
    dispatch(
      Updatefilterdata({
        controllername: "",
        controllercode: "",
        devicecode: "",
        usertype: "",
        groupid: "",
        sortby: 3,
        user_id: "",
        empty_controller: ""
      })
    );
    dispatch(UpdatePageState(1));
    if (controllertype == 1) {
      navigate("/dashboard/motornotification");
      SetSessionStorage("sorttype", 3);
    } else if (controllertype == 2) {
      navigate("/dashboard/lightnotification");
      SetSessionStorage("sorttype", 3);
    }
  };

  // Dashboard Api
  const GetDashboardData = (
    group_id = null,
    user_type = null,
    user_id = null,
    Call_api = false
  ) => {
    setloader(true);
    const dashboardFilters = mainFilterref.current;
    let formdata = new FormData();
    formdata.append("controller_type", controllertype);

    if (controllertype === 1 && (dashboardFilters?.group?.motor || group_id)) {
      formdata.append(
        "group_id",
        group_id !== null ? group_id : dashboardFilters?.group?.motor
      );
    } else if (
      controllertype === 2 &&
      (dashboardFilters?.group?.light || group_id)
    ) {
      formdata.append(
        "group_id",
        group_id !== null ? group_id : dashboardFilters?.group?.light
      );
    }

    if (user_id !== null) {
      formdata.append("user_id", user_id || "");
    } else if (controllertype === 1 && dashboardFilters?.user_id?.motor) {
      formdata.append("user_id", dashboardFilters?.user_id?.motor || "");
    } else if (controllertype === 2) {
      formdata.append("user_id", dashboardFilters?.user_id?.light || "");
    }
    if (
      controllertype === 1 &&
      (dashboardFilters?.user_type?.motor || user_type)
    ) {
      formdata.append(
        "user_type",
        user_type !== null ? user_type : dashboardFilters?.user_type?.motor
      );
    } else if (
      controllertype === 2 &&
      (dashboardFilters?.user_type?.light || user_type)
    ) {
      formdata.append(
        "user_type",
        user_type !== null ? user_type : dashboardFilters?.user_type?.light
      );
    }

    dashboardapi(formdata)
      .then(({ data }) => {
        let totalData = data.tot_controller || data?.tot_device;
        setDashboardData({ ...data, total_datas: totalData });
        setControllerID(data.controllerId);
        if (Call_api) {
          handleGoogleMapApi(null, null, data.controllerId);
          // GetConsumptionReport(data.controllerId);
          // GetFlowReadingReport(data.controllerId);
        }
      })
      .catch((err) => {})
      .finally(() => setloader(false));
  };

  // Google Map api service

  const handleGoogleMapApi = (
    group_id = null,
    user_type = null,
    controller_id = null
  ) => {
    setloader(true);
    let formdata = new FormData();
    formdata.append("controller_type", controllertype);
    if (controllertype === 1 && (sessiongroup || group_id)) {
      formdata.append("group_id", group_id !== null ? group_id : sessiongroup);
    } else if (controllertype === 2 && (sessiongrouplight || group_id)) {
      formdata.append(
        "group_id",
        group_id !== null ? group_id : sessiongrouplight
      );
    }

    if (controllertype === 1 && (sessiontype || user_type)) {
      formdata.append(
        "user_type",
        user_type !== null ? user_type : sessiontype
      );
    } else if (controllertype === 2 && (sessiontypelight || user_type)) {
      formdata.append(
        "user_type",
        user_type !== null ? user_type : sessiontypelight
      );
    }

    if (controllertype === 1 && (motor?.id || controller_id)) {
      formdata.append(
        "controller_id",
        controller_id ? controller_id : controllerID
      );
    } else if (controllertype === 2 && (light?.id || controller_id)) {
      formdata.append(
        "controller_id",
        controller_id ? controller_id : controllerID
      );
    }

    Mapdashboardapi(formdata)
      .then(({ data }) => {
        setMapdata(data);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  // Controller Off Screen Navigation
  const NavigatetoControlleroff = () => {
    dispatch(
      Updatefilterdata({
        controllername: "",
        controllercode: "",
        devicecode: "",
        usertype: "",
        groupid: "",
        sortby: 2,
        user_id: "",
        empty_controller: ""
      })
    );
    dispatch(UpdatePageState(1));
    if (controllertype == 1) {
      navigate("/dashboard/motorcontrolleroff");
      SetSessionStorage("sorttype", 2);
    } else if (controllertype == 2) {
      navigate("/dashboard/lightcontrolleroff");
      SetSessionStorage("sorttype", 2);
    }
  };

  // Controller On Screen Navigation

  const NavigatetoControllerOn = () => {
    dispatch(
      Updatefilterdata({
        controllername: "",
        controllercode: "",
        devicecode: "",
        usertype: "",
        groupid: "",
        sortby: 1,
        user_id: "",
        empty_controller: ""
      })
    );
    dispatch(UpdatePageState(1));
    if (controllertype == 1) {
      navigate("/dashboard/motorcontrolleron");
      SetSessionStorage("sorttype", 1);
    } else if (controllertype == 2) {
      navigate("/dashboard/lightcontrolleron");
      SetSessionStorage("sorttype", 1);
    }
  };

  // User Details Screen Navigation

  const NavigatetoUser = () => {
    if (sessiongroup && controllertype == 1) {
      navigate("/dashboard/user/viewuser/admin", {
        state: {
          groups: sessiongroup
        }
      });
    } else if (sessiongrouplight && controllertype == 2) {
      navigate("/dashboard/user/viewuser/admin", {
        state: {
          groups: sessiongrouplight
        }
      });
    }
  };

  // Changing Session Storage Data

  const UpdateSessionStorage = (type, value) => {
    // motor controller
    if (controllertype === 1) {
      // Motor controller group
      if (type === "group") {
        mainFilterref.current.group.motor = value[0];
        console.log(value, "sdfsdfsdf");

        SetSessionStorage("groupid", JSON.stringify(value[0]));
        SetSessionStorage("groupname", JSON.stringify(value[1]));
      }
      //Motor controller user type
      else if (type === "user_type") {
        mainFilterref.current.user_type.motor = value[0];
        SetSessionStorage("usertype", JSON.stringify(value[0]));
      }
      //Motor controller user id
      else if (type === "user_id") {
        SetSessionStorage(
          "mainUserId",
          JSON.stringify({
            light: light ? light : {},
            motor: {
              id: value[0],
              name: value[1]
            }
          })
        );
        mainFilterref.current.user_id.motor = value[0];
      }
    }

    // light Controller
    else if (controllertype === 2) {
      // light controller group
      if (type === "group") {
        mainFilterref.current.group.light = value[0];
        SetSessionStorage("groupidlight", JSON.stringify(value[0]));
        SetSessionStorage("grouplightname", JSON.stringify(value[1]));
      }
      // loght controller user type
      else if (type === "user_type") {
        mainFilterref.current.user_type.light = value[0];
        SetSessionStorage("usertypelight", JSON.stringify(value[0]));
      }
      // light controller user id
      else if (type === "user_id") {
        mainFilterref.current.user_id.light = value[0];
        SetSessionStorage(
          "mainUserId",
          JSON.stringify({
            motor: motor ? motor : {},
            light: {
              id: value[0],
              name: value[1]
            }
          })
        );
      }
    }
  };

  useEffect(() => {
    GetDashboardData(null, null, null, usertype === 1 ? true : false);
    if (usertype !== 1) {
      handleGoogleMapApi();
      // GetConsumptionReport();
      // GetFlowReadingReport();
    }
    GetGroupDropdown();
    if (usertype === 2 || usertype === 1) {
      GetUserDropdown(sessiongroup ? sessiongroup : "");
    }
  }, [controllertype]);

  // Auto api calls 2 Sec ones
  useEffect(() => {
    const interval = setInterval(() => {
      GetDashboardData();
      handleGoogleMapApi();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, []);

  console.log(sessiongroup, "sessiongroup", sessiongrouplight, dashboardData);

  return (
    <>
      <Loader isLoader={loader} />
      {dashboardData.total_datas ||
      (dashboardData.total_datas <= 0 && (usertype == 1 || usertype === 3)) ||
      (controllertype === 1 ? sessiongroup : sessiongrouplight) ? (
        <div className="router-pages">
          <div className="body-div">
            <div className="search_field">
              <h3 className="head" style={{ margin: "0", marginRight: "17px" }}>
                Dashboard
              </h3>
              <div className="flex-end" style={{ margin: "0" }}>
                <CommonSelect
                  placeholder={"Group"}
                  value={
                    groupList.length <= 0
                      ? controllertype === 1
                        ? sessiongroupName
                        : sessiongroupLightName
                      : controllertype === 1
                      ? sessiongroup
                      : sessiongrouplight
                  }
                  styles={{ width: "170px", height: "44px" }}
                  onChange={(e, opt) => {
                    console.log(e, "EEEEE");

                    UpdateSessionStorage("group", [e, opt.label]);
                    dispatch(
                      Updatefilterdata({
                        ...filterdata,
                        groupid: e
                      })
                    );
                    if (usertype === 2 || usertype === 1) {
                      GetUserDropdown(e);
                    }
                    GetDashboardData(e);
                    handleGoogleMapApi(e);
                    console.log(e, "esdfsd");
                  }}
                  options={[{ label: "All", value: 0 }, ...groupList]}
                  allowClear={false}
                />

                {usertype === 2 || usertype === 3 ? null : (
                  <CommonSelect
                    placeholder={"Usertype"}
                    value={
                      controllertype === 1 ? sessiontype : sessiontypelight
                    }
                    styles={{ width: "170px", height: "44px" }}
                    onChange={(e) => {
                      UpdateSessionStorage("user_type", [e]);
                      dispatch(
                        Updatefilterdata({
                          ...filterdata,
                          usertype: e.target?.value
                        })
                      );

                      GetDashboardData(null, e);
                      handleGoogleMapApi(null, e);
                    }}
                    options={UserTypeOptions}
                    allowClear={false}
                  />
                )}

                {(usertype === 2 || usertype === 1) && (
                  <CommonSelect
                    placeholder={"User"}
                    value={
                      userList.length <= 0
                        ? controllertype === 1
                          ? motor?.name
                          : light?.name
                        : controllertype === 1
                        ? motor?.id
                        : light?.id
                    }
                    styles={{ width: "170px", height: "44px" }}
                    onChange={(e, opt) => {
                      console.log(e, "eeeeee");

                      UpdateSessionStorage("user_id", [e, opt.label]);
                      dispatch(
                        Updatefilterdata({
                          ...filterdata,
                          user_id: e
                        })
                      );
                      GetDashboardData(null, null, e, true);
                    }}
                    options={[{ label: "All", value: 0 }, ...userList]}
                    allowClear={false}
                  />
                )}
              </div>
            </div>
            <div className="dashboard_btn">
              <button
                type="button"
                className="dashbord-details-total dashbord_details"
                onClick={() => NavigatetocontrollerPage()}
              >
                <div className={"controllerCard"}>
                  <div>
                    <p> {dashboardData?.tot_controller}</p>
                    <span className="count">Controllers</span>
                  </div>
                  <div>
                    <p> {dashboardData?.tot_device}</p>
                    <span className="count">Device</span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="dashbord-details-on dashbord_details"
                onClick={() => {
                  NavigatetoControllerOn();
                }}
              >
                {dashboardData?.on}
                <br />
                <br />
                <span className="count">Controller on</span>
              </button>

              <button
                type="button"
                className="dashbord-details-off dashbord_details"
                onClick={() => {
                  NavigatetoControlleroff();
                }}
              >
                {dashboardData?.off}
                <br />
                <br />
                <span className="count">Controller off</span>
              </button>

              <button
                type="button"
                className="dashbord-details-load dashbord_details"
              >
                {dashboardData?.kwh}
                <br />
                <br />
                <span className="count">total kw/h load</span>
              </button>

              <button
                type="button"
                className="dashbord-details-group dashbord_details"
                onClick={() => usertype !== 3 && NavigatetoUser()}
              >
                {controllertype === 1
                  ? sessiongroup
                    ? dashboardData?.tot_group_user
                    : dashboardData?.tot_group
                  : sessiongrouplight
                  ? dashboardData?.tot_group_user
                  : dashboardData?.tot_group}
                <br />
                <br />
                <span className="count">
                  {controllertype === 1
                    ? sessiongroup > 0
                      ? "total User"
                      : "total Groups"
                    : sessiongrouplight > 0
                    ? "total User"
                    : "total Groups"}
                </span>
              </button>

              <button
                type="button"
                className="dashbord-details-notification dashbord_details"
                onClick={() => Navigatetonotification()}
              >
                {dashboardData?.notification}
                <br />
                <br />
                <span className="count">Notification</span>
              </button>
            </div>
            <br />
            <div className="row mb-1">
              {(LoginUserData?.dashboard_menu === 3 ||
                LoginUserData?.dashboard_menu === 1) && (
                <div
                  className={`col-sm-12 col-md-12 col-lg-12 col-xl-6  px-2 pb-3`}
                >
                  <div className="consumptionCard">
                    <div className="consumptionContant">
                      <h3> Power Consumption</h3>
                      <p className="total_datas">
                        {ConsumptionReport ?? "0"} Kwh
                      </p>
                    </div>

                    <div className="consumptionContant">
                      <div className="consumption_container">
                        <img
                          src={ExportedImages.POWER_CONSUMPTION_ICON}
                          className="consumptionIcon"
                        />
                      </div>
                      <div className="consumptionContainer ">
                        <div className="consumptionFilterBlock">
                          <label>From</label>
                          <CommonDateTimePicker
                            value={values.from_date}
                            onChange={(date) => {
                              setValues({
                                ...values,
                                from_date: new Date(date)
                              });
                            }}
                            formate={"DD-MM-YYYY"}
                            // isFuture={true}
                            allowClear={false}
                            styles={{ maxWidth: "140px", height: "45px" }}
                            disableDate={true}
                            fromtodate={true}
                            endDate={values.to_date}
                          />

                          {errors?.from_date && touched?.from_date ? (
                            <p className="inputerror">{errors?.from_date}</p>
                          ) : null}
                        </div>
                        <div className="d-flex flex-column">
                          <div className="d-flex gap-2">
                            <Checkbox
                              className={"CheckBox_innerStyle"}
                              checked={
                                values.from_date_format == 1 ? true : false
                              }
                              onClick={() => {
                                setValues({ ...values, from_date_format: 1 });
                              }}
                            />
                            <span>AM</span>
                          </div>
                          <div className="d-flex gap-2">
                            <Checkbox
                              className={"CheckBox_innerStyle"}
                              checked={
                                values.from_date_format == 2 ? true : false
                              }
                              onClick={() => {
                                setValues({ ...values, from_date_format: 2 });
                              }}
                            />
                            <span>PM</span>
                          </div>
                        </div>

                        <div className="consumptionFilterBlock">
                          <label>To</label>

                          <CommonDateTimePicker
                            value={values.to_date}
                            onChange={(date) => {
                              setValues({ ...values, to_date: new Date(date) });
                            }}
                            formate={"DD-MM-YYYY"}
                            startDate={values.from_date}
                            disableDate={true}
                            fromtodate={true}
                            allowClear={false}
                            styles={{ maxWidth: "140px", height: "45px" }}
                          />

                          {errors?.to_date && touched?.to_date ? (
                            <p className="inputerror">{errors?.to_date}</p>
                          ) : null}
                        </div>
                        <div className="d-flex flex-column">
                          <div className="d-flex gap-2">
                            <Checkbox
                              className={"CheckBox_innerStyle"}
                              checked={
                                values.to_date_format == 1 ? true : false
                              }
                              onClick={() => {
                                setValues({ ...values, to_date_format: 1 });
                              }}
                            />
                            <span>AM</span>
                          </div>
                          <div className="d-flex gap-2">
                            <Checkbox
                              className={"CheckBox_innerStyle"}
                              checked={
                                values.to_date_format == 2 ? true : false
                              }
                              onClick={() => {
                                setValues({ ...values, to_date_format: 2 });
                              }}
                            />
                            <span>PM</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="consumptionbtn"
                          onClick={handleSubmit}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {controllertype !== 2 &&
                (LoginUserData?.dashboard_menu === 3 ||
                  LoginUserData?.dashboard_menu === 2) && (
                  <div
                    className={`col-sm-12 col-md-12 col-lg-12 col-xl-6 px-2  pb-3`}
                  >
                    <div className="consumptionCard">
                      <div className="consumptionContant">
                        <h3> Water Consumption</h3>
                        <p className="total_datas ">
                          {FlowReadingData.total_usage ?? "0"} kL
                        </p>
                      </div>

                      <div className="consumptionContant">
                        <div className="consumption_container">
                          <img
                            src={ExportedImages.WATER_CONSUMPTION_ICON}
                            className="consumptionIcon"
                          />
                        </div>

                        <div className="consumptionContainer ">
                          <div className="consumptionFilterBlock">
                            <label>From</label>
                            <CommonDateTimePicker
                              value={flowReadingFilters.from_date}
                              onChange={(date) => {
                                setflowReadingFilters({
                                  ...flowReadingFilters,
                                  from_date: new Date(date)
                                });
                              }}
                              formate={"DD-MM-YYYY"}
                              disableDate={true}
                              fromtodate={true}
                              endDate={flowReadingFilters.to_date}
                              allowClear={false}
                              styles={{ maxWidth: "140px", height: "45px" }}
                            />
                          </div>
                          <div className="d-flex flex-column">
                            <div className="d-flex gap-2">
                              <Checkbox
                                className={"CheckBox_innerStyle"}
                                checked={
                                  flowReadingFilters.from_date_format == 1
                                    ? true
                                    : false
                                }
                                onClick={() => {
                                  setflowReadingFilters({
                                    ...flowReadingFilters,
                                    from_date_format: 1
                                  });
                                }}
                              />
                              <span>AM</span>
                            </div>
                            <div className="d-flex gap-2">
                              <Checkbox
                                className={"CheckBox_innerStyle"}
                                checked={
                                  flowReadingFilters.from_date_format == 2
                                    ? true
                                    : false
                                }
                                onClick={() => {
                                  setflowReadingFilters({
                                    ...flowReadingFilters,
                                    from_date_format: 2
                                  });
                                }}
                              />
                              <span>PM</span>
                            </div>
                          </div>
                          <div className="consumptionFilterBlock">
                            <label>To</label>
                            <CommonDateTimePicker
                              value={flowReadingFilters.to_date}
                              onChange={(date) => {
                                setflowReadingFilters({
                                  ...flowReadingFilters,
                                  to_date: new Date(date)
                                });
                              }}
                              fromtodate={true}
                              startDate={flowReadingFilters.from_date}
                              formate={"DD-MM-YYYY"}
                              disableDate={true}
                              // isFuture={true}
                              allowClear={false}
                              styles={{ maxWidth: "140px", height: "45px" }}
                            />
                          </div>
                          <div className="d-flex flex-column">
                            <div className="d-flex gap-2">
                              <Checkbox
                                className={"CheckBox_innerStyle"}
                                checked={
                                  flowReadingFilters.to_date_format == 1
                                    ? true
                                    : false
                                }
                                onClick={() => {
                                  setflowReadingFilters({
                                    ...flowReadingFilters,
                                    to_date_format: 1
                                  });
                                }}
                              />
                              <span>AM</span>
                            </div>
                            <div className="d-flex gap-2">
                              <Checkbox
                                className={"CheckBox_innerStyle"}
                                checked={
                                  flowReadingFilters.to_date_format == 2
                                    ? true
                                    : false
                                }
                                onClick={() => {
                                  setflowReadingFilters({
                                    ...flowReadingFilters,
                                    to_date_format: 2
                                  });
                                }}
                              />
                              <span>PM</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="consumptionbtn"
                            onClick={() => {
                              GetFlowReadingReport();
                            }}
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <Maplocationfinder mapdata={mapData} />
          </div>
        </div>
      ) : usertype == 2 ? (
        <div
          className={
            controllertype == 1 ? "motorbackground_images" : "background-images"
          }
        >
          <div className="flex-end" style={{ padding: 12 }}>
            <CommonSelect
              placeholder={"Group"}
              value={
                groupList.length <= 0
                  ? controllertype === 1
                    ? sessiongroupName
                    : sessiongroupLightName
                  : controllertype === 1
                  ? sessiongroup
                  : sessiongrouplight
              }
              styles={{ width: "170px", height: "44px" }}
              onChange={(e, opt) => {
                console.log(e, "EEEEE");

                UpdateSessionStorage("group", [e, opt.label]);
                dispatch(
                  Updatefilterdata({
                    ...filterdata,
                    groupid: e
                  })
                );
                if (usertype === 2 || usertype === 1) {
                  GetUserDropdown(e);
                }
                GetDashboardData(e);
                handleGoogleMapApi(e);
                console.log(e, "esdfsd");
              }}
              options={[{ label: "All", value: 0 }, ...groupList]}
              allowClear={false}
            />

            {usertype === 2 || usertype === 3 ? null : (
              <CommonSelect
                placeholder={"Usertype"}
                value={controllertype === 1 ? sessiontype : sessiontypelight}
                styles={{ width: "170px", height: "44px" }}
                onChange={(e) => {
                  UpdateSessionStorage("user_type", [e]);
                  dispatch(
                    Updatefilterdata({
                      ...filterdata,
                      usertype: e.target?.value
                    })
                  );

                  GetDashboardData(null, e);
                  handleGoogleMapApi(null, e);
                }}
                options={UserTypeOptions}
                allowClear={false}
              />
            )}

            {(usertype === 2 || usertype === 1) && (
              <CommonSelect
                placeholder={"User"}
                value={
                  userList.length <= 0
                    ? controllertype === 1
                      ? motor?.name
                      : light?.name
                    : controllertype === 1
                    ? motor?.id
                    : light?.id
                }
                styles={{ width: "170px", height: "44px" }}
                onChange={(e, opt) => {
                  console.log(e, "eeeeee");

                  UpdateSessionStorage("user_id", [e, opt.label]);
                  dispatch(
                    Updatefilterdata({
                      ...filterdata,
                      user_id: e
                    })
                  );
                  GetDashboardData(null, null, e, true);
                }}
                options={[{ label: "All", value: 0 }, ...userList]}
                allowClear={false}
              />
            )}
          </div>
          <div className="view-msg">
            <button
              type="button"
              className="addbutton"
              onClick={() => {
                navigate("/dashboard/addcontroller");
                sessionStorage.setItem("controllerpage", "/dashboard");
              }}
            >
              Add Controller
            </button>
          </div>
        </div>
      ) : (
        <p className="view-msg" style={{ color: "grey" }}>
          no datas found
        </p>
      )}
    </>
  );
}
