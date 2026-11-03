import React, { useEffect, useRef, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import img1 from "../../../Assets/image/iotimages/d-icon-1.png";
import img2 from "../../../Assets/image/iotimages/d-icon-2.png";
import img3 from "../../../Assets/image/iotimages/d-icon-3.png";
import img4 from "../../../Assets/image/iotimages/d-icon-4.png";
import img5 from "../../../Assets/image/iotimages/d-icon-5.png";
import img6 from "../../../Assets/image/iotimages/d-icon-6.png";
import PowerConsumption from "../../../Components/View/Dashboard/Charts/PowerConsumption";
import WaterConsumption from "../../../Components/View/Dashboard/Charts/WaterConsumption";
import WaterTankLevelChart from "../../../Components/View/Dashboard/Charts/WaterTankLevelChart";
import PumpRuntimeChart from "../../../Components/View/Dashboard/Charts/PumpRunTimeChart";
import WaterQualityChart from "../../../Components/View/Dashboard/Charts/WaterQualityChart";
import ScheduleCompilerChart from "../../../Components/View/Dashboard/Charts/SceduleCompilerChart";
import { Card, Col, Row } from "react-bootstrap";
import CountCard from "./countercard";
import CommonSelect from "../../CommonComponents/CommonSelect";
import CustomTabs from "../../CommonComponents/CustomTab";
import {
  consumption,
  dashboardapi,
  FlowReadingService,
  groupdropdownapi,
  Mapdashboardapi,
  PowerConsumptionLineChart,
  PumpActivityChart,
  userdropdown,
  ViewUserPermission,
  WaterConsumptionLineChart,
  WaterTankChart,
  DepthreportLineChart,
  PressuerFlowreadinReport,
  PressureFlowLineReport,
  VoltsLineChart,
  AmpsLineChart,
  weatherReport,
  controllerdropdown
} from "../../../Service/ApiService";
import {
  GetCookieStorage,
  GetLocalStorage,
  GetSessionStorage,
  SetSessionStorage
} from "../../../Utilities/Storage";
import { getCatchMsg } from "../../../Utilities/Methods";
import { useDispatch, useSelector } from "react-redux";
import {
  Updatefilterdata,
  UpdatePageState
} from "../../Store/Config/Configuration";
import { UserTypeOptions } from "../../../Utilities/Constants";
import { useNavigate } from "react-router";
import moment from "moment";
import { useFormik } from "formik";
import Loader from "../../Loader";
import Maplocationfinder from "./Map";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import DepthLinechart from "./Charts/DepthLinechart";
import VoltLineChart from "./Charts/VoltLineChart";
import AmbsLineChartPage from "./Charts/AmbsLineChart";
import WeatherChart from "./Charts/WeatherChart";
import { getCookie } from "../../../Utilities/Cookie";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashBoard = () => {
  const [groupList, setGroupList] = useState([]);
  let SessionUserId = JSON.parse(GetSessionStorage("mainUserId"));
  const [dashboardData, setDashboardData] = useState({});
  const [mapData, setMapdata] = useState();
  const [loader, setloader] = useState(false);
  const [userList, setUserList] = useState([]);

  let sessiongroup = JSON.parse(GetSessionStorage("groupid"));
  const [controllerID, setControllerID] = useState([]);
  const [waterTankLeval, setWaterTankLevel] = useState();
  const [userPermissions, setUserPermissions] = useState({});
  const { LoginUserData } = useSelector((state) => state);
  const token = JSON.parse(getCookie("cookiedata"))?.access_token;

  const [pumpActivityData, setPumpActivityData] = useState();
  const [FlowReadingData, setFlowReadingData] = useState("");
  const [consumptionLineChart, setConsumptionLineChart] = useState();
  const [apidatapowerconsumption, setapipowerconsumption] = useState();
  const [waterConsumptionChart, setWaterConsuptionChart] = useState();
  const [pressureFlowLineReport, setPressureFlowLineReport] = useState();
  const [voltLineChart, setVoltLineChart] = useState();
  const [ampsLineChart, setAmpsLineChart] = useState();
  const [depthLinechart, setDepthLineChart] = useState();
  const [typeFlowChart, setTypeFlowChart] = useState("");
  const [weatherReportData, setWeatherReport] = useState();

  let sessiongroupName = GetSessionStorage("groupname")
    ? JSON.parse(GetSessionStorage("groupname"))
    : "";
  let sessiongroupLightName = GetSessionStorage("grouplightname")
    ? JSON.parse(GetSessionStorage("grouplightname"))
    : "";
  const { filterdata } = useSelector((state) => state);
  const [ConsumptionReport, setConsumptionReport] = useState();
  let controllertype = parseInt(GetLocalStorage("contollertype"));
  let sessiontype = JSON.parse(GetSessionStorage("usertype"));
  let sessiongrouplight = JSON.parse(GetSessionStorage("groupidlight"));
  let sessiontypelight = JSON.parse(GetSessionStorage("usertypelight"));
  const [controllerDropDown, setControllerDropDown] = useState([]);

  const navigate = useNavigate();
  let cookie = JSON.parse(GetCookieStorage("cookiedata"));
  const { light, motor } = SessionUserId || {};
  let usertype = cookie?.user_type;
  let dispatch = useDispatch();
  const [flowReadingFilters, setflowReadingFilters] = useState({
    from_date: new Date(),
    to_date: new Date(),
    from_date_format: 1,
    to_date_format: 1
  });
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

  const { values, setValues } = useFormik({
    initialValues: {
      from_date: new Date(),
      to_date: new Date(),
      from_date_format: null,
      to_date_format: null,
      controller_id: null
    },
    onSubmit: () => {
      // GetConsumptionReport();
    }
  });

  console.log(ConsumptionReport, "ConsumptionReport");
  const getCardPermission = (id) => {
    console.log(userPermissions, id, "userPermissions1231");
    const permissionsArray = Array.isArray(userPermissions)
      ? userPermissions
      : [];
    const found = permissionsArray.find((ele) => ele?.permission_id === id);
    return found;
  };

  const tabs = [
    {
      key: "power",
      label: getCardPermission(1)?.title || "Power Consumption",
      component:
        getCardPermission(1)?.status === 1 || usertype === 1 ? (
          <PowerConsumption
            apidatapowerconsumption={apidatapowerconsumption}
            controllerDropDown={controllerDropDown}
            groupName={
              groupList?.find((ele) => ele?.group_id === sessiongroup)
                ?.group_name
            }
            title={getCardPermission(1)?.title || "Power Consumptions"}
            onPress={(values) => {
              const from_date = values.fromDate;
              const to_date = values.toDate;
              const from_date_format = values.fromPeriod === "AM" ? 1 : 2;
              const to_date_format = values.toPeriod === "AM" ? 1 : 2;
              const controller_id = values?.device_id;

              setValues({
                from_date,
                to_date,
                from_date_format,
                to_date_format,
                controller_id: controllerID
              });

              console.log(values, "data1dsfsdfsdf23");

              GetConsumptionReport(
                from_date,
                to_date,
                from_date_format,
                to_date_format,
                controller_id
              ); // fetch new data
            }}
            // period_type_id={apidatapowerconsumption.period_type}
            powerconsumptionLineChart={consumptionLineChart}
            onPressConsumptionChart={(data, controller_id, newFromDate) => {
              console.log(data, controller_id, newFromDate, "data1dsfsdfsdf23");
              handlePowerConsumptionLineChart(
                null,
                controller_id ? controller_id : controllerID,
                data,
                newFromDate
              );
            }}
            powerConsumptionData={ConsumptionReport}
          />
        ) : null,
      status: getCardPermission(1)?.status === 1 || usertype === 1
    },

    {
      key: "water",
      label: getCardPermission(2)?.title || "Water Consumption",
      component:
        getCardPermission(2)?.status === 1 || usertype === 1 ? (
          <WaterConsumption
            controllerDropDown={controllerDropDown}
            title={getCardPermission(2)?.title || "Water Consumption"}
            onPress={(data) => {
              console.log(data, "sdfslkdfds");

              if (data?.typeId) {
                console.log(data, "datasdasdasdas1231");

                const payload = {
                  from_date: data?.fromDate,
                  to_date: data?.toDate,
                  from_date_format: data?.fromPeriod === "AM" ? 1 : 2,
                  to_date_format: data?.toPeriod === "PM" ? 2 : 1,
                  controller_id: controllerID
                };
                setTypeFlowChart({
                  type: data?.typeId,
                  data: payload
                });

                // const { from_date, to_date, from_date_format, to_date_format } =
                //   data.filters;

                // const payload = {
                //   from_date,
                //   to_date,
                //   from_date_format,
                //   to_date_format,
                //   controller_id: controllerID,
                // };

                console.log(data, payload, "sdfsdfsdfsdsdfs");

                if (data.typeId === 1) {
                  if (data?.fromDate) {
                    PressuerFlowreadinReports(payload, data?.device_id);
                  } else {
                    PressuerFlowreadinReports(payload, data?.values?.device_id);
                    handlePressureFlowLineReport(
                      payload,
                      null,
                      data?.values.device_id
                    );
                  }
                } else if (data.typeId === 2) {
                  if (data?.fromDate) {
                    GetFlowReadingReport(payload, data.device_id);
                  } else {
                    GetFlowReadingReport(payload, data?.values?.device_id);
                    handleWaterConsumptionLineChart(
                      null,
                      data?.values?.device_id,
                      null
                    );
                  }
                }
                return;
              }
              GetFlowReadingReport(
                payload,
                data?.device_id ? data?.device_id : data?.values?.device_id
              );

              const payload = {
                from_date: data?.fromDate,
                to_date: data?.toDate,
                from_date_format: data?.fromPeriod === "AM" ? 1 : 2,
                to_date_format: data?.toPeriod === "PM" ? 2 : 1,
                controller_id: controllerID
              };

              setflowReadingFilters(payload);
            }}
            apidatapowerconsumption={pressureFlowLineReport}
            waterConsumptionData={FlowReadingData}
            consumptionLineChart={waterConsumptionChart}
            onPressConsumptionChart={(data, controller_id, newFromDate) => {
              console.log(data, "ddssddsdsds", typeFlowChart, controller_id);

              if (typeFlowChart?.type === 1) {
                PressuerFlowreadinReports(typeFlowChart?.data, controller_id);
                handlePressureFlowLineReport(
                  typeFlowChart?.data,
                  data,
                  controller_id,
                  newFromDate
                );
              } else {
                handleWaterConsumptionLineChart(
                  null,
                  controller_id ? controller_id : controllerID,
                  data,
                  newFromDate
                );
              }
            }}
          />
        ) : null,
      status: getCardPermission(2)?.status === 1 || usertype === 1
    }
  ];

  const handlePressureFlowLineReport = (
    payload,
    period_type,
    controller_id,
    newFromDate
  ) => {
    setloader(true);
    let formData = new FormData();
    // formData.append(
    //   "from_date",
    //   dayjs(payload.from_date).format("YYYY-MM-DD HH:mm:ss")
    // );
    // formData.append(
    //   "to_date",
    //   dayjs(payload.to_date).format("YYYY-MM-DD HH:mm:ss")
    // );
    if (newFromDate) {
      formData.append(
        "from_date",
        dayjs(newFromDate).format("YYYY-MM-DD HH:mm:ss")
      );
    }
    formData.append("controller_type", controllertype);
    formData.append("from_date_format", payload.from_date_format ?? 1);
    formData.append("to_date_format", payload.to_date_format ?? 1);
    formData.append("period_type", period_type ? period_type : 3);
    if (payload.controller_id || controller_id)
      formData.append(
        "controller_id",
        controller_id ? controller_id : payload.controller_id
      );

    PressureFlowLineReport(formData)
      .then((res) => {
        setPressureFlowLineReport(res?.data);
        setWaterConsuptionChart(res?.data?.aggregated_data);
      })
      .catch(getCatchMsg)
      .finally(() => setloader(false));
  };

  const NavigatetoControllerOn = (id) => {
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
    // Was `if (===1) {...} else if (===2) {...}` with no fallback — if
    // controllertype ever read as anything else (missing/invalid
    // localStorage value at click time), navigate() never ran and the
    // card click silently did nothing. Default to motor so it always navigates.
    if (controllertype == 2) {
      navigate("/dashboard/lightcontrolleron");
      SetSessionStorage("sorttype", id === 3 ? 3 : id === 4 ? 4 : 1);
    } else {
      navigate("/dashboard/motorcontrolleron");
      SetSessionStorage("sorttype", id === 3 ? 3 : id === 4 ? 4 : 1);
    }
  };

  const NavigatetoControlleroAll = () => {
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
      navigate("/dashboard/motorcontrollerall");
      SetSessionStorage("sorttype", 2);
    } else if (controllertype == 2) {
      navigate("/dashboard/AllLightController");
      SetSessionStorage("sorttype", 2);
    }
  };

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
    // Same fallback as NavigatetoControllerOn above — default to motor
    // instead of silently not navigating when controllertype is invalid.
    if (controllertype == 2) {
      navigate("/dashboard/lightcontrolleroff");
      SetSessionStorage("sorttype", 2);
    } else {
      navigate("/dashboard/motorcontrolleroff");
      SetSessionStorage("sorttype", 2);
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

  const data = [
    {
      id: 1,
      image: img1,
      name: "Controllers",
      count: dashboardData?.tot_controller,
      style: { background: "#176BA0", border: "1px solid #176BA033" },
      iconStyle: { background: "white" },
      onpress: () => NavigatetoControllerOn(3),
      status: true
    },
    {
      id: 2,
      image: img2,
      name: "Devices",
      count: dashboardData?.tot_device,
      style: { background: "#7D3AC1", border: "1px solid #7D3AC133" },
      iconStyle: { background: "#7D3AC1" },
      onpress: () => NavigatetoControllerOn(4),
      status: true
    },
    {
      id: 3,
      image: img3,
      name: "Controller On",
      count: dashboardData?.on,
      style: { background: "#EA7369", border: "1px solid #EA736933" },
      iconStyle: { background: "#EA7369" },
      onpress: () => NavigatetoControllerOn(2),
      status: true
    },
    {
      id: 4,
      image: img4,
      name: "Controller Off",
      count: dashboardData?.off,
      style: { background: "#EE9A3A", border: "1px solid #EE9A3A33" },
      iconStyle: { background: "#EE9A3A" },
      onpress: () => NavigatetoControlleroff(3),
      status: true
    },
    {
      id: 5,
      image: img5,
      name: "Total Kw/H Load",
      count: dashboardData?.kwh,
      style: { background: "#CBE90B", border: "1px solid #E7E34E33" },
      iconStyle: { background: "#E7E34E" },
      status: true
    },
    {
      id: 6,
      image: img6,
      name: "Total Group",
      count: dashboardData?.tot_group,
      style: { background: "#0ED5AE", border: "1px solid #1DE4BD33" },
      iconStyle: { background: "#1DE4BD" },
      onpress: usertype !== 3 && NavigatetoUser,
      status: true
    }
  ];
  const visibleTabs = tabs.filter((tab) => tab.status && tab.component);
  useEffect(() => {
    if (LoginUserData) handleFetchUserPermissions(LoginUserData?.user_id);
  }, [LoginUserData]);

  const handleFetchUserPermissions = (userId) => {
    if (!userId) return;
    // setloader(true);

    let formdata = new FormData();
    formdata.append("user_id", userId);

    ViewUserPermission(formdata)
      .then((res) => {
        if (res?.data?.data?.length > 0) {
          setUserPermissions(res.data.data);
        }
      })
      .finally(() => setloader(false));
  };
  console.log(userPermissions, LoginUserData, "userPermissions");

  const GetUserDropdown = (id) => {
    const formdata = new FormData();
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
  useEffect(() => {
    if (token) {
      handleControllerDropDown(LoginUserData);
    }
  }, [token]);

  // 🔹 Fetch dropdown list
  const handleControllerDropDown = () => {
    const formdata = new FormData();
    formdata.append("controller_type", 1);
    // formdata.append("report_for", 4);

    controllerdropdown(formdata)
      .then((res) => {
        if (res?.data) {
          setControllerDropDown(res.data || []);
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setloader(false));
  };
  useEffect(() => {
    GetDashboardData(null, null, null, usertype === 1 ? true : false);
    if (usertype !== 1) {
      handleGoogleMapApi();
    }
    GetGroupDropdown();
    if (usertype === 2 || usertype === 1) {
      GetUserDropdown(sessiongroup ? sessiongroup : "");
    }
  }, [controllertype]);
  useEffect(() => {
    if (token) {
      GetConsumptionReport();
    }
  }, [token]);

  const handleWaterConsumptionLineChart = (
    group_id,
    controller_id,
    period_type,
    newFromDate
  ) => {
    setloader(true);
    let formdata = new FormData();
    if (controllertype === 1 && (sessiongroup || group_id)) {
      formdata.append("group_id", group_id !== null ? group_id : sessiongroup);
    } else if (controllertype === 2 && (sessiongrouplight || group_id)) {
      formdata.append(
        "group_id",
        group_id !== null ? group_id : sessiongrouplight
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
    if (newFromDate) {
      formdata.append(
        "from_date",
        dayjs(newFromDate).format("YYYY-MM-DD HH:mm:ss")
      );
    }
    formdata.append("period_type", period_type ? period_type : 3);
    formdata.append("controller_type", controllertype);
    WaterConsumptionLineChart(formdata)
      .then((response) => {
        setPressureFlowLineReport(response?.data);
        setWaterConsuptionChart(response?.data?.aggregated_data);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  // useEffect(() => {
  //   if (token) {
  //     handlePowerConsumptionLineChart();
  //   }
  // }, [token]);

  // useEffect(() => {
  //   handleDepthLineChart(controllerID, 2);
  // }, [token]);

  const handleDepthLineChart = (controller_id, period_type, newFormDates) => {
    setloader(true);
    let formdata = new FormData();

    formdata.append("period_type", period_type ? period_type : "2");
    if (newFormDates) {
      formdata.append(
        "from_date",
        dayjs(newFormDates).format("YYYY-MM-DD HH:mm:ss")
      );
    }

    formdata.append("controller_type", controllertype);
    if (controller_id) formdata.append("controller_id", controller_id);

    DepthreportLineChart(formdata)
      .then((res) => {
        console.log("sdf", res?.data);
        const FilteredData = res?.data?.aggregated_data?.filter(
          (ele) => ele?.total_depth !== 0
        );
        const result = {
          aggregated_data: FilteredData,
          from_date: res?.data?.from_date,
          to_date: res?.data?.to_date
        };
        console.log(FilteredData, result, "FiltedData");

        setDepthLineChart(result);
      })
      .catch(getCatchMsg)
      .finally(() => setloader(false));
  };

  const handlePowerConsumptionLineChart = (
    group_id,
    controller_id,
    period_type,
    newFromDate
  ) => {
    setloader(true);
    let formdata = new FormData();
    if (controllertype === 1 && (sessiongroup || group_id)) {
      formdata.append("group_id", group_id !== null ? group_id : sessiongroup);
    } else if (controllertype === 2 && (sessiongrouplight || group_id)) {
      formdata.append(
        "group_id",
        group_id !== null ? group_id : sessiongrouplight
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
    if (newFromDate) {
      formdata.append(
        "from_date",
        dayjs(newFromDate).format("YYYY-MM-DD HH:mm:ss")
      );
    }
    formdata.append("period_type", period_type ? period_type : 3);
    formdata.append("controller_type", controllertype);
    PowerConsumptionLineChart(formdata)
      .then((response) => {
        setConsumptionLineChart(response?.data?.aggregated_data);
        setapipowerconsumption(response?.data);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  console.log("dashboard", sessiongroup);

  const PressuerFlowreadinReports = (payload, controller_id) => {
    console.log(payload, controller_id, "paylsdfsdfsdfdfoad");

    setloader(true);
    let formData = new FormData();
    formData.append(
      "from_date",
      dayjs(payload.from_date).format("YYYY-MM-DD HH:mm:ss")
    );

    formData.append(
      "to_date",
      `${dayjs(payload.to_date).format("YYYY-MM-DD")} 00:00:00`
    );

    formData.append("controller_type", controllertype);
    formData.append("from_date_format", payload.from_date_format);
    formData.append("to_date_format", payload.to_date_format);
    if (payload.controller_id || controller_id)
      formData.append(
        "controller_id",
        controller_id ? controller_id : payload.controller_id
      );

    PressuerFlowreadinReport(formData)
      .then(({ data }) => setFlowReadingData(data))
      .catch(getCatchMsg)
      .finally(() => setloader(false));
  };

  const GetFlowReadingReport = (payload, controller_id) => {
    console.log(controller_id, "controller_sdfsdfid");

    setloader(true);
    let formData = new FormData();
    formData.append(
      "from_date",
      dayjs(payload.from_date).format("YYYY-MM-DD HH:mm:ss")
    );
    formData.append(
      "to_date",
      dayjs(payload.to_date).format("YYYY-MM-DD HH:mm:ss")
    );
    formData.append("controller_type", controllertype);
    formData.append("from_date_format", payload.from_date_format ?? 1);
    formData.append("to_date_format", payload.to_date_format ?? 1);
    if (payload.controller_id || controller_id)
      formData.append(
        "controller_id",
        controller_id ? controller_id : payload.controller_id
      );

    FlowReadingService(formData)
      .then(({ data }) => setFlowReadingData(data))
      .catch(getCatchMsg)
      .finally(() => setloader(false));
  };

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

    if (user_id) {
      formdata.append("user_id", user_id || " ");
    } else if (controllertype === 1 && dashboardFilters?.user_id?.motor) {
      console.log("printed1");

      formdata.append("user_id", dashboardFilters?.user_id?.motor || "");
    } else if (controllertype === 2 && dashboardFilters?.user_id?.light) {
      console.log("printed2");
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
  const UpdateSessionStorage = (type, value) => {
    // motor controller
    if (controllertype === 1) {
      // Motor controller group
      if (type === "group") {
        mainFilterref.current.group.motor = value[0];

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

  const GetConsumptionReport = (fromdate, todate, Am, pm, controller_id) => {
    setloader(true);
    console.log(values?.from_date_format, values?.to_date_format, "CHECK1");
    let formData = new FormData();
    formData.append("from_date", dayjs(fromdate).format("YYYY-MM-DD HH:mm:ss"));
    console.log(fromdate, "1");
    formData.append("to_date", dayjs(todate).format("YYYY-MM-DD HH:mm:ss"));
    console.log(todate, "2");
    formData.append("controller_type", controllertype);

    formData.append("from_date_format", Am ? Am : 1);
    formData.append("to_date_format", pm ? pm : 1);

    if (controllerID || controller_id) {
      formData.append(
        "controller_id",
        controller_id ? controller_id : controllerID
      );
    }
    consumption(formData)
      .then(({ data }) => {
        console.log(data, "ConsumptionReport");
        setConsumptionReport(data);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  // useEffect(() => {
  //   if (LoginUserData) {
  //     handleWaterTankChart();
  //     handlePumpActivityChart();
  //   }
  // }, [LoginUserData]);

  // const handleWaterTankChart = (controller_id, period_type) => {
  //   setloader(true);
  //   let formdata = new FormData();
  //   if (controllertype === 1 && (motor?.id || controller_id)) {
  //     formdata.append(
  //       "controller_id",
  //       controller_id ? controller_id : controllerID
  //     );
  //   } else if (controllertype === 2 && (light?.id || controller_id)) {
  //     formdata.append(
  //       "controller_id",
  //       controller_id ? controller_id : controllerID
  //     );
  //   }
  //   formdata.append("period_type", 1);
  //   formdata.append("device_type", 1);
  //   formdata.append("controller_type", controllertype);
  //   WaterTankChart(formdata)
  //     .then((res) => {
  //       setWaterTankLevel(res?.data);

  //       // setConsumptionReport(data);
  //     })
  //     .catch((err) => {
  //       getCatchMsg(err);
  //     })
  //     .finally(() => setloader(false));
  // };

  const handleWaterTankChart = (period_type, controller_id) => {
    setloader(true);
    let formdata = new FormData();

    formdata.append("period_type", period_type ? period_type : "1");
    formdata.append("device_type", 1);
    if (controller_id) {
      formdata.append("controller_id", parseInt(controller_id, 10));
    }

    formdata.append("controller_type", 1);

    WaterTankChart(formdata)
      .then((res) => {
        setWaterTankLevel(res?.data?.tank_data?.[0]?.tank_data || []);
        console.log(res?.data?.tank_data?.[0]?.tank_data || [], "llll");
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setloader(false));
  };

  const handlePumpActivityChart = (
    period_type,
    controller_id,
    newFormDates
  ) => {
    setloader(true);
    let formdata = new FormData();
    if (newFormDates) {
      formdata.append(
        "from_date",
        dayjs(newFormDates).format("YYYY-MM-DD HH:mm:ss")
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
    formdata.append("period_type", period_type ? period_type : "1");
    formdata.append("controller_type", "1");

    // formdata.append("controller_id","4951,5301");

    PumpActivityChart(formdata)
      .then((res) => {
        setPumpActivityData(res?.data);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  const handleVoltLineChart = (period_type, controller_id, newFormDates) => {
    setloader(true);
    let formdata = new FormData();
    if (newFormDates) {
      formdata.append(
        "from_date",
        dayjs(newFormDates).format("YYYY-MM-DD HH:mm:ss")
      );
    }

    if (controllertype === 1 && (motor?.id || controller_id)) {
      formdata.append("controller_id", controller_id);
    } else if (controllertype === 2 && (light?.id || controller_id)) {
      formdata.append("controller_id", controller_id);
    }
    formdata.append("period_type", period_type ? period_type : "1");
    formdata.append("controller_type", "1");

    VoltsLineChart(formdata)
      .then((res) => {
        setVoltLineChart(res?.data);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  const handleAmpsLineChart = (period_type, controller_id, newFormDates) => {
    setloader(true);
    let formdata = new FormData();
    if (newFormDates) {
      formdata.append(
        "from_date",
        dayjs(newFormDates).format("YYYY-MM-DD HH:mm:ss")
      );
    }
    if (controllertype === 1 && (motor?.id || controller_id)) {
      formdata.append("controller_id", controller_id);
    } else if (controllertype === 2 && (light?.id || controller_id)) {
      formdata.append("controller_id", controller_id);
    }
    formdata.append("period_type", period_type ? period_type : "1");
    formdata.append("controller_type", "1");

    AmpsLineChart(formdata)
      .then((res) => {
        setAmpsLineChart(res?.data);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };
  const handleWeatherReport = (controller_id) => {
    setloader(true);
    let formdata = new FormData();
    formdata.append("controller_id", controller_id);

    weatherReport(formdata)
      .then((res) => {
        if (res?.data.status === 1) {
          setWeatherReport(res?.data);
        } else {
          toast.error(res?.data?.msg);
          setWeatherReport([]);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };
  console.log(getCardPermission(3)?.title, "loader");

  return (
    <div className="dashboard-page container-fluid">
      <Loader isLoader={loader} />
      <div className="flex-end mt-2 mb-2" style={{ margin: "0" }}>
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

      {/* Count Cards */}
      <Row className="g-3 mt-2">
        {data.map((e) => (
          <Col key={e.id} xs={12} sm={6} md={4} lg={2}>
            <CountCard
              image={e.image}
              name={e.name}
              count={e.count}
              style={e.style}
              iconStyle={e.iconStyle}
              onpress={() => {
                // FIXED: called e.onpress() unconditionally — the "Total
                // Kw/H Load" card has no onpress at all (it's just a
                // stat, not a link) and "Total Group"'s can evaluate to
                // `false` (usertype===3), so clicking either crashed with
                // "e.onpress is not a function". Only call it when it
                // really is one.
                if (typeof e.onpress === "function") {
                  e.onpress();
                }
              }}
            />
          </Col>
        ))}
      </Row>
      {(getCardPermission(38)?.status === 1 || usertype === 1) && (
        <WeatherChart
          controllerDropDown={controllerDropDown}
          weatherData={weatherReportData?.data}
          districtName={weatherReportData?.district_name}
          onPressData={(data) => {
            console.log(data, "Data123");
            if (data) {
              handleWeatherReport(data);
            } else {
              toast.error("please select device");
              setWeatherReport(null);
            }
          }}
        />
      )}

      <Row className="g-3 mt-2"></Row>
      <div className="mt-5">
        {/* <CustomTabs tabs={tabs} defaultActive={0} /> */}
        {visibleTabs.length > 0 && (
          <CustomTabs tabs={visibleTabs} defaultActive={0} />
        )}
      </div>

      {/* Charts Section */}
      <Row className="mt-4 g-3">
        {(getCardPermission(3)?.status === 1 || usertype === 1) && (
          <Col xs={12} md={6}>
            <Card>
              <WaterTankLevelChart
                title={getCardPermission(3)?.title}
                data={waterTankLeval}
                controllerDropDown={controllerDropDown}
                onPressData={(period_type, controller_id) => {
                  handleWaterTankChart(period_type, controller_id);
                }}
              />
            </Card>
          </Col>
        )}
        {(getCardPermission(4)?.status === 1 || usertype === 1) && (
          <Col xs={12} md={6}>
            <Card>
              <PumpRuntimeChart
                title={getCardPermission(4)?.title}
                data={pumpActivityData}
                controllerDropDown={controllerDropDown}
                onPressData={(period_type, controller_id, newFormDates) => {
                  console.log(controller_id, "controller_id");

                  if (controller_id) {
                    handlePumpActivityChart(
                      period_type,
                      controller_id,
                      newFormDates
                    );
                  } else {
                    toast.error("Please select device");
                  }
                }}
              />
            </Card>
          </Col>
        )}
        {(getCardPermission(5)?.status === 1 || usertype === 1) && (
          <Col xs={12} md={6}>
            <Card>
              <WaterQualityChart
                controllerDropDown={controllerDropDown}
                title={getCardPermission(5)?.title}
              />
            </Card>
          </Col>
        )}
        {(getCardPermission(6)?.status === 1 || usertype === 1) && (
          <Col xs={12} md={6}>
            <Card>
              <ScheduleCompilerChart
                title={getCardPermission(6)?.title}
                data={dashboardData}
              />
            </Card>
          </Col>
        )}
        {(getCardPermission(7)?.status === 1 || usertype === 1) && (
          <Col xs={12} md={6}>
            <Card>
              <DepthLinechart
                title={getCardPermission(7)?.title}
                controllerDropDown={controllerDropDown}
                depthLinechartData={depthLinechart}
                onPressData={(period_type, controller_id, newFormDates) => {
                  if (controller_id) {
                    handleDepthLineChart(
                      controller_id ? controller_id : controllerID,
                      period_type,
                      newFormDates
                    );
                  } else {
                    toast.error("please select device");
                  }
                }}
              />
            </Card>
          </Col>
        )}

        {(getCardPermission(34)?.status === 1 || usertype === 1) && (
          <Col xs={12} md={6}>
            <Card>
              <VoltLineChart
                title={getCardPermission(34)?.title}
                controllerDropDown={controllerDropDown}
                data={voltLineChart}
                onPressData={(period_type, controller_id, newFormDates) => {
                  console.log(controller_id, period_type, "controller_id");
                  if (controller_id) {
                    handleVoltLineChart(
                      period_type,
                      controller_id,
                      newFormDates
                    );
                  } else {
                    toast.error("please select device");
                  }
                }}
              />
            </Card>
          </Col>
        )}
        {(getCardPermission(35)?.status === 1 || usertype === 1) && (
          <Col xs={12} md={6}>
            <Card>
              <AmbsLineChartPage
                title={getCardPermission(35)?.title}
                controllerDropDown={controllerDropDown}
                data={ampsLineChart}
                onPressData={(period_type, controller_id, newFormDates) => {
                  console.log(controller_id, period_type, "controller_id");
                  if (controller_id) {
                    handleAmpsLineChart(
                      period_type,
                      controller_id,
                      newFormDates
                    );
                  } else {
                    toast.error("please select device");
                  }
                }}
              />
            </Card>
          </Col>
        )}
      </Row>
      <div style={{ padding: 10 }}>
        <Maplocationfinder mapdata={mapData} />
      </div>
    </div>
  );
};

export default DashBoard;
