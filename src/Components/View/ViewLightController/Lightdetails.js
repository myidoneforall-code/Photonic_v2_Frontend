import tank from "../../../Assets/image/tank.png";

import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  buttonapi,
  devicerefreshapi,
  editcontroller,
  editdevice,
  editmotorsetting,
  GetnotificationAccessDropdown,
  listusersapi,
  motordata,
  servicedetailsapi,
  UpdateNotificationSettings,
} from "../../../Service/ApiService";

import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowLeft,
  FaStar,
} from "react-icons/fa";
import { OverlayTrigger, Tab, Table, Tabs, Tooltip } from "react-bootstrap";
import Toggle from "../../ToggleButton";
import chartstyle from "../Dashboard/Charts/Chart.module.css";

import Changegroup from "../../../Modalcomponents/Changegroup";
import { toast } from "react-hot-toast";

import {
  MdLocationOn,
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";
import { getCookie } from "../../../Utilities/Cookie";
import { GoAlert } from "react-icons/go";
import EditLightModal from "../../../Modalcomponents/EditLightModal";
import AddLightModal from "../../../Modalcomponents/AddLightModal";
import moment from "moment";

import { ImSpinner11 } from "react-icons/im";
import { FaTrashAlt } from "react-icons/fa";
import AllDetailsAddModal from "../../../Modalcomponents/AllDetailsAddModal";
import AllDetailsEditModal from "../../../Modalcomponents/AllDetailsEditModal";
import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";
import Loader from "../../Loader";
import ReactPaginate from "react-paginate";

import TimePicker from "rc-time-picker";
import ControllerWaterfallChart from "../Dashboard/Charts/ControllerWaterfallChart";
import ValveWaterfallChart from "../Dashboard/Charts/ValveWaterfallChart";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import devicestyle from "../ViewController/motorcontroller.module.css";
import Controllerhistorydetails from "../ViewController/HistoryDetails/ControllerHistoryDetails";
import { Checkbox, notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  GetSessionStorage,
  SetSessionStorage,
} from "../../../Utilities/Storage";
import BlurComponent from "../BlurComponent";
import { ExportedImages } from "../../../Utilities/ImageExport";
import AMCExpiryModal from "../../../Modalcomponents/AMCexpiryModal";
import {
  Updatefilterdata,
  UpdatePageState,
} from "../../Store/Config/Configuration";
import { getCatchMsg } from "../../../Utilities/Methods";
import CommonClockTimePicker from "../../CommonComponents/CommonClockTimePicker";
import dayjs from "dayjs";

export default function Lightdetails() {
  let abortcontroller = undefined;
  let location = useLocation();
  let dispatch = useDispatch();
  const [loader, setloader] = useState(false);
  const [controllerdata, setcontroller] = useState();
  const [pevid, sepevtid] = useState();
  const [lorastate, setlora] = useState();
  const [editEb, setEb] = useState(false);
  const [editstate, setedit] = useState(true);
  const [topic, settopic] = useState();
  const [contname, setname] = useState();
  const [group, setgroup] = useState(false);
  const [isloading, setloading] = useState(false);
  const [mcpbutton, setmcpbutton] = useState(1);
  const { lightViewDatas } = useSelector((state) => state);
  let sessiondata = GetSessionStorage("lightViewDatas");
  const LightSessionData = sessiondata ? JSON.parse(sessiondata) : null;
  const [buttontype, setbuttontype] = useState({
    contrbuttontype: 1,
    devicebuttontype: 2,
  });
  const [notificationList, setnotificationList] = useState([]);
  const [editNotification, setEditNotification] = useState(false);
  const [notificationAccessList, setNotificationAccess] = useState([]);

  const [lightdata, setlightdata] = useState({
    devicename: "",
    dim: "",
    ontime: "",
    offtime: "",
    latitude: "",
    longitude: "",
    is_fixed: "",
  });
  const [type, settype] = useState({
    requesttypeOne: 1,
    requesttypeTwo: 2,
    requesttypeThree: 3,
    requesttypeFour: 4,
    requesttypeFive: 5,
    requesttypeSix: 6,
  });
  const [deviceid, setdeviceid] = useState();
  const [editlightdata, seteditlightdata] = useState(false);
  const [deviceindex, setdeviceindex] = useState();
  const [settingloading, setsettingloading] = useState(false);
  const [count, setcount] = useState(1);
  const [editlightdevice, seteditlightdevice] = useState(false);
  const [addmodal, setaddmodal] = useState(false);
  const [showmodal, setshowmodal] = useState({ show: false, data: null });
  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;
  const [ebdata, setebdata] = useState({
    ebval: "",
    lan: "",
    lat: "",
    is_fixed: "",
  });
  let navigate = useNavigate();
  const [locationtype, setlocation] = useState(0);
  const [eventkey, seteventkey] = useState();
  const [buttonstate, setbutton] = useState(0);

  const [expiryModal, setexpiryModal] = useState({
    show: false,
    UpdatedData: null,
  });

  // all details
  const [totaldatacount, settotaldata] = useState();
  const [pagestate, setpage] = useState(1);
  const [listuser, setlistuser] = useState();
  const [servicedetail, setservicedetail] = useState();
  const [servicepage, setservicepage] = useState(1);
  const [historydetail, sethistorydetail] = useState();
  const [modalshow, setaddallmodal] = useState(false);
  const [buttongreyid, setbuttongreyid] = useState("");
  const [serialno, setserialno] = useState("");
  const [lgShow, setLgShow] = useState({
    show: false,
    data: null,
  });
  const [deletemodal, setdeletemodal] = useState({
    show: false,
    serviceid: "",
  });

  const [LightDelete, setLightDelete] = useState({
    lightID: "",
    watt: "",
    count: "",
    show: false,
  });

  const [settings, setsettings] = useState({
    hv: "",
    lv: "",
    pf: "",
    ol: "",
    onofter1: "",
    onbefore1: "",
    imon1: "",
    imoff1: "",
    onofter2: "",
    onbefore2: "",
    imon2: "",
    imoff2: "",
    mode1: "",
    mode2: "",
  });

  const [editstate1, setedit1] = useState(false);
  const [settingloadingTwo, setsettingloadingTwo] = useState(false);
  let controllerdetailspage = sessionStorage.getItem("lightdetailspage");
  const getListNotifications = () => {
    GetnotificationAccessDropdown()
      .then((res) => {
        if (res.data.status === 1) {
          let SetaccessPermission = res.data.data.map((item, index) => {
            return { ...item };
          });

          setnotificationList(SetaccessPermission);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  const handleUpdateNotificationSetting = (UpdatedList) => {
    let access_for = UpdatedList.reduce((acc, val) => {
      if (val.access) {
        acc.push(val.id);
      }
      return acc;
    }, []);
    let formData = new FormData();
    formData.append("notification_access", access_for);
    formData.append("controller_id", location?.state.id);

    UpdateNotificationSettings(formData)
      .then((res) => {
        if (res.data.status === 1) {
          toast.success(res.data.msg);
          LightController();
        } else {
          toast.error(res.data.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };
  useEffect(() => {
    const interval = setInterval(() => {
      handleGetServiceDetails();
      handleGetUserDetails();
      LightController();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    handleGetServiceDetails();
    handleGetUserDetails();
    getListNotifications();
  }, [pagestate, servicepage]);

  useEffect(() => {
    if (location?.state?.ControllerFilters) {
      dispatch(Updatefilterdata(location?.state?.ControllerFilters?.values));
      dispatch(UpdatePageState(location?.state?.ControllerFilters?.page));
    }
  }, [location?.state]);
  useEffect(() => {
    setnotificationList(
      notificationList?.map((ele) =>
        notificationAccessList?.includes(ele?.id)
          ? { ...ele, access: true }
          : ele
      )
    );
  }, [notificationAccessList]);
  const handleGetServiceDetails = () => {
    setloader(true);
    let ServiceformData = new FormData();
    ServiceformData.append("controller_id", location?.state.id);
    ServiceformData.append("for_web", 1);

    servicedetailsapi(ServiceformData, servicepage)
      .then(({ data }) => {
        setservicedetail(data);
      })
      .catch((err) => {
        // if (err?.response?.data?.detail) {
        //   toast(err.response.data.detail, { type: "error" });
        // }
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        }
        //  else {
        //   toast("Something went wrong!!", { type: "error" });
        // }
      })
      .finally(() => setloader(false));
  };

  const handleGetUserDetails = () => {
    setloader(true);
    let ListuserformData = new FormData();
    ListuserformData.append("controller_id", location?.state.id);
    ListuserformData.append("controller_type", 2);

    listusersapi(ListuserformData, pagestate)
      .then(({ data }) => {
        setlistuser(data?.items);
        settotaldata(data?.total);
      })
      .catch((err) => {
        // if (err?.response?.data?.detail) {
        //   toast(err.response.data.detail, { type: "error" });
        // }
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      })
      .finally(() => setloader(false));
  };

  const currentItems = listuser;
  const pageCount = Math.ceil(totaldatacount / 12);
  const handlePageClick = (event) => {
    setpage(JSON.parse(event.selected) + 1);
    setserialno(JSON.parse(event.selected));
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        {currentItems?.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>S.no</th>
                <th>User Name</th>
                <th>Mobile number</th>
                <th>Access type</th>
              </tr>
            </thead>

            <tbody>
              {currentItems?.map((userdata, ind) => {
                return (
                  <tr key={ind}>
                    <td>{serialno * 12 + (ind + 1)}</td>
                    <td>{userdata.username}</td>
                    <td>{userdata.mobile_no}</td>
                    <td>
                      {userdata.access_type == 0
                        ? "Admin"
                        : userdata.access_type == 1
                        ? "Control"
                        : userdata.access_type == 2
                        ? "Operator"
                        : userdata.access_type == 3
                        ? "View Only"
                        : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <p className="servicenodatafound">no data found</p>
        )}
      </>
    );
  };

  const currenServiceItems = servicedetail?.items;
  const ServicePageCount = Math.ceil(servicedetail?.total / 12);
  const handlePageClickEvent = (event) => {
    setservicepage(JSON.parse(event.selected) + 1);
  };

  const ServiceItems = ({ CurrentServiceData }) => {
    return (
      <>
        <div
          className={`${devicestyle.all_details_div_bg} ${commonstyle.cards_border_radius}`}
        >
          <div className="service_add_service">
            <div></div>
            <button
              className="addButton service_add_button"
              onClick={() => {
                setaddallmodal(true);
              }}
            >
              add service
            </button>
          </div>
          {CurrentServiceData?.length > 0 ? (
            <div
              className={devicestyle.user_service_details}
              style={
                servicedetail?.total < 12
                  ? { marginBottom: "90px" }
                  : { marginBottom: "0px" }
              }
            >
              {CurrentServiceData?.map((service, index) => {
                return (
                  <div className={devicestyle.service_bg} key={index}>
                    <div className={devicestyle.fault_div_flex}>
                      <p
                        className={devicestyle.service_count}
                        style={{ color: "#1e90ff" }}
                      >
                        {service.service_name}
                      </p>
                      {controllerdata?.access_type === 2 ||
                      controllerdata?.access_type === 3 ? null : (
                        <img
                          src={ExportedImages.EDIT_ICON_BLUE}
                          onClick={() => {
                            setLgShow({
                              show: true,
                              data: service,
                            });
                          }}
                          className="pointerCurser"
                        />
                      )}
                    </div>
                    <div className={devicestyle.fault_div_flex}>
                      <p
                        className={`${devicestyle.user_name} ${devicestyle.username_max_width}`}
                      >
                        <img
                          src={ExportedImages.USER_ICON}
                          alt="Alldetailsuser"
                        />
                        {service.service_man_name}
                      </p>
                      <p className={devicestyle.controller_fault}>
                        {/* {service?.created_at
                                  ? moment(service?.created_at).format(
                                      "DD-MM-YYYY HH:mm:ss A "
                                    )
                                  : null} */}
                        {service?.created_at}
                      </p>
                    </div>
                    <div
                      className={`${devicestyle.fault_div_flex} service-div-flex`}
                    >
                      <p className={devicestyle.service_count}>
                        <span className={devicestyle.controller_fault}>
                          {service.msg}
                        </span>
                      </p>
                      {controllerdata?.access_type === 2 ||
                      controllerdata?.access_type === 3 ? null : (
                        <FaTrashAlt
                          className="required"
                          onClick={() => {
                            setdeletemodal({
                              show: true,
                              serviceid: service.service_id,
                            });
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p
              className="servicenodatafound"
              style={
                servicedetail?.total < 12
                  ? { marginBottom: "90px" }
                  : { marginBottom: "0px" }
              }
            >
              No data found
            </p>
          )}
        </div>
      </>
    );
  };

  // Setting details

  const RefreshData = () => {
    let formData = new FormData();
    formData.append("controller_id", controllerdata?.controller_id);
    formData.append("controller_type", 2);
    formData.append("request_type", 2);

    buttonapi(formData)
      .then(({ data }) => {})
      .catch((err) => {});
  };

  const tolighttimeedit = (id, accesstype) => {
    if (editstate1) {
      let formdata = {
        notification_alert: buttonstate ? 1 : 0,
        lv: parseInt(settings.lv),
        hv: parseInt(settings.hv),
        ol_amps: parseInt(settings.ol),
        on_time1: settings.onofter1,
        off_time1: settings.onbefore1,
        intermediate_on_time: settings.imon1,
        intermediate_off_time: settings.imoff1,
        on_time2: settings.onofter2,
        off_time2: settings.onbefore2,
        intermediate_on_time2: settings.imon2,
        intermediate_off_time2: settings.imoff2,
        light_mode1: parseInt(settings?.mode1),
        light_mode2: parseInt(settings?.mode2),
        pf: settings?.pf,
      };
      editmotorsetting(location?.state?.id, formdata)
        .then((res) => {
          toast(res?.data, { type: "success" });
          LightController();
          RefreshData();
          setedit1(false);
        })
        .catch((err) => {
          setedit1(true);
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    }
  };

  const ChangeMoreSetingButton = (
    id,
    togglestatus,
    mcptripbutton,
    accesstype
  ) => {
    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }

    abortcontroller = new AbortController();
    if (
      accesstype === 0 ||
      accesstype === 1 ||
      accesstype === null ||
      accesstype === 2
    ) {
      if (mcptripbutton === 1) {
        let formData = new FormData();
        formData.append("controller_id", id);
        formData.append("controller_type", 2);
        formData.append("request_type", 5);
        setbuttongreyid(1);
        buttonapi(formData, abortcontroller)
          .then(({ data }) => {
            setTimeout(() => {
              LightController();
              setbuttongreyid("");
            }, 5000);
          })
          .catch((err) => {});
      } else if (editstate1) {
        let formData = new FormData();
        formData.append("controller_id", id);
        formData.append("controller_type", 2);
        formData.append("request_type", togglestatus ? 3 : 4);
        setbuttongreyid(2);
        buttonapi(formData)
          .then(({ data }) => {
            setTimeout(() => {
              LightController();
              setbuttongreyid("");
            }, 5000);
          })
          .catch((err) => {});
      }
    }
  };
  // end

  useEffect(() => {
    window.scrollTo(0, 0);
    handleSetValues();
    LightController("initial");
    return () => notification.destroy();
  }, []);
  const handleSetValues = () => {
    if (lightViewDatas) {
      setcontroller(lightViewDatas);
    } else if (LightSessionData) {
      handleUpdateDatas(LightSessionData);
    }
  };
  const handleUpdateDatas = (data) => {
    setsettings({
      pf: data?.controller_setting?.pf,
      hv: data?.controller_setting?.hv,
      lv: data?.controller_setting?.lv,
      ol: data?.controller_setting?.ol_amps,
      onofter1: data?.controller_setting?.on_time1,
      onbefore1: data?.controller_setting?.off_time1,
      imon1: data?.controller_setting?.intermediate_on_time,
      imoff1: data?.controller_setting?.intermediate_off_time,
      onofter2: data?.controller_setting?.on_time2,
      onbefore2: data?.controller_setting?.off_time2,
      imon2: data?.controller_setting?.intermediate_on_time2,
      imoff2: data?.controller_setting?.intermediate_off_time2,
      mode1: data?.controller_setting?.light_mode1,
      mode2: data?.controller_setting?.light_mode2,
    });

    setcontroller(data);
    setbutton(data?.notification_alert);
    setname(data?.controller_name);
    settopic(data?.topic);
    setlora(data?.lora_status === 1 ? true : false);
    setebdata({
      ebval: data?.eb_number,
      lat: data?.controller_setting?.latitude,
      lan: data?.controller_setting?.longitude,
      is_fixed: data?.is_fixed,
    });

    let grpid = data?.group?.find((ele, indx) => {
      return ele;
    });
    sepevtid(grpid);
  };

  const LightController = (type) => {
    setloader(true);
    motordata(location?.state?.id)
      .then(({ data }) => {
        setNotificationAccess(data?.notification_access || []);

        handleUpdateDatas(data);
        if (data) {
          SetSessionStorage("lightViewDatas", JSON.stringify(data));
        }
        if ((usertype === 2 || usertype === 3) && type === "initial") {
          handleShowAMCexpiryPopup(data);
        }
      })
      .catch(() => {})
      .finally(() => setloader(false));
  };

  const handleShowAMCexpiryPopup = (data) => {
    data?.light_data?.map((ele) => {
      if (ele.is_warning) {
        setexpiryModal({ show: true, UpdatedData: data });
      }
    });
    if (data.is_warning) {
      setexpiryModal({ show: true, UpdatedData: data });
    }
  };

  const Changebutton = (id, togglestatus, accesstype, buttontype) => {
    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }

    abortcontroller = new AbortController();
    if (
      accesstype === 0 ||
      accesstype === 1 ||
      accesstype === null ||
      accesstype === 2
    ) {
      if (buttontype === 1) {
        let formData = new FormData();
        formData.append("controller_id", id);
        formData.append("controller_type", 2);
        formData.append("request_type", togglestatus ? 3 : 4);
        setbuttongreyid(id);
        buttonapi(formData, abortcontroller)
          .then(({ data }) => {
            setTimeout(() => {
              LightController();
              setbuttongreyid("");
            }, 5000);
          })
          .catch((err) => {});
      } else if (buttontype === 2) {
        let formData = new FormData();
        formData.append("device_id", id);
        formData.append("device_type", 4);
        formData.append("request_type", togglestatus ? 3 : 4);
        setbuttongreyid(id);
        devicerefreshapi(formData, abortcontroller)
          .then(({ data }) => {
            setTimeout(() => {
              LightController();
              setbuttongreyid("");
            }, 5000);
          })
          .catch((err) => {});
      }
    }
  };

  const EditLightdevice = (id) => {
    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }

    abortcontroller = new AbortController();

    if (editlightdevice) {
      setloader(true);
      let lightdevice = {
        device_name: lightdata.devicename,
        dim: lightdata.dim,
        time1: lightdata.ontime,
        time2: lightdata.offtime,
        latitude: lightdata.latitude,
        longitude: lightdata.longitude,
        is_fixed: lightdata.is_fixed ? lightdata.is_fixed : 0,
        status: 1,
      };
      editdevice(lightdevice, id)
        .then((res) => {
          toast(res.data, { type: "success" });
          LightController();
          let formData = new FormData();
          formData.append("device_id", id);
          formData.append("device_type", 4);
          formData.append("request_type", 2);
          devicerefreshapi(formData);
        })
        .catch((err) => {
          // if (err?.response?.data?.detail?.[0]?.msg) {
          //   toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          // } else if (err?.response?.data?.detail) {
          //   toast(err?.response?.data?.detail, { type: "error" });
          // }
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else if (err?.config?.signal?.reason == "error cancelled") {
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setloader(false));
    }
  };

  const loadingspinner = (accesstype, requesttypedata, id) => {
    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }

    abortcontroller = new AbortController();

    if (
      requesttypedata === 1 &&
      id === id &&
      (accesstype === 0 ||
        accesstype === 1 ||
        accesstype === null ||
        accesstype === 2)
    ) {
      setloading(true);
      setTimeout(() => {
        setloading(false);
      }, 3000);

      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", 4);
      formData.append("request_type", 2);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            LightController();
            setlocation();
          }, 5000);
        })
        .catch((err) => {});
    } else if (requesttypedata === 2) {
      setsettingloading(true);
      setTimeout(() => {
        setsettingloading(false);
      }, 3000);

      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", 4);
      formData.append("request_type", 2);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            LightController();
          }, 5000);
        })
        .catch((err) => {});
    } else if (
      requesttypedata === 3 &&
      (accesstype === 0 ||
        accesstype === 1 ||
        accesstype === null ||
        accesstype === 2)
    ) {
      setloading(true);
      setlocation(1);
      setTimeout(() => {
        setloading(false);
      }, 5000);

      let formData = new FormData();
      formData.append("controller_id", id);
      formData.append("controller_type", 2);
      formData.append("request_type", 2);

      buttonapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            LightController();
            setlocation(0);
          }, 5000);
        })
        .catch((err) => {});
    } else if (requesttypedata === 4) {
      setsettingloadingTwo(true);
      setTimeout(() => {
        setsettingloadingTwo(false);
      }, 3000);
      let formData = new FormData();
      formData.append("controller_id", id);
      formData.append("controller_type", 2);
      formData.append("request_type", 2);

      buttonapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            LightController();
          }, 5000);
        })
        .catch((err) => {});
    } else if (requesttypedata === 5) {
      setloading(true);
      setTimeout(() => {
        setlocation();
        setloading(false);
      }, 5000);
      let formData = new FormData();
      formData.append("controller_id", id);
      formData.append("controller_type", 2);
      formData.append("request_type", 1);

      buttonapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            LightController();
          }, 5000);
        })
        .catch((err) => {});
    }
    if (requesttypedata === 6 && id === id) {
      setloading(true);
      setTimeout(() => {
        setloading(false);
      }, 3000);

      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", 4);
      formData.append("request_type", 1);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            LightController();
            // setlocation();
          }, 5000);
        })
        .catch((err) => {});
    }
  };

  //end
  const toshow = () => {
    if (!editstate) {
      setgroup(true);
    }
  };
  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };
  const toeditEb = () => {
    if (editEb) {
      let ebedit = {
        controller_name: controllerdata?.controller_name,
        eb_number: ebdata?.ebval,
        topic: controllerdata?.topic,
        latitude: ebdata?.lat,
        longitude: ebdata?.lan,
        status: 1,
        is_fixed: ebdata.is_fixed ? ebdata.is_fixed : 0,
        msg: controllerdata?.msg,
        lora_status: lorastate ? 1 : 0,
      };
      editcontroller(location?.state?.id, ebedit)
        .then((res) => {
          LightController();
          toast(res.data, { type: "success" });
        })
        .catch((err) => {
          // toast(err.response?.detail, { type: "success" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    }
  };

  const todashboard = () => {
    navigate(controllerdetailspage, {
      state: {
        groupid: location?.state?.groupid,
        usertype: location?.state?.usertype,
        type: 2,
      },
    });
    sessionStorage.removeItem("lightcontrollerpage");
  };

  const latlong = (letters) => {
    var ch = String.fromCharCode(letters.which);

    if (!/[0-9.]/.test(ch)) {
      letters.preventDefault();
    }
  };

  const toedit = () => {
    if (!editstate) {
      let editdata = {
        controller_name: contname,
        topic: topic,
        eb_number: controllerdata?.eb_number,
        latitude: controllerdata?.latitude,
        longitude: controllerdata?.longitude,
        is_fixed: controllerdata?.is_fixed ? controllerdata?.is_fixed : 0,
        msg: controllerdata?.msg,
        status: 1,
        lora_status: lorastate ? 1 : 0,
      };
      editcontroller(location?.state?.id, editdata)
        .then((res) => {
          LightController();
          toast(res?.data, { type: "success" });
        })
        .catch((err) => {
          // toast(err?.response?.detail, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        });
    }
  };
  const toadd = () => {
    navigate("/dashboard/addcontroller", {
      state: {
        device: 1,
        controllercode: controllerdata.controller_code,
        controllerid: controllerdata.controller_id,
        ControllerFilters: location?.state?.ControllerFilters,
      },
    });
    sessionStorage.setItem("lightcontrollerpage", "/dashboard/lightdetails");
  };

  const ToDeletedevice = () => {
    navigate("/dashboard/deletedevice", {
      state: {
        controllerid: controllerdata.controller_id,
        ControllerFilters: location?.state?.ControllerFilters,
      },
    });
  };

  return (
    <>
      {expiryModal.show && (
        <AMCExpiryModal
          show={expiryModal.show}
          ControllerData={expiryModal.UpdatedData}
          onClose={() => {
            setexpiryModal({ show: false, UpdatedData: null });
          }}
        />
      )}

      <Loader isLoader={loader} />
      {showmodal.show ? (
        <EditLightModal
          show={showmodal.show}
          close={() =>
            setshowmodal((prev) => {
              return {
                ...prev,
                show: false,
              };
            })
          }
          editData={showmodal.data}
          DeviceData={LightController}
        ></EditLightModal>
      ) : null}

      {LightDelete.show ? (
        <DeleteConfirmationModal
          show={LightDelete.show}
          close={() =>
            setLightDelete((prev) => {
              return {
                ...prev,
                show: false,
              };
            })
          }
          lightid={LightDelete.lightID}
          Watt={LightDelete.watt}
          count={LightDelete.count}
          Deletekey={15}
          LightController={LightController}
        />
      ) : null}

      {addmodal ? (
        <AddLightModal
          show={addmodal}
          close={() => setaddmodal(false)}
          DeviceData={LightController}
          controllerid={location?.state?.id}
        />
      ) : null}
      {group ? (
        <Changegroup
          show={group}
          close={() => setgroup(false)}
          controller={controllerdata}
          pevid={pevid}
          LightController={LightController}
        />
      ) : null}
      <div className="background-images">
        <div className="router-pages">
          <div className={commonstyle.controller_head}>
            <div className="pre-page">
              {/* {usertype === 3 ? null : ( */}
              <FaArrowLeft
                className="arrow total_head"
                onClick={() => todashboard()}
              />
              {/* )} */}
              <p className="controller-name total_head">Light Controller</p>
            </div>
            <div className={commonstyle.cnt_buttons}>
              {controllerdata?.access_type == 3 ||
              controllerdata?.access_type == 2 ? null : (
                <>
                  <div className="cnt-buttons">
                    <button
                      type="button"
                      className="dev-add-btn"
                      onClick={() => toadd()}
                    >
                      Add device
                    </button>
                  </div>
                </>
              )}
              {controllerdata?.access_type == 3 ||
              controllerdata?.access_type == 2 ? null : (
                <button
                  type="button"
                  className="dev-del-btn"
                  onClick={() => ToDeletedevice()}
                >
                  Delete Device
                </button>
              )}
            </div>
          </div>
          <div className="view-page">
            <div
              className={
                controllerdata?.controller_code &&
                controllerdata?.amc_status < 1
                  ? "BlurViewContainer"
                  : ""
              }
            >
              <div className="controller-view ">
                <div className="viewtop-div">
                  <div className="editflex">
                    {/* {controllerdata?.controller_name ? ( */}
                    {editstate ? (
                      <div>
                        {lorastate ? <FaStar className="lorastar" /> : null}
                        {controllerdata?.controller_name ? (
                          <OverlayTrigger
                            key="top"
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">
                                <strong>
                                  {controllerdata?.controller_name}
                                </strong>
                              </Tooltip>
                            }
                            delay={{ show: "200", hide: "400" }}
                          >
                            <p className={devicestyle.motor_name}>
                              {controllerdata?.controller_name}
                            </p>
                          </OverlayTrigger>
                        ) : (
                          <p className={devicestyle.motor_name}>
                            {controllerdata?.controller_name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        maxLength={50}
                        className={`${devicestyle.motor_name_input} filedPickBackground`}
                        defaultValue={controllerdata?.controller_name}
                        onChange={(e) => setname(e.target.value)}
                        disabled={editstate}
                      />
                    )}
                    {/* ) : null} */}
                    {controllerdata?.access_type === 2 ||
                    controllerdata?.access_type === 3 ? null : (
                      <img
                        src={
                          editstate
                            ? ExportedImages.EDIT_ICON_BLACK
                            : ExportedImages.SAVE_ICON_BLUE
                        }
                        onClick={() => {
                          toedit();
                          setedit(!editstate);
                        }}
                        className="pointerCurser"
                      />
                    )}
                  </div>
                  {controllerdata?.controller_code ? (
                    <div className="towerflex">
                      {controllerdata?.controller_code ? (
                        isloading &&
                        controllerdata.controller_id === deviceid ? (
                          <img
                            src={ExportedImages.GREEN_SPINNER_GIF}
                            alt="tower"
                            className="controllerdetailpinner"
                            style={{ height: "23px" }}
                          />
                        ) : (
                          <img
                            src={ExportedImages.SPINNER_ICON}
                            alt="rotating-arrow"
                            className="controllerdetailpinner"
                            onClick={() => {
                              loadingspinner(
                                controllerdata?.access_type,
                                type.requesttypeFive,
                                controllerdata.controller_id
                              );
                              setdeviceid(controllerdata.controller_id);
                              // setindex(index)
                            }}
                          />
                        )
                      ) : null}
                      {controllerdata?.controller_code ? (
                        controllerdata?.tower ? (
                          <>
                            <img
                              src={
                                controllerdata?.tower >= 20 &&
                                controllerdata?.tower <= 39
                                  ? ExportedImages.TOWER_ICON1
                                  : controllerdata?.tower >= 40 &&
                                    controllerdata?.tower <= 59
                                  ? ExportedImages.TOWER_ICON2
                                  : controllerdata?.tower >= 60 &&
                                    controllerdata?.tower <= 79
                                  ? ExportedImages.TOWER_ICON3
                                  : controllerdata?.tower >= 80 &&
                                    controllerdata?.tower <= 99
                                  ? ExportedImages.TOWER_ICON4
                                  : controllerdata?.tower === 100
                                  ? ExportedImages.TOWER_ICON5
                                  : ExportedImages.EMPTY_TOWER_ICON
                              }
                              alt="tower"
                              style={{ width: "30px" }}
                            />
                            <p className="controller_tower_percentage">
                              {controllerdata?.tower}%
                            </p>
                          </>
                        ) : (
                          <img
                            src={ExportedImages.EMPTY_TOWER_ICON}
                            alt="tower"
                            style={{ width: "30px" }}
                          />
                        )
                      ) : null}
                    </div>
                  ) : null}
                  <div className="motor-btn">
                    {controllerdata?.operated_by ? (
                      <button type="button" className="mobile">
                        {controllerdata?.operated_by}
                      </button>
                    ) : null}
                    {controllerdata?.controller_id === buttongreyid ? (
                      <Toggle
                        // id={index}
                        buttoncol={"grey"}
                        isChecked={
                          controllerdata?.controller_status === 1 ? true : false
                        }
                        handleChange={({ status }) => {
                          Changebutton(
                            controllerdata?.controller_id,
                            status,
                            controllerdata?.access_type,
                            buttontype?.contrbuttontype
                          );
                        }}
                      />
                    ) : controllerdata?.access_type === 0 ||
                      controllerdata?.access_type === 1 ||
                      controllerdata?.access_type === 2 ||
                      controllerdata?.access_type === 3 ||
                      controllerdata?.access_type === null ? (
                      controllerdata?.controller_code ? (
                        <Toggle
                          // id={index}

                          isChecked={
                            controllerdata.controller_status === 1
                              ? true
                              : false
                          }
                          handleChange={({ status }) => {
                            Changebutton(
                              controllerdata.controller_id,
                              status,
                              controllerdata?.access_type,
                              buttontype.contrbuttontype
                            );
                          }}
                        />
                      ) : null
                    ) : null}
                  </div>
                </div>

                {/* <div className="update-details"> */}
                {controllerdata?.controller_code ? (
                  <div className="date-update">
                    <div className="update-text">
                      <p className="tank-header">last update</p>

                      <p className="tank-date">
                        {controllerdata?.controller_datetime
                          ? controllerdata?.controller_datetime
                          : null}
                      </p>
                    </div>

                    {/* <img src={spine} alt="tower" className="tower" /> */}
                    {/* LOADING IMAGE */}

                    {/* END */}
                    <div>
                      <p className="tank-header">status update</p>
                      <p className="tank-date">
                        {controllerdata?.status_change_time
                          ? controllerdata?.status_change_time
                          : null}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* </div> */}
                {controllerdata?.controller_code ? (
                  <p className="line "></p>
                ) : null}
                {controllerdata?.controller_code ? (
                  <>
                    <div className="sub-details">
                      {controllerdata?.software_version != null ? (
                        parseInt(controllerdata?.software_version?.charAt(0)) ==
                          3 ||
                        parseInt(controllerdata?.software_version?.charAt(0)) ==
                          1 ? (
                          <div className="data-update">
                            {parseInt(
                              controllerdata?.software_version?.charAt(0)
                            ) == 1 ||
                            parseInt(
                              controllerdata?.software_version?.charAt(0)
                            ) == 3 ? (
                              <div className="motor-detail-sub-div bg-color-one">
                                <p className="volt-text-1">
                                  <span>R</span>
                                  {controllerdata?.r} V
                                </p>
                                <p className="volt-text-2">
                                  <span>A</span>
                                  {controllerdata?.rl1} A
                                </p>
                                <p className="tankpf">
                                  PF {controllerdata?.rpf1}
                                </p>
                              </div>
                            ) : null}
                            {parseInt(
                              controllerdata?.software_version?.charAt(0)
                            ) == 3 ? (
                              <>
                                <div className="motor-detail-sub-div bg-color-two">
                                  <p className="volt-text-1">
                                    <span>Y</span> {controllerdata?.y} V
                                  </p>
                                  <p className="volt-text-2">
                                    <span>A</span>
                                    {controllerdata?.yl2} A
                                  </p>
                                  <p className="tankpf">
                                    PF {controllerdata?.ypf2}
                                  </p>
                                </div>

                                <div className="motor-detail-sub-div bg-color-three">
                                  <p className="volt-text-1">
                                    <span>B</span> {controllerdata?.b} V
                                  </p>
                                  <p className="volt-text-2">
                                    <span>A</span>
                                    {controllerdata?.bl3} A
                                  </p>
                                  <p className="tankpf">
                                    PF {controllerdata?.bpf3}
                                  </p>
                                </div>
                              </>
                            ) : null}
                          </div>
                        ) : null
                      ) : null}

                      {/* {controllerdata?.software_version != null ? (
                      parseInt(controllerdata?.software_version?.charAt(0)) ==
                        3 ||
                      parseInt(controllerdata?.software_version?.charAt(0)) ==
                        1 ? (
                        <div className="data-update">
                          {parseInt(
                            controllerdata?.software_version?.charAt(0)
                          ) == 1 ||
                          parseInt(
                            controllerdata?.software_version?.charAt(0)
                          ) == 3 ? (
                            <div className="motor-detail-sub-div bg-color-one">
                              <p className="volt-text-1">
                                <span>R</span>
                                {controllerdata?.r} V
                              </p>
                              <p className="volt-text-2">
                                <span>A</span>
                                {controllerdata?.rl1} A
                              </p>
                              <p className="tankpf">
                                PF {controllerdata?.rpf1}
                              </p>
                            </div>
                          ) : null}
                          {parseInt(
                            controllerdata?.software_version?.charAt(0)
                          ) == 3 ? (
                            <>
                              <div className="motor-detail-sub-div bg-color-two">
                                <p className="volt-text-1">
                                  <span>Y</span> {controllerdata?.y} V
                                </p>
                                <p className="volt-text-2">
                                  <span>A</span>
                                  {controllerdata?.yl2} A
                                </p>
                                <p className="tankpf">
                                  PF {controllerdata?.ypf2}
                                </p>
                              </div>

                              <div className="motor-detail-sub-div bg-color-three">
                                <p className="volt-text-1">
                                  <span>B</span> {controllerdata?.b} V
                                </p>
                                <p className="volt-text-2">
                                  <span>A</span>
                                  {controllerdata?.bl3} A
                                </p>
                                <p className="tankpf">
                                  PF {controllerdata?.bpf3}
                                </p>
                              </div>
                            </>
                          ) : null}
                        </div>
                      ) : controllerdata?.r ||
                        controllerdata?.y ||
                        controllerdata?.b ? (
                        <div className="data-update">
                          {controllerdata?.r ? (
                            <div className="motor-detail-sub-div bg-color-one">
                              <p className="volt-text-1">
                                <span>R</span>
                                {controllerdata?.r} V
                              </p>
                              <p className="volt-text-2">
                                <span>A</span>
                                {controllerdata?.rl1} A
                              </p>
                              <p className="tankpf">
                                PF {controllerdata?.rpf1}
                              </p>
                            </div>
                          ) : null}
                          {controllerdata?.y ? (
                            <div className="motor-detail-sub-div bg-color-two">
                              <p className="volt-text-1">
                                <span>Y</span> {controllerdata?.y} V
                              </p>
                              <p className="volt-text-2">
                                <span>A</span>
                                {controllerdata?.yl2} A
                              </p>
                              <p className="tankpf">
                                PF {controllerdata?.ypf2}
                              </p>
                            </div>
                          ) : null}
                          {controllerdata?.b ? (
                            <div className="motor-detail-sub-div bg-color-three">
                              <p className="volt-text-1">
                                <span>B</span> {controllerdata?.b} V
                              </p>
                              <p className="volt-text-2">
                                <span>A</span>
                                {controllerdata?.bl3} A
                              </p>
                              <p className="tankpf">
                                PF {controllerdata?.bpf3}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null
                    ) : controllerdata?.r ||
                      controllerdata?.y ||
                      controllerdata?.b ? (
                      <div className="data-update">
                        {controllerdata?.r ? (
                          <div className="motor-detail-sub-div bg-color-one">
                            <p className="volt-text-1">
                              <span>R</span>
                              {controllerdata?.r} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {controllerdata?.rl1} A
                            </p>
                            <p className="tankpf">PF {controllerdata?.rpf1}</p>
                          </div>
                        ) : null}
                        {controllerdata?.y ? (
                          <div className="motor-detail-sub-div bg-color-two">
                            <p className="volt-text-1">
                              <span>Y</span> {controllerdata?.y} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {controllerdata?.yl2} A
                            </p>
                            <p className="tankpf">PF {controllerdata?.ypf2}</p>
                          </div>
                        ) : null}
                        {controllerdata?.b ? (
                          <div className="motor-detail-sub-div bg-color-three">
                            <p className="volt-text-1">
                              <span>B</span> {controllerdata?.b} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {controllerdata?.bl3} A
                            </p>
                            <p className="tankpf">PF {controllerdata?.bpf3}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null} */}
                      <div className="detailsflex">
                        <p>
                          <span className="tank-header">ID - </span>
                          <span className="tank-date">
                            {controllerdata?.controller_code}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">Access Type - </span>
                          <span className="tank-date">
                            {controllerdata?.access_type === 0
                              ? "Admin"
                              : controllerdata?.access_type === 1
                              ? "Controll"
                              : controllerdata?.access_type === 2
                              ? "Operator"
                              : controllerdata?.access_type === 3
                              ? "View Only"
                              : null}
                          </span>
                        </p>
                        <p>
                          <span
                            className={
                              editstate ? "tank-header" : "notification"
                            }
                            onClick={() => toshow()}
                          >
                            Group -
                          </span>
                          {controllerdata?.group?.map((ele, ind) => {
                            return (
                              <span className="tank-date" key={ind}>
                                {ele.group_name}
                              </span>
                            );
                          })}
                        </p>
                        <p>
                          <span className="tank-header">Mode - </span>
                          <span className="tank-date">
                            {controllerdata?.controller_mode === 0
                              ? "Manual"
                              : controllerdata?.controller_mode === 1
                              ? "AST"
                              : controllerdata?.controller_mode === 2
                              ? "RTC"
                              : null}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">Burning hours - </span>
                          <span className="tank-date">
                            {controllerdata?.burning_hrs}
                          </span>
                        </p>
                      </div>
                      <div className="detailsflex">
                        <p>
                          <span className="tank-header">Connected Load - </span>
                          <span className="tank-date">
                            {controllerdata?.tot_watt !== null &&
                            controllerdata?.tot_watt !== undefined
                              ? `${controllerdata?.tot_watt}w`
                              : null}
                          </span>
                        </p>

                        <p>
                          <span className="tank-header">Live Load - </span>
                          <span className="tank-date">
                            {controllerdata?.kilo_watt}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">
                            Hardware Version -
                          </span>
                          <span className="tank-date">
                            {
                              controllerdata?.controller_setting
                                ?.hardware_version
                            }
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">
                            Software Version -{" "}
                          </span>
                          <span className="tank-date">
                            {
                              controllerdata?.controller_setting
                                ?.software_version
                            }
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">Frequency - </span>
                          <span className="tank-date">
                            {controllerdata?.frequency}
                          </span>
                        </p>
                      </div>
                      <div className="detailsflex">
                        <p>
                          <span className="tank-header">Power Usage - </span>
                          <span className="tank-date">
                            {controllerdata?.kilo_watt_hr}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">Total hours - </span>
                          <span className="tank-date">
                            {controllerdata?.total_hrs
                              ? controllerdata?.total_hrs?.split(":")[0]
                              : ""}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">Light-</span>
                          <span className="tank-date">
                            {controllerdata?.count}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">Watt-</span>
                          <span className="tank-date">
                            {controllerdata?.light_watt}
                          </span>
                        </p>
                      </div>
                      <div className="detailsflex">
                        <p>
                          <span className="tank-header">KVAR - </span>
                          <span className="tank-date">
                            {controllerdata?.kvar}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">CAP - </span>
                          <span className="tank-date">
                            {controllerdata?.cap}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">Lora - </span>
                          {lorastate ? (
                            <MdOutlineCheckBox
                              className="loracolor"
                              onClick={() => {
                                setlora(!editstate ? !lorastate : lorastate);
                              }}
                            />
                          ) : (
                            <MdOutlineCheckBoxOutlineBlank
                              className="loraempty"
                              onClick={() => {
                                setlora(!editstate ? !lorastate : lorastate);
                              }}
                            />
                          )}
                        </p>
                        {lorastate ? (
                          <p>
                            <span className={"tank-header"}>Topic - </span>
                            {editstate ? (
                              <span className="tank-date">
                                {controllerdata?.topic}
                              </span>
                            ) : (
                              <input
                                type="text"
                                className="notification filedPickBackground"
                                onChange={(e) => settopic(e.target.value)}
                                defaultValue={controllerdata?.topic}
                              />
                            )}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <br />
                    <div className="alertflex">
                      <p className="alerts">
                        {controllerdata?.theft ? (
                          <span className="alerspan">
                            <GoAlert />
                            theft Alert
                          </span>
                        ) : null}
                        {controllerdata?.door_open ? (
                          <span className="alerspan">
                            <GoAlert />
                            Door Open Alert
                          </span>
                        ) : null}
                      </p>

                      {controllerdata?.notification_alert === 1 ? (
                        controllerdata?.notification === 1 ||
                        controllerdata?.power_off === 1 ||
                        controllerdata?.hv_alert === 1 ||
                        controllerdata?.lv_alert === 1 ||
                        controllerdata?.ol_alert === 1 ||
                        controllerdata?.pf_alert === 1 ||
                        controllerdata?.manual === 1 ? (
                          <p>
                            {controllerdata?.notification === 1 ? (
                              <span id="blink">Notification</span>
                            ) : null}
                            {controllerdata?.notification !== 1 &&
                            (controllerdata?.power_off === 1 ||
                              controllerdata?.hv_alert === 1 ||
                              controllerdata?.lv_alert === 1 ||
                              controllerdata?.ol_alert === 1 ||
                              controllerdata?.pf_alert === 1 ||
                              controllerdata?.manual === 1) ? (
                              <span className="tank-header">Alert- </span>
                            ) : null}
                            {controllerdata?.power_off === 1 ? (
                              <span id="blink">Power Failure</span>
                            ) : controllerdata?.hv_alert === 1 ? (
                              <span id="blink">High Voltage</span>
                            ) : controllerdata?.lv_alert === 1 ? (
                              <span id="blink">Low Voltage</span>
                            ) : controllerdata?.ol_alert === 1 ? (
                              <span id="blink">Over Load</span>
                            ) : controllerdata?.pf_alert === 1 ? (
                              <span id="blink">Power Factor</span>
                            ) : controllerdata?.manual === 1 ? (
                              <span id="blink">Manual On/Off</span>
                            ) : null}
                          </p>
                        ) : null
                      ) : null}
                    </div>
                    <p className="line "></p>
                    <div className="sub-details">
                      <div className="service">
                        <p className="tank-usage">
                          <span className="tank-header">
                            Eb Service Number -
                          </span>
                          {editEb ? (
                            <input
                              type="text"
                              className="notification filedPickBackground"
                              onKeyPress={avoidletters}
                              defaultValue={ebdata?.ebval}
                              onChange={(e) =>
                                setebdata({ ...ebdata, ebval: e.target.value })
                              }
                            />
                          ) : (
                            <span className="tank-date">
                              {controllerdata?.eb_number}
                            </span>
                          )}
                        </p>
                        {controllerdata?.access_type === null ||
                        controllerdata?.access_type === 0 ||
                        controllerdata?.access_type === 1 ? (
                          <img
                            src={
                              editEb
                                ? ExportedImages.SAVE_ICON_BLUE
                                : ExportedImages.EDIT_ICON_BLUE
                            }
                            onClick={() => {
                              toeditEb();
                              setEb(!editEb);
                            }}
                            className="pointerCurser"
                          />
                        ) : null}
                      </div>
                      <div className="controllerfixed">
                        <div className="service">
                          <p className="tank-header">Location</p>
                          {locationtype == 1 ? (
                            <MdLocationOn className="locateapi" />
                          ) : (
                            <MdLocationOn
                              className="locate"
                              onClick={() => {
                                if (!(locationtype === 1)) {
                                  loadingspinner(
                                    controllerdata?.access_type,
                                    type.requesttypeThree,
                                    controllerdata.controller_id
                                  );
                                  setdeviceid("");
                                }
                              }}
                            />
                          )}
                        </div>
                        <span className="tank-usage">
                          <Checkbox
                            // disabled={editEb ? false : true}
                            checked={ebdata?.is_fixed === 1 ? true : false}
                            onClick={() => {
                              if (editEb) {
                                setebdata((pre) => ({
                                  ...pre,
                                  is_fixed: ebdata.is_fixed === 1 ? 0 : 1,
                                }));
                              }
                            }}
                          />
                          &nbsp;
                          <span className="tank-header">is Fixed</span>
                        </span>
                      </div>
                      <p className="tank-header">
                        &nbsp;&nbsp;
                        {editEb ? (
                          <>
                            Lat&nbsp;
                            <input
                              type="text"
                              className="location filedPickBackground"
                              onKeyPress={latlong}
                              defaultValue={ebdata?.lat}
                              onChange={(e) =>
                                setebdata({ ...ebdata, lat: e.target.value })
                              }
                            />
                            <span>{"'"}N</span>
                          </>
                        ) : controllerdata?.controller_setting?.latitude ? (
                          <span>
                            Lat-
                            {controllerdata?.controller_setting?.latitude !=
                              null ||
                            controllerdata?.controller_setting?.latitude != ""
                              ? controllerdata?.controller_setting?.latitude
                              : null}
                            {"'"}N
                          </span>
                        ) : null}
                        {editEb ? (
                          <>
                            &nbsp;&nbsp;Long&nbsp;
                            <input
                              type="text"
                              className="location filedPickBackground"
                              onKeyPress={latlong}
                              defaultValue={ebdata?.lan}
                              onChange={(e) =>
                                setebdata({ ...ebdata, lan: e.target.value })
                              }
                            />
                            <span>{"'"}E</span>
                          </>
                        ) : controllerdata?.controller_setting?.longitude ? (
                          <span>
                            &nbsp;&nbsp;Long-
                            {controllerdata?.controller_setting?.longitude !=
                              null ||
                            controllerdata?.controller_setting?.longitude != ""
                              ? controllerdata?.controller_setting?.longitude
                              : null}
                            {"'"}E
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sub-details">
                      <p>
                        <span className="tank-header">Access Type - </span>
                        <span className="tank-date">
                          {controllerdata?.access_type === 0
                            ? "Admin"
                            : controllerdata?.access_type === 1
                            ? "Control"
                            : controllerdata?.access_type === 2
                            ? "Operator"
                            : controllerdata?.access_type === 3
                            ? "view only"
                            : null}
                        </span>
                      </p>

                      {controllerdata?.notification_alert === 1 ? (
                        controllerdata?.notification === 1 ||
                        controllerdata?.power_off === 1 ||
                        controllerdata?.hv_alert === 1 ||
                        controllerdata?.lv_alert === 1 ||
                        controllerdata?.ol_alert === 1 ||
                        controllerdata?.pf_alert === 1 ||
                        controllerdata?.manual === 1 ? (
                          <p>
                            {controllerdata?.notification === 1 ? (
                              <span id="blink">Notification</span>
                            ) : null}
                            {controllerdata?.notification !== 1 &&
                            (controllerdata?.power_off === 1 ||
                              controllerdata?.hv_alert === 1 ||
                              controllerdata?.lv_alert === 1 ||
                              controllerdata?.ol_alert === 1 ||
                              controllerdata?.pf_alert === 1 ||
                              controllerdata?.manual === 1) ? (
                              <span className="tank-header">Alert- </span>
                            ) : null}
                            {controllerdata?.power_off === 1 ? (
                              <span id="blink">Power Failure</span>
                            ) : controllerdata?.hv_alert === 1 ? (
                              <span id="blink">High Voltage</span>
                            ) : controllerdata?.lv_alert === 1 ? (
                              <span id="blink">Low Voltage</span>
                            ) : controllerdata?.ol_alert === 1 ? (
                              <span id="blink">Over Load</span>
                            ) : controllerdata?.pf_alert === 1 ? (
                              <span id="blink">Power Factor</span>
                            ) : controllerdata?.manual === 1 ? (
                              <span id="blink">Manual On/Off</span>
                            ) : null}
                          </p>
                        ) : null
                      ) : null}
                    </div>

                    <p>
                      <span className="tank-header">Group - </span>
                      {controllerdata?.group?.map((ele, ind) => {
                        return (
                          <span className="tank-date" key={ind}>
                            {ele.group_name}
                          </span>
                        );
                      })}
                    </p>
                  </>
                )}
              </div>
              {(usertype === 3 || usertype === 2) && (
                <BlurComponent
                  blurData={{
                    name: controllerdata?.controller_name || "",
                    show: controllerdata?.amc_status < 1 ? true : false,
                    id: controllerdata?.controller_code || "",
                    amc_msg: controllerdata?.amc_msg || "",
                  }}
                />
              )}
            </div>
          </div>
          <h3 className={devicestyle.page_head}>Device Details</h3>
          {controllerdata?.light_data?.length > 0 ? (
            <div className={devicestyle.total_device}>
              {controllerdata?.light_data?.map((light, index) => {
                return (
                  <div
                    className={light.amc_status < 1 ? "BlurViewContainer" : ""}
                  >
                    <div
                      className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                    ${commonstyle.cards_padding}  new-details tank-bgcolor ${devicestyle.margin_zero}`}
                      key={index}
                    >
                      {/* <div className="light-data  tank-bgcolor"> */}
                      <div className="setting-top-bar">
                        <div className="setting-sub-bar">
                          {editlightdevice && index === deviceindex ? (
                            <input
                              type="text"
                              className={`${devicestyle.device_name_input} filedPickBackground`}
                              onChange={(e) =>
                                setlightdata({
                                  ...lightdata,
                                  devicename: e.target.value,
                                })
                              }
                              defaultValue={light.device_name}
                            />
                          ) : (
                            <OverlayTrigger
                              key="top"
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top">
                                  <strong>{light.device_name}</strong>
                                </Tooltip>
                              }
                            >
                              <p
                                className={`${devicestyle.device_name} ${devicestyle.device_name_light_col}`}
                              >
                                {light.device_name}
                              </p>
                            </OverlayTrigger>
                          )}

                          {light?.tower ? (
                            <>
                              <img
                                src={
                                  light?.tower >= 20 && light?.tower <= 39
                                    ? ExportedImages.TOWER_ICON1
                                    : light?.tower >= 40 && light?.tower <= 59
                                    ? ExportedImages.TOWER_ICON2
                                    : light?.tower >= 60 && light?.tower <= 79
                                    ? ExportedImages.TOWER_ICON3
                                    : light?.tower >= 80 && light?.tower <= 99
                                    ? ExportedImages.TOWER_ICON4
                                    : light?.tower === 100
                                    ? ExportedImages.TOWER_ICON5
                                    : ExportedImages.EMPTY_TOWER_ICON
                                }
                                alt="tower"
                                style={{ width: "30px" }}
                                className="lightTower"
                              />
                              <span
                                className={
                                  devicestyle.devicetowerpercentagelight
                                }
                              >
                                {light?.tower}%
                              </span>
                            </>
                          ) : (
                            <img
                              src={ExportedImages.EMPTY_TOWER_ICON}
                              alt="tower"
                              style={{ width: "30px" }}
                            />
                          )}
                        </div>

                        <div className={devicestyle.light_device_edit_off}>
                          {light?.device_id === buttongreyid ? (
                            <Toggle
                              // id={index}
                              buttoncol={"grey"}
                              isChecked={
                                light?.light_status == 1 ? true : false
                              }
                              handleChange={({ status }) => {
                                Changebutton(
                                  light?.device_id,
                                  status,
                                  controllerdata.access_type,
                                  buttontype.devicebuttontype
                                );
                              }}
                            />
                          ) : controllerdata?.access_type === 0 ||
                            controllerdata?.access_type === 1 ||
                            controllerdata?.access_type === 2 ||
                            controllerdata?.access_type === 3 ||
                            controllerdata?.access_type === null ? (
                            light?.device_code ? (
                              <Toggle
                                // id={index}
                                isChecked={
                                  light?.light_status == 1 ? true : false
                                }
                                handleChange={({ status }) => {
                                  Changebutton(
                                    light?.device_id,
                                    status,
                                    controllerdata.access_type,
                                    buttontype.devicebuttontype
                                  );
                                }}
                              />
                            ) : null
                          ) : null}

                          <div className={devicestyle.edit_date}>
                            {tank?.device_time ? (
                              <p className="tank-date">{tank?.device_time}</p>
                            ) : null}
                            {controllerdata?.access_type === 0 ||
                            controllerdata?.access_type === 1 ||
                            controllerdata?.access_type === null ? (
                              <img
                                src={
                                  editlightdevice && deviceindex === index
                                    ? ExportedImages.SAVE_ICON_BLUE
                                    : !editlightdevice
                                    ? ExportedImages.EDIT_ICON_BLUE
                                    : null
                                }
                                className="pointerCurser"
                                onClick={() => {
                                  seteditlightdevice(!editlightdevice);
                                  setdeviceindex(index);
                                  EditLightdevice(light.device_id);
                                  setlightdata(
                                    !editlightdevice
                                      ? {
                                          devicename: light.device_name,
                                          dim: light.dim_level,
                                          ontime: light.on_time,
                                          offtime: light.off_time,
                                          latitude: light.latitude,
                                          longitude: light.longitude,
                                          is_fixed: light?.is_fixed,
                                        }
                                      : null
                                  );
                                }}
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="setting-top-bar setting-height">
                        <p className="tank-usage d-grid pb-2">
                          <span className="tank-header">Last Update - </span>
                          <span className="tank-date">
                            {light?.device_time !== null &&
                            light?.device_time.includes("T")
                              ? moment(light?.device_time).format(
                                  "DD-MM-YYYY HH:mm:ss"
                                )
                              : light?.device_time}
                          </span>
                        </p>
                        <p>
                          {/* LOADING IMAGE */}
                          {isloading && deviceid === light.device_id ? (
                            <img
                              src={ExportedImages.GREEN_SPINNER_GIF}
                              alt="tower"
                              className="tanpkinner light_spinner"
                              style={{ height: "23px" }}
                            />
                          ) : (
                            <img
                              src={ExportedImages.SPINNER_ICON}
                              alt="rotating-arrow"
                              className="tanpkinner light_spinner"
                              onClick={() => {
                                loadingspinner(
                                  controllerdata?.access_type,
                                  type.requesttypeSix,
                                  light.device_id
                                );
                                setdeviceid(light.device_id);
                                // setdeviceindex(index);
                              }}
                            />
                          )}
                          {/* END */}
                          <p className="tank-usage d-grid">
                            <span className="tank-header">Status Update -</span>
                            <span className="tank-date">
                              {light?.on_off_time !== null
                                ? light?.on_off_time.includes("T")
                                  ? moment(light?.on_off_time).format(
                                      "DD-MM-YYYY HH:mm:ss"
                                    )
                                  : light?.on_off_time
                                : null}
                            </span>
                          </p>
                        </p>
                      </div>
                      <div className="setting-top-bar">
                        <p className="tank-usage mb-0">
                          <span className="tank-header">ID - </span>
                          <span className="tank-date">
                            {light?.device_code}
                          </span>
                        </p>
                        <p className="tank-usage">
                          <span className="tank-header">volts - </span>
                          <span className="tank-date">
                            <span>{light?.volts}</span>
                          </span>
                        </p>
                      </div>
                      <div className="setting-top-bar">
                        <p className="tank-usage">
                          <span className="tank-header">Dim - </span>
                          {editlightdevice && index === deviceindex ? (
                            <input
                              type="text"
                              disabled={
                                !editlightdevice
                                  ? true
                                  : editlightdevice && index === deviceindex
                                  ? false
                                  : true
                              }
                              className={
                                editlightdevice && index === deviceindex
                                  ? "location filedPickBackground"
                                  : "devicebg"
                              }
                              onChange={(e) =>
                                setlightdata({
                                  ...lightdata,
                                  dim: e.target.value,
                                })
                              }
                              defaultValue={light.dim_level}
                            />
                          ) : (
                            <span className="tank-date">
                              {light.dim_level}%
                            </span>
                          )}
                        </p>
                        <p className="tank-usage">
                          <span className="tank-header">Amps - </span>
                          <span className="tank-date">{light?.amps}</span>
                        </p>
                      </div>
                      <div className="setting-top-bar">
                        <p className="tank-usage">
                          <span className="tank-header">burning hour - </span>
                          <span className="tank-date">
                            <span>{light?.burning_hrs}</span>
                          </span>
                        </p>
                        <p className="tank-usage">
                          <span className="tank-header">PF - </span>
                          <span className="tank-date">
                            <span>{light?.pf}</span>
                          </span>
                        </p>
                      </div>
                      <div className="setting-top-bar">
                        <p className="tank-usage mb-0">
                          <span className="tank-header">Location </span>
                          &nbsp;
                          {locationtype === light.device_id ? (
                            <MdLocationOn
                              className={
                                controllerdata?.access_type === 3
                                  ? "locate"
                                  : "locateapi"
                              }
                            />
                          ) : (
                            <MdLocationOn
                              className="locate"
                              onClick={() => {
                                if (!(locationtype === light.device_id)) {
                                  setlocation(light.device_id);
                                  loadingspinner(
                                    controllerdata?.access_type,
                                    type.requesttypeOne,
                                    light.device_id
                                  );
                                  setdeviceid("");
                                }
                              }}
                            />
                          )}
                          &nbsp;
                        </p>
                        <p className="tank-usage">
                          <span className="tank-header">on time - </span>
                          <span className="tank-date">
                            {editlightdevice && index === deviceindex ? (
                              <CommonClockTimePicker
                                className={
                                  editlightdevice && index === deviceindex
                                    ? "light_device_ontime"
                                    : "devicebg devicebgwidth"
                                }
                                defaultValue={
                                  light?.on_time != null
                                    ? dayjs("2220-08-05 " + light?.on_time)
                                    : ""
                                }
                                value={
                                  lightdata?.ontime != null
                                    ? dayjs("2220-08-05 " + lightdata?.ontime)
                                    : ""
                                }
                                // allowEmpty
                                // showSecond={false}
                                format="HH:mm:00"
                                onChange={(e) => {
                                  setlightdata({
                                    ...lightdata,
                                    ontime: dayjs(e).format("HH:mm:ss"),
                                  });
                                }}
                                isTimeSetting
                                istestFieldStyle
                                inputBoxStyles={{
                                  height: "30px",
                                  width: "90px",
                                  fontSize: "small",
                                  color: "black",
                                  fontFamily: "Nunito-bold-700",
                                  cursor: "pointer",
                                }}
                                disabled={
                                  !editlightdevice
                                    ? true
                                    : editlightdevice && index === deviceindex
                                    ? false
                                    : true
                                }
                                onKeyPress={latlong}
                              />
                            ) : (
                              // <TimePicker
                              //   className={
                              //     editlightdevice && index === deviceindex
                              //       ? "light_device_ontime"
                              //       : "devicebg devicebgwidth"
                              //   }
                              //   defaultValue={
                              //     light?.on_time != null
                              //       ? moment("2220-08-05 " + light?.on_time)
                              //       : ""
                              //   }
                              //   allowEmpty
                              //   showSecond={false}
                              //   format="HH:mm:00"
                              //   onChange={(e) => {
                              //     setlightdata({
                              //       ...lightdata,
                              //       ontime: moment(e).format("HH:mm:ss"),
                              //     });
                              //   }}
                              //   disabled={
                              //     !editlightdevice
                              //       ? true
                              //       : editlightdevice && index === deviceindex
                              //       ? false
                              //       : true
                              //   }
                              //   onKeyPress={latlong}
                              // />
                              <span>{light?.on_time}</span>
                            )}
                            {/* <input
                        type="text"
                        disabled={
                          !editlightdevice
                            ? true
                            : editlightdevice && index === deviceindex
                            ? false
                            : true
                        }
                        className={
                          editlightdevice && index === deviceindex
                            ? "location"
                            : "devicebg devicebgwidth"
                        }
                        onChange={(e) =>
                          setlightdata({
                            ...lightdata,
                            ontime: e.target.value,
                          })
                        }
                        defaultValue={light?.on_time}
                      /> */}
                          </span>
                        </p>
                      </div>
                      <div className="setting-top-bar">
                        <p className="tank-usage">
                          <Checkbox
                            // disabled={
                            //   editlightdevice && index === deviceindex
                            //     ? false
                            //     : true
                            // }
                            checked={
                              editlightdevice && index === deviceindex
                                ? lightdata?.is_fixed
                                : light?.is_fixed
                            }
                            onClick={() => {
                              if (editlightdevice && index === deviceindex) {
                                setlightdata((pre) => ({
                                  ...pre,
                                  is_fixed: lightdata?.is_fixed === 1 ? 0 : 1,
                                }));
                              }
                            }}
                          />
                          &nbsp;
                          <span className="tank-header">is Fixed</span>
                        </p>
                        <p className="tank-usage">
                          <span className="tank-header">off time - </span>
                          <span className="tank-date">
                            {editlightdevice && index === deviceindex ? (
                              <CommonClockTimePicker
                                // className={
                                //   editlightdevice && index === deviceindex
                                //     ? "light_device_ontime"
                                //     : "devicebg devicebgwidth"
                                // }
                                defaultValue={
                                  light?.off_time != null
                                    ? dayjs("2220-08-05 " + light?.off_time)
                                    : ""
                                }
                                value={
                                  lightdata?.offtime != null
                                    ? dayjs("2220-08-05 " + lightdata?.offtime)
                                    : ""
                                }
                                // allowEmpty
                                // showSecond={false}
                                format="HH:mm:00"
                                onChange={(e) => {
                                  setlightdata({
                                    ...lightdata,
                                    offtime: dayjs(e).format("HH:mm:ss"),
                                  });
                                }}
                                isTimeSetting
                                istestFieldStyle
                                inputBoxStyles={{
                                  height: "30px",
                                  width: "90px",
                                  fontSize: "small",
                                  color: "black",
                                  fontFamily: "Nunito-bold-700",
                                  cursor: "pointer",
                                }}
                                disabled={
                                  !editlightdevice
                                    ? true
                                    : editlightdevice && index === deviceindex
                                    ? false
                                    : true
                                }
                              />
                            ) : (
                              // <TimePicker
                              //   className={
                              //     editlightdevice && index === deviceindex
                              //       ? "light_device_ontime"
                              //       : "devicebg devicebgwidth"
                              //   }
                              //   defaultValue={
                              //     light?.off_time != null
                              //       ? moment("2220-08-05 " + light?.off_time)
                              //       : ""
                              //   }
                              //   allowEmpty
                              //   showSecond={false}
                              //   format="HH:mm:00"
                              //   onChange={(e) => {
                              //     setlightdata({
                              //       ...lightdata,
                              //       offtime: moment(e).format("HH:mm:ss"),
                              //     });
                              //   }}
                              //   disabled={
                              //     !editlightdevice
                              //       ? true
                              //       : editlightdevice && index === deviceindex
                              //       ? false
                              //       : true
                              //   }
                              // />
                              <span>{light?.off_time}</span>
                            )}
                            {/* <input
                          type="text"
                          disabled={
                            !editlightdevice
                              ? true
                              : editlightdevice && index === deviceindex
                              ? false
                              : true
                          }
                          className={
                            editlightdevice && index === deviceindex
                              ? "location"
                              : "devicebg devicebgwidth"
                          }
                          onChange={(e) =>
                            setlightdata({
                              ...lightdata,
                              offtime: e.target.value,
                            })
                          }
                          defaultValue={light?.off_time}
                        /> */}
                          </span>
                        </p>
                      </div>
                      <div className="setting-top-bar">
                        {/* <p className="tank-usage"> */}
                        <p>
                          <span className="tank-header"></span>
                          {editlightdevice && index === deviceindex ? (
                            <span>
                              Lat&nbsp;
                              <input
                                type="text"
                                disabled={
                                  !editlightdevice
                                    ? true
                                    : editlightdevice && index === deviceindex
                                    ? false
                                    : true
                                }
                                className={
                                  editlightdevice && index === deviceindex
                                    ? "location filedPickBackground"
                                    : "non-edit"
                                }
                                onChange={(e) =>
                                  setlightdata({
                                    ...lightdata,
                                    latitude: e.target.value,
                                  })
                                }
                                defaultValue={light?.latitude}
                              />
                              {"'"}N
                            </span>
                          ) : (
                            <p className="tank-header">
                              Lat-
                              <span className="tank-date">
                                {light.latitude != null || light.latitude != ""
                                  ? light?.latitude
                                  : null}
                                'N
                              </span>
                              {/* {light.latitude === "" && light.longitude === ""
                              ? null
                              : `${light.latitude}‘N,${light.longitude}’E`} */}
                            </p>
                          )}
                        </p>

                        {/* </p> */}
                      </div>
                      <div className="setting-top-bar">
                        {editlightdevice && index === deviceindex ? (
                          <>
                            <span>
                              Long&nbsp;
                              <input
                                type="text"
                                disabled={
                                  !editlightdevice
                                    ? true
                                    : editlightdevice && index === deviceindex
                                    ? false
                                    : true
                                }
                                className={
                                  editlightdevice && index === deviceindex
                                    ? "location filedPickBackground"
                                    : "non-edit"
                                }
                                onChange={(e) =>
                                  setlightdata({
                                    ...lightdata,
                                    longitude: e.target.value,
                                  })
                                }
                                defaultValue={light?.longitude}
                                onKeyPress={latlong}
                              />
                              {"'"}E
                            </span>
                          </>
                        ) : (
                          <p className="tank-header">
                            &nbsp;Long-
                            <span className="tank-date">
                              {light.longitude != null || light.longitude != ""
                                ? light?.longitude
                                : null}
                              'E
                            </span>
                          </p>
                        )}
                        <button
                          type="button"
                          className="settings-btn"
                          onClick={() => {
                            loadingspinner(
                              controllerdata?.access_type,
                              type.requesttypeTwo,
                              light.device_id
                            );
                            setdeviceid(light.device_id);
                            // setsettingloading(true);
                          }}
                        >
                          {settingloading && light.device_id === deviceid ? (
                            <img
                              src={ExportedImages.WHITE_SPINNER_GIF}
                              className="settingspinner"
                            />
                          ) : (
                            <ImSpinner11 />
                          )}
                          &nbsp;&nbsp;&nbsp;Settings
                        </button>
                      </div>
                      {/* </div> */}
                    </div>
                    {(usertype === 3 || usertype === 2) && (
                      <BlurComponent
                        blurData={{
                          name: light?.device_name || "",
                          show: light?.amc_status < 1 ? true : false,
                          id: light?.device_code || "",
                          amc_msg: light?.amc_msg || "",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="device_no_data_found">no data found</p>
          )}
          <h3 className={`${devicestyle.page_head} light_head`}>Lights</h3>
          <div className="device-details-view-light new-details light-bgcolor">
            <div
              className={
                controllerdata?.light?.length > 0
                  ? "total_light"
                  : "total_light_right"
              }
            >
              {controllerdata?.light?.length > 0 ? (
                <div className="sub-details BothMargin">
                  <p className="tank-usage">
                    <span className="tank-header">Total Lights - </span>
                    <span className="tank-date">
                      {controllerdata?.tot_light}
                    </span>
                  </p>
                </div>
              ) : null}
              <div className="d_flex new-btn">
                {editlightdata ? (
                  <button onClick={() => setaddmodal(true)}>Add</button>
                ) : null}
                {controllerdata?.access_type === 0 ||
                controllerdata?.access_type === 1 ||
                controllerdata?.access_type === null ? (
                  <img
                    src={
                      editlightdata
                        ? ExportedImages.SAVE_ICON_BLUE
                        : ExportedImages.EDIT_ICON_BLUE
                    }
                    onClick={() => {
                      seteditlightdata(!editlightdata);
                      setTimeout(() => {
                        LightController();
                      }, 5000);
                    }}
                    className="pointerCurser"
                  />
                ) : null}
              </div>
            </div>

            {controllerdata?.light?.length > 0 ? (
              <div className="light-detail-flex">
                <Table className="light-table-back-col">
                  <thead>
                    <tr>
                      <th>S.no</th>
                      <th>Name</th>
                      <th>Watt</th>
                      <th>Count</th>
                      <th>Total</th>
                      {editlightdata ? <th>Actions</th> : null}
                    </tr>
                  </thead>
                  {controllerdata?.light?.map((light, index) => {
                    return (
                      <>
                        <tbody>
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <p className="tank-usage">
                                {light?.light_type === 1
                                  ? "LED"
                                  : light?.light_type === 2
                                  ? "CFL"
                                  : light?.light_type === 3
                                  ? "Tube Light"
                                  : light?.light_type === 4
                                  ? "Mercury Light"
                                  : light?.light_type === 5
                                  ? light?.light_name
                                  : null}
                              </p>
                            </td>
                            <td>
                              <p className="tank-date">{light.watt}</p>
                            </td>
                            <td>
                              <p className="tank-date">{light?.count}</p>
                            </td>
                            <td>
                              <p className="tank-date">{light?.total}</p>
                            </td>
                            {editlightdata ? (
                              <td>
                                <div>
                                  <img
                                    src={ExportedImages.EDIT_ICON_BLUE}
                                    onClick={() =>
                                      setshowmodal({
                                        show: true,
                                        data: light,
                                      })
                                    }
                                  />
                                  &nbsp;&nbsp;
                                  <FaTrashAlt
                                    className="required"
                                    onClick={() => {
                                      setLightDelete({
                                        lightID: light.light_id,
                                        watt: light.watt,
                                        count: light.count,
                                        show: true,
                                      });
                                    }}
                                  />
                                </div>
                              </td>
                            ) : null}
                          </tr>
                        </tbody>
                      </>
                    );
                  })}
                </Table>
              </div>
            ) : (
              <p className="device_no_data_found">no data found</p>
            )}
          </div>
          <Tabs
            defaultActiveKey={1}
            id="fill-tab-example"
            className="mb-3 mt-5 menu_tab"
            fill
            onSelect={(e) => {
              // handleSelect(e);

              seteventkey(e);
            }}
          >
            <Tab eventKey={1} title="All Details">
              {modalshow ? (
                <AllDetailsAddModal
                  show={modalshow}
                  close={() => setaddallmodal(false)}
                  controllerId={location?.state?.id}
                  handleGetServiceDetails={handleGetServiceDetails}
                />
              ) : null}

              {lgShow.show ? (
                <AllDetailsEditModal
                  show={lgShow.show}
                  close={() =>
                    setLgShow((prev) => {
                      return {
                        ...prev,
                        show: false,
                      };
                    })
                  }
                  editData={lgShow.data}
                  handleGetServiceDetails={handleGetServiceDetails}
                />
              ) : null}

              {deletemodal.show ? (
                <DeleteConfirmationModal
                  show={deletemodal}
                  close={() =>
                    setdeletemodal((prev) => {
                      return {
                        ...prev,
                        show: false,
                      };
                    })
                  }
                  ServiceId={deletemodal.serviceid}
                  handleGetServiceDetails={handleGetServiceDetails}
                  Deletekey={1}
                />
              ) : null}
              <Loader isLoader={loader} />

              <div
                className="all-details-container-flex"
                style={{ marginTop: "0px" }}
              >
                <h4 className={devicestyle.page_head}>History Details</h4>
                {controllerdata?.controller_code ? (
                  <div
                    className={`${devicestyle.all_details_div_bg} ${commonstyle.cards_border_radius}`}
                  >
                    <div className="all-details-head-div">
                      {controllerdata?.controller_code ? (
                        <>
                          <p
                            className="controller controller-style"
                            style={{ color: "#1F78A4" }}
                          >
                            controller
                          </p>
                        </>
                      ) : null}
                    </div>
                    <Controllerhistorydetails
                      historyview={{ controller: true }}
                      avoidletters={avoidletters}
                      location={location}
                      controllerdata={controllerdata}
                    />
                  </div>
                ) : (
                  <p className="device_no_data_found mb-3">no data found</p>
                )}

                <h4 className={devicestyle.page_head}>
                  User Details({listuser?.length})
                </h4>
                {/* {listuser?.length > 0 ? ( */}
                <div
                  className={`${devicestyle.all_details_div_bg} ${commonstyle.cards_border_radius}`}
                >
                  <div className="userflex table-responsive">
                    <Items currentItems={currentItems} />
                    {totaldatacount > 12 ? (
                      <div className="col-12 float-start d-flex justify-content-center">
                        <ReactPaginate
                          breakLabel="..."
                          nextLabel={<FaAngleDoubleRight />}
                          onPageChange={handlePageClick}
                          pageRangeDisplayed={5}
                          pageCount={pageCount}
                          previousLabel={<FaAngleDoubleLeft />}
                          renderOnZeroPageCount={null}
                          containerClassName={"container-class"}
                          pageLinkClassName={"page-link"}
                          pageClassName={"page-item"}
                          previousClassName={"next-page-item"}
                          previousLinkClassName={"pre-link-item"}
                          nextClassName={"next-page-item"}
                          nextLinkClassName={"pre-link-item"}
                          activeClassName={"active-page"}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
                {/* // ) : (
                  //   <p className="servicenodatafound">no data found</p>
                  // )} */}
              </div>
              <div>
                <div>
                  <h4 className={devicestyle.page_head}>
                    Service Details ({servicedetail?.total})
                  </h4>
                  {/* <button
                      className="addButton"
                      onClick={() => {
                        setaddallmodal(true);
                      }}
                    >
                      add service
                    </button> */}
                </div>

                <ServiceItems CurrentServiceData={currenServiceItems} />
                {servicedetail?.total > 12 ? (
                  <div className="col-12 float-start d-flex justify-content-center controller-bottom">
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel={<FaAngleDoubleRight />}
                      onPageChange={handlePageClickEvent}
                      pageRangeDisplayed={5}
                      pageCount={ServicePageCount}
                      previousLabel={<FaAngleDoubleLeft />}
                      renderOnZeroPageCount={null}
                      containerClassName={"container-class"}
                      pageLinkClassName={"page-link"}
                      pageClassName={"page-item"}
                      previousClassName={"next-page-item"}
                      previousLinkClassName={"pre-link-item"}
                      nextClassName={"next-page-item"}
                      nextLinkClassName={"pre-link-item"}
                      activeClassName={"active-page"}
                    />
                  </div>
                ) : null}
              </div>
            </Tab>
            <Tab
              eventKey={2}
              title="Settings"
              disabled={
                (usertype === 2 || usertype === 3) &&
                controllerdata?.controller_code &&
                !controllerdata.amc_status
              }
            >
              <>
                {controllerdata?.controller_code !== null &&
                controllerdata?.controller_code !== "" ? (
                  <h4 className={devicestyle.page_head}>Settings</h4>
                ) : (
                  <p className="chartnodata">no data found</p>
                )}

                {controllerdata?.controller_code !== null &&
                controllerdata?.controller_code !== "" ? (
                  <>
                    <div
                      style={{ marginBottom: 15 }}
                      className="light-settings-view light_setting_div"
                    >
                      <div className="setting-top-bar">
                        <div className="setting-sub-bar new-setting-sub">
                          {/* <button className="motorhead">More Settings</button> */}
                          <div className="sub-date-bar">
                            <p className="tank-header">Received At:</p>
                            <p className="tank-date">
                              {controllerdata?.controller_setting?.created_at
                                ? moment(
                                    controllerdata?.controller_setting
                                      ?.created_at
                                  ).format("DD-MM-YYYY HH:mm:ss")
                                : null}
                              {/* {controllerdata?.controller_setting?.created_at} */}
                            </p>
                          </div>
                          {/* LOADING IMAGE */}
                          {settingloadingTwo ? (
                            <img
                              src={ExportedImages.GREEN_SPINNER_GIF}
                              alt="tower"
                              className="devicespinner"
                              style={{ height: "23px" }}
                            />
                          ) : (
                            <img
                              src={ExportedImages.SPINNER_ICON}
                              alt="rotating-arrow"
                              className="devicespinner"
                              onClick={() => {
                                loadingspinner(
                                  controllerdata?.access_type,
                                  type?.requesttypeFour,
                                  controllerdata?.controller_id
                                );
                              }}
                            />
                          )}
                        </div>
                        {controllerdata?.access_type === 0 ||
                        controllerdata?.access_type === 1 ||
                        controllerdata?.access_type === null ? (
                          <img
                            src={
                              editstate1
                                ? ExportedImages.SAVE_ICON_BLUE
                                : ExportedImages.EDIT_ICON_BLUE
                            }
                            onClick={() => {
                              tolighttimeedit(
                                controllerdata?.controller_id,
                                controllerdata?.access_type
                              );
                              setedit1(!editstate1);
                            }}
                            className="pointerCurser"
                          />
                        ) : null}
                      </div>

                      <div className="setting-top-bar">
                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header">HV</p>
                          {editstate1 ? (
                            <input
                              type="text"
                              maxLength={3}
                              onKeyPress={avoidletters}
                              value={settings?.hv}
                              onChange={(e) =>
                                setsettings({
                                  ...settings,
                                  hv:
                                    parseInt(e.target.value) <= 999
                                      ? e.target.value
                                      : "",
                                })
                              }
                              className="more-setting-btn-edit filedPickBackground"
                            />
                          ) : (
                            <button type="button" className="more-setting-btn">
                              {settings?.hv}
                            </button>
                          )}
                        </div>
                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header">LV</p>
                          {editstate1 ? (
                            <input
                              type="text"
                              maxLength={3}
                              onKeyPress={avoidletters}
                              value={settings?.lv}
                              onChange={(e) =>
                                setsettings({
                                  ...settings,
                                  lv:
                                    parseInt(e.target.value) <= 999
                                      ? e.target.value
                                      : "",
                                })
                              }
                              className="more-setting-btn-edit filedPickBackground"
                            />
                          ) : (
                            <button type="button" className="more-setting-btn">
                              {settings?.lv}
                            </button>
                          )}
                        </div>
                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header">OL</p>
                          {editstate1 ? (
                            <input
                              type="text"
                              maxLength={2}
                              onKeyPress={avoidletters}
                              value={settings?.ol}
                              onChange={(e) => {
                                setsettings({
                                  ...settings,
                                  ol:
                                    parseInt(e.target.value) <= 60
                                      ? e.target.value
                                      : "",
                                });
                              }}
                              className="more-setting-btn-edit filedPickBackground"
                            />
                          ) : (
                            <button type="button" className="more-setting-btn">
                              {settings?.ol}
                            </button>
                          )}
                        </div>
                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header">PF</p>
                          {editstate1 ? (
                            <input
                              type="text"
                              maxLength={2}
                              onKeyPress={avoidletters}
                              value={settings?.pf}
                              onChange={(e) => {
                                setsettings({
                                  ...settings,
                                  pf:
                                    parseInt(e.target.value) <= 75
                                      ? e.target.value
                                      : "",
                                });
                              }}
                              className="more-setting-btn-edit filedPickBackground"
                            />
                          ) : (
                            <button type="button" className="more-setting-btn">
                              {settings?.pf}
                            </button>
                          )}
                        </div>
                      </div>
                      <button className="motorhead lighttimer">Timer </button>
                      <div className="setting-top-bar">
                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">Mode</p>
                          {editstate1 ? (
                            <select
                              type="text"
                              name="mode2"
                              onChange={(e) => {
                                setsettings({
                                  ...settings,
                                  mode1: e.target.value + ":00",
                                });
                              }}
                              className="more-setting-btn-edit filedPickBackground"
                            >
                              <option
                                selected={settings?.mode1 === "" ? true : false}
                                hidden
                              >
                                Mode
                              </option>
                              <option
                                value={0}
                                selected={settings?.mode1 === 0 ? true : false}
                              >
                                Manual
                              </option>
                              <option
                                value={1}
                                selected={settings?.mode1 === 1 ? true : false}
                              >
                                AST
                              </option>
                              <option
                                value={2}
                                selected={settings?.mode1 === 2 ? true : false}
                              >
                                RTC
                              </option>
                            </select>
                          ) : (
                            <button type="button" className="more-setting-btn">
                              {settings?.mode1 === 0
                                ? "Manual"
                                : settings?.mode1 === 1
                                ? "AST"
                                : settings?.mode1 === 2
                                ? "RTC"
                                : null}
                            </button>
                          )}
                        </div>

                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">
                            ON
                            {parseInt(settings?.mode1) === 2 ? "Time" : "After"}
                          </p>
                          {editstate1 ? (
                            <CommonClockTimePicker
                              className="more-setting-btn-edit"
                              defaultValue={
                                settings?.onofter1 != null
                                  ? dayjs("2220-08-05 " + settings?.onofter1)
                                  : ""
                              }
                              value={
                                settings?.onofter1 != null
                                  ? dayjs("2220-08-05 " + settings?.onofter1)
                                  : ""
                              }
                              allowEmpty
                              showSecond={false}
                              isTimeSetting
                              istestFieldStyle
                              format="HH:mm:00"
                              onChange={(value) => {
                                setsettings({
                                  ...settings,
                                  onofter1: dayjs(value).format("HH:mm:ss"),
                                });
                              }}
                            />
                          ) : (
                            // <TimePicker
                            //   className="more-setting-btn-edit"
                            //   defaultValue={
                            //     settings?.onofter1 != null
                            //       ? moment("2220-08-05 " + settings?.onofter1)
                            //       : ""
                            //   }
                            //   allowEmpty
                            //   showSecond={false}
                            //   format="HH:mm:00"
                            //   onChange={(value) => {
                            //     setsettings({
                            //       ...settings,
                            //       onofter1: moment(value).format("HH:mm:ss"),
                            //     });
                            //   }}
                            // />
                            <button type="button" className="more-setting-btn">
                              {settings?.onofter1}
                            </button>
                          )}
                        </div>

                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">
                            Intermediate Off
                          </p>
                          {editstate1 ? (
                            <CommonClockTimePicker
                              className="more-setting-btn-edit"
                              value={
                                settings?.imoff1 != null
                                  ? dayjs("2220-08-05 " + settings?.imoff1)
                                  : ""
                              }
                              allowEmpty
                              showSecond={false}
                              format="HH:mm:00"
                              isTimeSetting
                              istestFieldStyle
                              onChange={(value) => {
                                setsettings({
                                  ...settings,
                                  imoff1: dayjs(value).format("HH:mm:ss"),
                                });
                              }}
                            />
                          ) : (
                            // <TimePicker
                            //   className="more-setting-btn-edit"
                            //   defaultValue={
                            //     settings?.imoff1 != null
                            //       ? moment("2220-08-05 " + settings?.imoff1)
                            //       : ""
                            //   }
                            //   allowEmpty
                            //   showSecond={false}
                            //   format="HH:mm:00"
                            //   onChange={(value) => {
                            //     setsettings({
                            //       ...settings,
                            //       imoff1: moment(value).format("HH:mm:ss"),
                            //     });
                            //   }}
                            // />
                            <button type="button" className="more-setting-btn">
                              {settings?.imoff1}
                            </button>
                          )}
                        </div>

                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">
                            Intermediate On
                          </p>
                          {editstate1 ? (
                            <CommonClockTimePicker
                              className="more-setting-btn-edit"
                              value={
                                settings?.imon1 != null
                                  ? dayjs("2220-08-05 " + settings?.imon1)
                                  : ""
                              }
                              allowEmpty
                              showSecond={false}
                              format="HH:mm:00"
                              isTimeSetting
                              istestFieldStyle
                              onChange={(value) => {
                                setsettings({
                                  ...settings,
                                  imon1: dayjs(value).format("HH:mm:ss"),
                                });
                              }}
                            />
                          ) : (
                            // <TimePicker
                            //   className="more-setting-btn-edit"
                            //   defaultValue={
                            //     settings?.imon1 != null
                            //       ? moment("2220-08-05 " + settings?.imon1)
                            //       : ""
                            //   }
                            //   allowEmpty
                            //   showSecond={false}
                            //   format="HH:mm:00"
                            //   onChange={(value) => {
                            //     setsettings({
                            //       ...settings,
                            //       imon1: moment(value).format("HH:mm:ss"),
                            //     });
                            //   }}
                            // />
                            <button type="button" className="more-setting-btn">
                              {settings?.imon1}
                            </button>
                          )}
                        </div>

                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">
                            OFF
                            {parseInt(settings?.mode1) === 2
                              ? "Time"
                              : "Before"}
                          </p>
                          {editstate1 ? (
                            <CommonClockTimePicker
                              className="more-setting-btn-edit"
                              value={
                                settings?.onbefore1 != null
                                  ? dayjs("2220-08-05 " + settings?.onbefore1)
                                  : ""
                              }
                              allowEmpty
                              showSecond={false}
                              format="HH:mm:00"
                              isTimeSetting
                              istestFieldStyle
                              onChange={(value) => {
                                setsettings({
                                  ...settings,
                                  onbefore1: dayjs(value).format("HH:mm:ss"),
                                });
                              }}
                            />
                          ) : (
                            // <TimePicker
                            //   className="more-setting-btn-edit"
                            //   defaultValue={
                            //     settings?.onbefore1 != null
                            //       ? moment("2220-08-05 " + settings?.onbefore1)
                            //       : ""
                            //   }
                            //   allowEmpty
                            //   showSecond={false}
                            //   format="HH:mm:00"
                            //   onChange={(value) => {
                            //     setsettings({
                            //       ...settings,
                            //       onbefore1: moment(value).format("HH:mm:ss"),
                            //     });
                            //   }}
                            // />
                            <button type="button" className="more-setting-btn">
                              {settings?.onbefore1}
                            </button>
                          )}
                        </div>
                      </div>
                      <button className="motorhead lighttimer">
                        Energy Saver
                      </button>
                      <div className="setting-top-bar">
                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">Mode</p>
                          {editstate1 ? (
                            <select
                              type="text"
                              name="mode2"
                              onChange={(e) => {
                                setsettings({
                                  ...settings,
                                  mode2: e.target.value + ":00",
                                });
                              }}
                              className="more-setting-btn-edit filedPickBackground"
                            >
                              <option
                                selected={settings?.mode2 === "" ? true : false}
                                hidden
                              >
                                Mode
                              </option>
                              <option
                                value={0}
                                selected={settings?.mode2 === 0 ? true : false}
                              >
                                Manual
                              </option>
                              <option
                                value={1}
                                selected={settings?.mode2 === 1 ? true : false}
                              >
                                AST
                              </option>
                              <option
                                value={2}
                                selected={settings?.mode2 === 2 ? true : false}
                              >
                                RTC
                              </option>
                            </select>
                          ) : (
                            <button type="button" className="more-setting-btn">
                              {settings?.mode2 === 0
                                ? "Manual"
                                : settings?.mode2 === 1
                                ? "AST"
                                : settings?.mode2 === 2
                                ? "RTC"
                                : null}
                            </button>
                          )}
                        </div>

                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">
                            ON
                            {parseInt(settings?.mode2) === 2 ? "Time" : "After"}
                          </p>
                          {editstate1 ? (
                            <CommonClockTimePicker
                              className="more-setting-btn-edit"
                              value={
                                settings?.onofter2 != null
                                  ? dayjs("2220-08-05 " + settings?.onofter2)
                                  : ""
                              }
                              allowEmpty
                              showSecond={false}
                              format="HH:mm:00"
                              isTimeSetting
                              istestFieldStyle
                              onChange={(value) => {
                                setsettings({
                                  ...settings,
                                  onofter2: dayjs(value).format("HH:mm:ss"),
                                });
                              }}
                            />
                          ) : (
                            // <TimePicker
                            //   className="more-setting-btn-edit"
                            //   defaultValue={
                            //     settings?.onofter2 != null
                            //       ? moment("2220-08-05 " + settings?.onofter2)
                            //       : ""
                            //   }
                            //   allowEmpty
                            //   showSecond={false}
                            //   format="HH:mm:00"
                            //   onChange={(value) => {
                            //     setsettings({
                            //       ...settings,
                            //       onofter2: moment(value).format("HH:mm:ss"),
                            //     });
                            //   }}
                            // />
                            <button type="button" className="more-setting-btn">
                              {settings?.onofter2}
                            </button>
                          )}
                        </div>

                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">
                            Intermediate Off
                          </p>
                          {editstate1 ? (
                            <CommonClockTimePicker
                              className="more-setting-btn-edit"
                              value={
                                settings?.imoff2 != null
                                  ? dayjs("2220-08-05 " + settings?.imoff2)
                                  : ""
                              }
                              isTimeSetting
                              istestFieldStyle
                              allowEmpty
                              showSecond={false}
                              format="HH:mm:00"
                              onChange={(value) => {
                                setsettings({
                                  ...settings,
                                  imoff2: dayjs(value).format("HH:mm:ss"),
                                });
                              }}
                            />
                          ) : (
                            // <TimePicker
                            //   className="more-setting-btn-edit"
                            //   defaultValue={
                            //     settings?.imoff2 != null
                            //       ? moment("2220-08-05 " + settings?.imoff2)
                            //       : ""
                            //   }
                            //   allowEmpty
                            //   showSecond={false}
                            //   format="HH:mm:00"
                            //   onChange={(value) => {
                            //     setsettings({
                            //       ...settings,
                            //       imoff2: moment(value).format("HH:mm:ss"),
                            //     });
                            //   }}
                            // />
                            <button type="button" className="more-setting-btn">
                              {settings?.imoff2}
                            </button>
                          )}
                        </div>

                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">
                            Intermediate On
                          </p>
                          {editstate1 ? (
                            <CommonClockTimePicker
                              className="more-setting-btn-edit"
                              value={
                                settings?.imon2 != null
                                  ? dayjs("2220-08-05 " + settings?.imon2)
                                  : ""
                              }
                              isTimeSetting
                              istestFieldStyle
                              allowEmpty
                              showSecond={false}
                              format="HH:mm:00"
                              onChange={(value) => {
                                setsettings({
                                  ...settings,
                                  imon2: dayjs(value).format("HH:mm:ss"),
                                });
                              }}
                            />
                          ) : (
                            // <TimePicker
                            //   className="more-setting-btn-edit"
                            //   defaultValue={
                            //     settings?.imon2 != null
                            //       ? moment("2220-08-05 " + settings?.imon2)
                            //       : ""
                            //   }
                            //   allowEmpty
                            //   showSecond={false}
                            //   format="HH:mm:00"
                            //   onChange={(value) => {
                            //     setsettings({
                            //       ...settings,
                            //       imon2: moment(value).format("HH:mm:ss"),
                            //     });
                            //   }}
                            // />
                            <button type="button" className="more-setting-btn">
                              {settings?.imon2}
                            </button>
                          )}
                        </div>

                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header timewidth">
                            OFF
                            {parseInt(settings?.mode2) === 2
                              ? "Time"
                              : "Before"}
                          </p>
                          {editstate1 ? (
                            <CommonClockTimePicker
                              className="more-setting-btn-edit"
                              value={
                                settings?.onbefore2 != null
                                  ? dayjs("2220-08-05 " + settings?.onbefore2)
                                  : ""
                              }
                              allowEmpty
                              isTimeSetting
                              istestFieldStyle
                              showSecond={false}
                              format="HH:mm:00"
                              onChange={(value) => {
                                setsettings({
                                  ...settings,
                                  onbefore2: dayjs(value).format("HH:mm:ss"),
                                });
                              }}
                            />
                          ) : (
                            // <TimePicker
                            //   className="more-setting-btn-edit"
                            //   defaultValue={
                            //     settings?.onbefore2 != null
                            //       ? moment("2220-08-05 " + settings?.onbefore2)
                            //       : ""
                            //   }
                            //   allowEmpty
                            //   showSecond={false}
                            //   format="HH:mm:00"
                            //   onChange={(value) => {
                            //     setsettings({
                            //       ...settings,
                            //       onbefore2: moment(value).format("HH:mm:ss"),
                            //     });
                            //   }}
                            // />
                            <button type="button" className="more-setting-btn">
                              {settings?.onbefore2}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="setting-top-bar">
                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header">alert</p>
                          {/* {buttongreyid === 2 ? (
                            <Toggle
                              // id={index}
                              // buttoncol={"grey"}
                              isChecked={
                                controllerdata?.notification_alert === 1
                                  ? true
                                  : false
                              }
                              handleChange={({ status }) => {
                                ChangeMoreSetingButton(
                                  controllerdata?.controller_id,
                                  status
                                );
                              }}
                            />
                          ) : */}
                          {controllerdata?.access_type === 0 ||
                          controllerdata?.access_type === 1 ||
                          controllerdata?.access_type === 2 ||
                          controllerdata?.access_type === 3 ||
                          controllerdata?.access_type === null ? (
                            <Toggle
                              // id={index}
                              EditState={editstate1}
                              isChecked={buttonstate === 1 ? true : false}
                              handleChange={({ status }) => {
                                setbutton(status ? 1 : 0);
                              }}
                            />
                          ) : null}
                        </div>
                        <div className="setting-sub-bar new-setting-sub">
                          <p className="tank-header">MCB trip</p>

                          {buttongreyid === 1 ? (
                            <Toggle
                              // id={index}
                              buttoncol={"grey"}
                              isChecked={true}
                              handleChange={({ status }) => {
                                ChangeMoreSetingButton(
                                  controllerdata?.controller_id,
                                  status,
                                  mcpbutton,
                                  controllerdata?.access_type
                                );
                              }}
                            />
                          ) : controllerdata?.access_type === 0 ||
                            controllerdata?.access_type === 1 ||
                            controllerdata?.access_type === 2 ||
                            controllerdata?.access_type === 3 ||
                            controllerdata?.access_type === null ? (
                            <Toggle
                              // id={index}
                              isChecked={true}
                              handleChange={({ status }) => {
                                ChangeMoreSetingButton(
                                  controllerdata?.controller_id,
                                  status,
                                  mcpbutton,
                                  controllerdata?.access_type
                                );
                              }}
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {(usertype === 1 || usertype === 2) &&
                      buttonstate === 1 && (
                        <div className={`row ${commonstyle.BoxContainer} `}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <h3
                              className={commonstyle.messageHead}
                              style={{ marginTop: 15, padding: 0 }}
                            >
                              Mobile Notification Settings
                            </h3>
                            <img
                              src={
                                !editNotification
                                  ? ExportedImages.EDIT_ICON_BLUE
                                  : ExportedImages.SAVE_ICON_BLUE
                              }
                              alt="edit"
                              onClick={() => {
                                setEditNotification((pre) => !pre);
                                if (editNotification) {
                                  handleUpdateNotificationSetting(
                                    notificationList
                                  );
                                }
                              }}
                              className="pointerCurser"
                            />
                          </div>

                          <p className={commonstyle.description}>
                            <span>*</span>Only the selected options trigger an
                            alert on your mobile
                          </p>
                          {notificationList?.map((item, index) => {
                            return (
                              <div
                                key={index}
                                className={`col-sm-12 col-md-6 col-lg-4 ${commonstyle.CheckLineList}`}
                              >
                                <Checkbox
                                  className={"CheckBox_innerStyle"}
                                  checked={item?.access}
                                  disabled={!editNotification}
                                  onChange={() => {
                                    let UpdatedList = notificationList.map(
                                      (ele) =>
                                        ele.id === item.id
                                          ? {
                                              ...item,
                                              access: !item.access,
                                            }
                                          : ele
                                    );
                                    setNotificationAccess(
                                      UpdatedList?.reduce((acc, item) => {
                                        if (item?.access) {
                                          acc = [...acc, item?.id];
                                        }
                                        return acc;
                                      }, [])
                                    );
                                    // handleUpdateNotificationSetting(UpdatedList);
                                    setnotificationList(UpdatedList);
                                  }}
                                />
                                <p className="tank-header"> {item.name}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </>
                ) : null}
              </>
            </Tab>
            <Tab eventKey={3} title="Chart">
              {controllerdata?.controller_code ||
              controllerdata?.light_data?.length ? (
                <h4 className={devicestyle.page_head}>Charts</h4>
              ) : (
                <p className="chartnodata">No datas Found</p>
              )}
              <div className={chartstyle.chart_bottom}>
                {eventkey == 3 ? (
                  <>
                    {controllerdata?.controller_code ? (
                      <ControllerWaterfallChart
                        controllerchart={{
                          id: location?.state?.id,
                          con_name: controllerdata?.controller_name,
                        }}
                      />
                    ) : null}
                    {controllerdata?.light_data?.length > 0 ? (
                      <ValveWaterfallChart valvechart={location?.state?.id} />
                    ) : null}
                  </>
                ) : null}
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
}
