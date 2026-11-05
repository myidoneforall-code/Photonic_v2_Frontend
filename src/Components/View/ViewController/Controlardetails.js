import { GoAlert } from "react-icons/go";
import { useLocation, useNavigate } from "react-router";
import chartstyle from "../Dashboard/Charts/Chart.module.css";
import {
  MdOutlineCheckBoxOutlineBlank,
  MdOutlineCheckBox,
  MdLocationOn
} from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import {
  buttonapi,
  checkproduct,
  DeleteMergerService,
  devicerefreshapi,
  editcontroller,
  editdevice,
  editmotorsetting,
  editsettingapi,
  flowreading,
  GetnotificationAccessDropdown,
  listusersapi,
  MergerControllerService,
  MergerDeviceService,
  motordata,
  servicedetailsapi,
  UpdateControllerCode,
  UpdateMergeSettingService,
  UpdateNotificationSettings,
  handledimentionAddApi,
  ViewUserPermission,
  lastReceivedDataBatch
} from "../../../Service/ApiService";
import { useDispatch, useSelector } from "react-redux";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowLeft,
  FaStar,
  FaTrashAlt
} from "react-icons/fa";
import {
  Updatefilterdata,
  Updatemotorscheduleedit,
  UpdatePageState,
  Updatevalvescheduleedit
} from "../../Store/Config/Configuration";
import Toggle from "../../ToggleButton";
import Changegroup from "../../../Modalcomponents/Changegroup";
import { toast } from "react-hot-toast";
import Loader from "../../Loader";
import { getCookie } from "../../../Utilities/Cookie";
import { OverlayTrigger, Tab, Table, Tabs, Tooltip } from "react-bootstrap";
import devicestyle from "../ViewController/motorcontroller.module.css";
import { ImSpinner11 } from "react-icons/im";
import Timesetting from "../../../Modalcomponents/Timesetting";
import EditTimesetting from "../../../Modalcomponents/Edittimesetting";
import AddValvetime from "../../../Modalcomponents/AddValvetime";
import Valveedit from "../../../Modalcomponents/Valvedittime";
import moment from "moment";
import AllDetailsAddModal from "../../../Modalcomponents/AllDetailsAddModal";
import AllDetailsEditModal from "../../../Modalcomponents/AllDetailsEditModal";
import DeleteConfirmationModal from "../../../Modalcomponents/DeleteConfirmationModal";
import ReactPaginate from "react-paginate";
import TankLineChart from "../Dashboard/Charts/TankLineChart";
import FlowBarChart from "../Dashboard/Charts/FlowBarChart";
import ControllerWaterfallChart from "../Dashboard/Charts/ControllerWaterfallChart";
import ValveWaterfallChart from "../Dashboard/Charts/ValveWaterfallChart";
import FlowTotalUsageTime from "./FlowTotalUsage";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import Tankhistorydetails from "./HistoryDetails/TankHistoryDetails";
import Flowhistorydetails from "./HistoryDetails/FlowHistoryDetails";
import Valvehistorydetails from "./HistoryDetails/ValveHistoryDetails";
import Chlorinatorhistorydetails from "./HistoryDetails/ChlorinatorHistoryDetails";
import ChlorinatorCard from "./ChlorinatorCard";
import Controllerhistorydetails from "./HistoryDetails/ControllerHistoryDetails";
import { Checkbox, Col, Row } from "antd";
import MergeConfirmationModal from "../../../Modalcomponents/MergeConfirmationModal";
import {
  Float_Validation,
  formatIndianNumber,
  getCatchMsg,
  getlimitAction,
  GetViewTabKey
} from "../../../Utilities/Methods";
import {
  GetSessionStorage,
  SetSessionStorage
} from "../../../Utilities/Storage";
import BlurComponent from "../BlurComponent";
import { ExportedImages } from "../../../Utilities/ImageExport";
import AMCExpiryModal from "../../../Modalcomponents/AMCexpiryModal";
import CommonSwitch from "../../CommonComponents/CommonSwitch";
import ValveWeeklySchedule from "./ValveWeeklySchedule";
import {
  UsageLimit,
  ValveModalList,
  WeeklyDaysList
} from "../../../Utilities/Constants";
import CommonClockTimePicker from "../../CommonComponents/CommonClockTimePicker";
import dayjs from "dayjs";
import CustomLineChart from "../Dashboard/Charts/DoubleLineChart";
import LineChart from "../Dashboard/Charts/DoubleLineChart";
import merge_icon from "../../../Assets/image/merge.png";
import { cloneWith, values } from "lodash";
import ModifyControllerCode from "../../../Modalcomponents/ModifyControllerCode";
import { useFormik } from "formik";
import * as Yup from "yup";

const threeColonFormat = /^[0-9]+:[0-9]+:[0-9]+$/;

export default function Controlardetails() {
  // settings
  let abortcontroller = undefined;
  let location = useLocation();
  const { state } = useLocation();
  let controllertype = parseInt(localStorage.getItem("contollertype"));
  const [edittimedata, setedittimedata] = useState();
  const [valveindex, setvalveindex] = useState();
  const [valveeditdata, setvalveeditdata] = useState();
  const [weeklyTimeList, setWeeklyTimeList] = useState([]);
  const [isDaily, setIsDaily] = useState(false);
  const [expiryModal, setexpiryModal] = useState({
    show: false,
    UpdatedData: null
  });
  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;

  const [type, settype] = useState({
    requesttypeOne: 1,
    requesttypeTwo: 2,
    requesttypeThree: 3,
    requesttypeFour: 4,
    requesttypeFive: 5,
    requesttypeSix: 6,
    requesttypeSeven: 7,
    requesttypeEight: 8
  });

  const [motorset, setmotorset] = useState(false);
  const [motortime, setmotortime] = useState(false);
  const [valvetime, setvalvetime] = useState(false);
  // "Save" only pushes the new schedule to the device over MQTT — the
  // database (what this page actually displays) only updates once the
  // device reports its own settings back (c0=102), which can take a
  // while and isn't something this page gets pushed the moment it
  // happens. Rather than silently show the still-old value right after
  // save (looks like the change was lost), show a pending state for a
  // stretch of time so it's clear the change was sent and is just
  // waiting on the device, not reverted.
  const [motorSchedulePending, setMotorSchedulePending] = useState(false);
  const [valveSchedulePending, setValveSchedulePending] = useState(false);
  const valveTimeRef = useRef({ value: valvetime });
  const motorTimeRef = useRef({ value: motortime });
  // Same stale-closure fix as valveTimeRef/motorTimeRef — motorset gates
  // the Motor Mode/Run Hours edit fields, and editEbs gates the EB
  // Number/Lat/Long fields; handleApiDatas() (called from the mount-frozen
  // background poll) needs these read fresh via a ref, not the closed-over
  // state value, or it keeps overwriting in-progress edits with the
  // still-old server value. editEbs itself is declared further below, so
  // this starts at its same initial value (false) and the sync effect
  // keeps it current from then on.
  const motorsetRef = useRef({ value: motorset });
  const editEbsRef = useRef({ value: false });
  // true while the controller name is NOT being edited (editstate true = read only)
  const editstateRef = useRef({ value: true });
  const [devicedata, setdevice] = useState();
  const [editsetting, setedit] = useState(false);
  // Same stale-closure fix as valveTimeRef/motorTimeRef above — the
  // background silent poll's handleApiDatas() is frozen at mount time, so
  // without this ref it would always see editsetting's initial (false)
  // value and keep overwriting a just-toggled Notification switch with
  // the still-old server value a few seconds after the user turned it on.
  const editsettingRef = useRef({ value: editsetting });
  const [valvedata, setvalvedata] = useState([]);
  const [multiDeviceData, setMultiDeviceData] = useState([]);
  const [settingloading, setsettingloading] = useState(false);
  const [eventkey, seteventkey] = useState();
  const [settingloadingTwo, setsettingloadingTwo] = useState(false);
  const [DubMotorScheduleData, setDubMotorScheduleData] = useState([]);
  const [DubValveScheduleData, setDubValveScheduleData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [value, setValue] = useState(null);
  const [modalstates, setmodal] = useState({
    highlimit: false,
    lowlimit: false,
    usagelimit: false,
    Addtime: false,
    edittime: false,
    valveadd: false,
    valveedit: false
  });
  const [moresettingdata, setmoresetting] = useState({
    HV: "",
    LV: "",
    OL: "",
    HV_diff: "",
    LV_diff: "",
    SD: "",
    E_starter: "",
    Float: "",
    ph: "",
    Dry: "",
    Ol2ph: "",
    Dry2ph: "",
    Offd: "",
    continues: "",
    current: "",
    Voltage: "",
    voldisplay: "",
    DSD: "",
    DRT: "",
    pf: ""
  });

  const [motorschedule, setmotorsch] = useState({ motormode: "", runhrs: "" });
  const [timesetting, settimeset] = useState([]);
  const [timeSettingData, setTimeSettingData] = useState({
    valve: [],
    motor: []
  });
  // const [motorkeyvalue, setkeyvalue] = useState([]);
  const [moterindex, setmotorindex] = useState();
  const [buttonstate, setbutton] = useState(0);
  // The status the user just requested (true=ON/false=OFF), shown on the
  // toggle immediately while it's greyed out and waiting for the real
  // backend/motor state to catch up — otherwise the toggle stayed on
  // its OLD position the whole time it was grey, making it look like
  // the click hadn't registered at all.
  const [pendingToggleStatus, setPendingToggleStatus] = useState(null);
  // Synchronous lock for the ON/OFF toggle — buttongreyid (state) only
  // updates on the next render, so a second rapid tap/click landing
  // before that render commits could still slip past the `buttongreyid
  // === id` check below and fire a second command. A ref updates
  // immediately, so it closes that race window.
  const buttonProcessingRef = useRef(false);
  // Mirrors the latest fetched controllerdata — see the effect near its
  // declaration below (controllerdata isn't defined yet at this point in
  // the component, and a useEffect's dependency array is evaluated
  // immediately, not deferred like its callback body, so that effect has
  // to live after controllerdata's own useState call).
  const controllerdataRef = useRef();

  const motorscheduleedit = useSelector((state) => state.motorscheduleedit);
  const valvescheduleedit = useSelector((state) => state.valvescheduleedit);
  const motorViewDatas = useSelector((state) => state.motorViewDatas);
  let sessiondata = GetSessionStorage("MotorViewDatas");

  const MortorSessionData = sessiondata ? JSON.parse(sessiondata) : null;

  let dispatch = useDispatch();
  const [valvetimedelete, setvalvetimedelete] = useState({
    show: false,
    valveindex: "",
    time: ""
  });
  const [motortimedelete, setmotortimedelete] = useState({
    show: false,
    motorindex: "",
    time: ""
  });

  // end
  // all details
  const [listuser, setlistuser] = useState();
  const [servicedetail, setservicedetail] = useState();

  const [pagestate, setpage] = useState(1);
  const [servicepage, setservicepage] = useState(1);
  const [serialno, setserialno] = useState("");
  const [lgShow, setLgShow] = useState({
    show: false,
    data: null
  });
  const [modalshow, setaddmodal] = useState(false);

  const [deletemodal, setdeletemodal] = useState({
    show: false,
    serviceid: ""
  });
  const [valueTimeList, setValueTimeList] = useState([]);
  const [deviceindex, setdeviceindex] = useState();
  const [spinnerindevice, setspinnerindevice] = useState(false);
  const [controllerdata, setcontroller] = useState();
  useEffect(() => {
    controllerdataRef.current = controllerdata;
  }, [controllerdata]);
  const [editstate, seteditstate] = useState(true);
  const [editEb, setEb] = useState(false);
  const [editEbs, setEbs] = useState(false);
  const [edithr, sether] = useState(false);
  const [group, setgroup] = useState(false);
  const [pevid, sepevtid] = useState();
  const [contname, setname] = useState();
  const [topic, settopic] = useState();
  const [isloading, setloading] = useState(false);
  const [condataloading, setcondataloading] = useState(false);
  const [lorastate, setlora] = useState();
  let navigate = useNavigate();
  const [valveTimeSettingLoader, setValveTimeSettingLoader] = useState(false);
  const [ebdata, setebdata] = useState({
    ebval: "",
    lan: "",
    lat: "",
    is_fixed: ""
  });

  const [ebdatas, setebdatas] = useState();
  const [loader, setloader] = useState(false);
  const [buttongreyid, setbuttongreyid] = useState("");
  const [locationtype, setlocation] = useState();

  // const [code, setcode] = useState();
  const [totaldatacount, settotaldata] = useState();
  const [CheckValveButton, setCheckValveButton] = useState(0);
  const [ValveModeButton, setValveModeButton] = useState(0);
  const [notificationList, setnotificationList] = useState([]);
  const [editNotification, setEditNotification] = useState(false);
  const [notificationAccessList, setNotificationAccess] = useState([]);
  const [tankedit, settankedit] = useState(false);
  const [historyview, sethistoryview] = useState({
    controller: false,
    valve: false,
    tank: false,
    flow: false
  });
  const historyRef = useRef({
    controller: false,
    valve: false,
    tank: false,
    flow: false
  });

  const colors = { blue: "#1F78A4", black: "#000000" };
  const [TotalUsagecount, setTotalUsage] = useState();

  const [tankdata, settankdata] = useState([]);
  const [flowdata, setflowdata] = useState([]);
  const [edittank, settank] = useState(false);
  const [editMultiDevice, setEditMultiDevice] = useState(false);

  const [editflow, setflow] = useState(false);
  const [editvalve, setvalve] = useState(false);
  const [deviceid, setdeviceid] = useState();
  const [tankData, setTankData] = useState({ diameter: "", length: "" });
  const [editDiameter, setEditDiameter] = useState(true);
  const [editLength, setEditLength] = useState(true);

  const [devicetype, setdevicetype] = useState({
    tankdevicetype: 1,
    flowdevicetype: 2,
    valvedevicetype: 3,
    multideviceType: 5
  });
  const [buttontype, setbuttontype] = useState({
    contrbuttontype: 1,
    devicebuttontype: 2
  });
  const [tankinputdata, settankinputdata] = useState({
    devicename: "",
    tankheight: "",
    tank_width: "",
    highlimit: "",
    lowlomit: "",
    latitude: "",
    longitude: "",
    highlimitaction: "",
    lowlimitaction: "",
    is_fixed: "",
    default_level: "",
    notification_alert: ""
  });
  const [flowinputdata, setflowinputdata] = useState({
    devicename: "",
    usagelimit: "",
    usagelimitaction: "",
    latitude: "",
    longitude: "",
    dailyupdate: "",
    is_fixed: "",
    notification_alert: ""
  });
  const [valveinputdata, setvalveinputdata] = useState({
    devicename: "",
    latitude: "",
    longitude: "",
    is_fixed: "",
    valve_mode: null,
    notification_alert: ""
  });
  const [multiDeviceInputData, setMultiDeviceInputData] = useState({
    devicename: "",
    latitude: "",
    longitude: "",
    is_fixed: "",
    notification_alert: ""
  });
  const [mergerController, setMergerController] = useState({
    device_id: "",
    device_code: "",
    is_tank: false,
    action: ""
  });
  const [MergeSettingData, setMergeSettingData] = useState({
    high_limit: "",
    low_limit: "",
    high_limit_action: 0,
    low_limit_action: 0,
    isEdit: false
  });
  const [mergeConfirmation, setmergeConfirmation] = useState({
    action: "",
    show: false,
    merge_id: "",
    tankdata: ""
  });
  const [mergerDevice, setMergerDevice] = useState({
    child_device_id: "",
    child_device_code: "",
    is_tank: false,
    action: "",
    parent_device_id: ""
  });
  const [DeviceMergeSettingData, setDeviceMergeSettingData] = useState({
    high_limit: "",
    low_limit: "",
    high_limit_action: 0,
    low_limit_action: 0,
    usage_limit_action: 0,
    isEdit: false,
    merge_id: 0
  });
  const [devicemergeConfirmation, setdevicemergeConfirmation] = useState({
    show: false,
    data: {},
    action: "",
    tankdata: ""
  });
  const [mergeControllerDeviceID, setMergeControllerDeviceID] = useState("");
  const [mergeMultiDeviceID, setMergeMultiDeviceID] = useState("");
  const [mergeSingleDeviceID, setMergeSingleDeviceID] = useState("");

  const LoginUserData = useSelector((state) => state.LoginUserData);
  const [userpersmission, setUserPermissions] = useState([]);
  const [editMultiDeviceChild, setEditMultiDeviceChild] = useState({
    isEdit: false,
    device_id: null,
    editData: null
  });
  const [isEditControllerCode, setIsEditControllerCode] = useState({
    isEdit: false,
    item: { controllerCode: "", controllerID: "" },
    editedControllerCode: "",
    isShowModal: false
  });
  let controllerdetailspage = sessionStorage.getItem("controllerdetailspage");
  // const [height, setheight] = useState("");
  // const [width, setwidth] = useState("");
  // const [pressure, setPressure] = useState("");
  const { values, handleChange, errors, touched, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        height: "",
        width: "",
        pressure: "",
        power_usage: "",
        amps: "",
        volts: "",
        depthactionvalue: "",
        depth_action: ""
      },
      // validationSchema: Yup.object({
      //   amps: Yup.string()
      //     .test("amps-check", "Correct format is required", function (value) {
      //       if (Number(usertype) !== 1) return true; // ✅ skip validation for usertype != 1
      //       if (!value) return false; // if required but empty → show required msg
      //       return threeColonFormat.test(value); // ✅ apply regex only when usertype === 1
      //     })
      //     .when([], {
      //       is: () => Number(usertype) === 1,
      //       then: (schema) => schema.required("Amps is required"),
      //       otherwise: (schema) => schema.notRequired()
      //     }),

      //   volts: Yup.string()
      //     .test("volts-check", "Correct format is required", function (value) {
      //       if (Number(usertype) !== 1) return true; // ✅ skip validation for usertype != 1
      //       if (!value) return false;
      //       return threeColonFormat.test(value);
      //     })
      //     .when([], {
      //       is: () => Number(usertype) === 1,
      //       then: (schema) => schema.required("Volts is required"),
      //       otherwise: (schema) => schema.notRequired()
      //     })
      // }),
      validationSchema: Yup.object({
        amps: Yup.string()
          .nullable()
          .transform((value) => (value === null ? "" : value))
          .test("amps-check", "Correct format is required", function (value) {
            if (Number(usertype) !== 1) return true;
            if (value === "0") return true;
            if (!value) return false;
            return threeColonFormat.test(value);
          }),

        volts: Yup.string()
          .nullable()
          .transform((value) => (value === null ? "" : value))
          .test("volts-check", "Correct format is required", function (value) {
            if (Number(usertype) !== 1) return true;
            if (value === "0") return true;
            if (!value) return false;
            return threeColonFormat.test(value);
          })
      }),

      onSubmit: () => {
        handledimentionAdd();
      }
    });
  const getListNotifications = () => {
    GetnotificationAccessDropdown()
      .then((res) => {
        if (res.data.status === 1) {
          let SetaccessPermission = res?.data?.data?.map((item, index) => {
            return { ...item };
          });

          setnotificationList(SetaccessPermission);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  useEffect(() => {
    if (LoginUserData.user_id) {
      handleUserPrmission();
    }
  }, [LoginUserData.user_id]);

  const handleUserPrmission = () => {
    const formdata = new FormData();
    formdata.append("user_id", LoginUserData.user_id);
    ViewUserPermission(formdata)
      .then((res) => {
        setUserPermissions(res.data);
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
    formData.append("controller_id", state?.id);

    UpdateNotificationSettings(formData)
      .then((res) => {
        if (res.data.status === 1) {
          toast.success(res.data.msg);
          MotorController();
        } else {
          toast.error(res.data.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };
  useEffect(() => {
    handleGetServiceDetails();
    handleGetUserDetails();
    getListNotifications();
  }, [pagestate, servicepage]);

  useEffect(() => {
    setnotificationList(
      notificationList?.map((ele) =>
        notificationAccessList?.includes(ele?.id)
          ? { ...ele, access: true }
          : ele
      )
    );
  }, [notificationAccessList]);
  //two minutes once auto refresh

  useEffect(() => {
    if (devicedata) {
      const valveFilterdValue = devicedata?.valve?.filter(
        (ele) => ele?.valve_mode === 1
      );
      const multiFilterdValue = devicedata?.multi?.[0]?.valve_data?.filter(
        (ele) => ele?.valve_mode === 1
      );

      if (valveFilterdValue?.length > 0 || multiFilterdValue?.length > 0) {
        setIsDaily(true);
      }
    }
  }, [devicedata]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleGetServiceDetails();
      handleGetUserDetails();
      // Skip while a button press is being polled below — that poll is
      // already refetching every 2s, and this call landing in the
      // middle of that window was fetching/rendering on an overlapping,
      // uncoordinated schedule — the likely cause of the toggle
      // flickering to the opposite state mid-wait before settling.
      // silent=true — this ran non-silent, so it flashed the full-page
      // loading spinner every 2 minutes regardless of what the user was
      // doing.
      if (
        !valveTimeRef?.current?.value &&
        !motorTimeRef?.current?.value &&
        !buttonProcessingRef.current
      ) {
        MotorController(false, true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [valvetime]);

  // Was the ONLY refresh on this whole page — every reading/status
  // update (including whatever a sent command's ack brings back) had to
  // wait up to 2 minutes to show up, since nothing else polled sooner.
  // This mirrors the same fix already applied to the Production Tester
  // screen: a fast, silent background poll just for the live data, so a
  // command's result shows up in seconds instead of up to 2 minutes.
  useEffect(() => {
    const interval = setInterval(() => {
      // Same reasoning as above — pollAfterButtonPress already owns the
      // refresh schedule while a button press is pending, so this
      // independent poll steps aside instead of racing it.
      // motorTimeRef (not the motortime state) — this effect only runs
      // once on mount ([] deps), so its closure over MotorController/
      // handleApiDatas is fixed at mount time and would otherwise always
      // see motortime's initial (false) value no matter how many times
      // the user opens the Motor Schedule edit session afterwards. That
      // stale read was the actual cause of an edited time reverting to
      // the old value a few seconds after save: this poll kept calling
      // MotorController -> handleApiDatas with a guard that always
      // believed no edit was in progress, so it kept overwriting the
      // just-edited schedule with the still-old server value. The ref is
      // read fresh on every tick regardless of closure age.
      if (!buttonProcessingRef.current && !motorTimeRef?.current?.value) {
        MotorController(false, true);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    handleSetValues();
    MotorController();
  }, []);

  useEffect(() => {
    if (state?.ControllerFilters) {
      dispatch(Updatefilterdata(state?.ControllerFilters?.values));
      dispatch(UpdatePageState(state?.ControllerFilters?.page));
    }
  }, [state]);
  const handleSetValues = () => {
    if (motorViewDatas) {
      setcontroller(motorViewDatas);
    } else if (MortorSessionData) {
      handleApiDatas(MortorSessionData);
    }
  };

  //for all details data show

  const ShowHistoryTabData = (data) => {
    // if(historyview)

    let viewTabData = GetViewTabKey(historyRef.current);

    if (!viewTabData) {
      if (data?.controller_code) {
        handleTabView({
          controller: true,
          valve: false,
          tank: false,
          flow: false
        });
      }
      //  else if (
      //   (controllerdata?.tank?.length > 0 &&
      //     controllerdata?.flow_meter?.length > 0 &&
      //     controllerdata?.valve?.length > 0) ||
      //   (controllerdata?.tank?.length > 0 &&
      //     controllerdata?.flow_meter?.length > 0) ||
      //   (controllerdata?.tank?.length > 0 && controllerdata?.valve?.length > 0)
      // ) {
      //   handleTabView({
      //     controller: false,
      //     valve: false,
      //     tank: true,
      //     flow: false,
      //   });
      // }
      else if (
        data?.tank?.length > 0 ||
        getMultiDeviceCount("tank", data).length > 0
      ) {
        handleTabView({
          controller: false,
          valve: false,
          tank: true,
          flow: false
        });
      } else if (
        data?.flow_meter?.length > 0 ||
        getMultiDeviceCount("flow", data).length > 0
      ) {
        handleTabView({
          controller: false,
          valve: false,
          tank: false,
          flow: true
        });
      } else if (
        data?.valve?.length > 0 ||
        getMultiDeviceCount("valve", data).length > 0
      ) {
        handleTabView({
          controller: false,
          valve: true,
          tank: false,
          flow: false
        });
      }
    }
  };

  const latlong = (letters) => {
    var ch = String.fromCharCode(letters.which);

    if (!/[0-9.]/.test(ch)) {
      letters.preventDefault();
    }
  };

  const handleGetServiceDetails = () => {
    setloader(true);
    let ServiceformData = new FormData();
    ServiceformData.append("controller_id", state?.id);
    ServiceformData.append("for_web", 1);

    servicedetailsapi(ServiceformData, servicepage)
      .then(({ data }) => {
        setservicedetail(data);
      })
      .catch((err) => {
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

  const handleGetUserDetails = () => {
    setloader(true);
    let ListuserformData = new FormData();
    ListuserformData.append("controller_id", state?.id);
    ListuserformData.append("controller_type", 1);

    listusersapi(ListuserformData, pagestate)
      .then(({ data }) => {
        setlistuser(data.items);
        settotaldata(data.total);
      })
      .catch((err) => {
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

  const TotalUsage = (startDate, toDate, fromtime, totime, deviceid, data) => {
    let deviceiddata = (data ? data : controllerdata)?.flow_meter?.map((id) => {
      return id?.device_id;
    });

    let flowDeviceIds = deviceiddata;
    if (
      flowDeviceIds?.length > 0 ||
      getMultiDeviceCount("flow", data || controllerdata)
    ) {
      let flowIds = getMultiDeviceCount("flow", data || controllerdata)?.map(
        (ele) => ele?.device_id
      );

      let formData = new FormData();
      formData.append(
        "device_id",
        deviceid ? deviceid : [...flowDeviceIds, ...flowIds]?.toString()
      );

      formData.append(
        "from_date",
        moment(startDate).format("YYYY-MM-DD 00:00:00")
      );
      formData.append("to_date", moment(toDate).format("YYYY-MM-DD 23:59:59"));
      formData.append("controller_type", controllertype);
      formData.append("report", 1);
      formData.append("from_date_format", fromtime);
      formData.append("to_date_format", totime);

      flowreading(formData)
        .then(({ data }) => {
          setTotalUsage(data?.total_consumption);
          sessionStorage.setItem("FlowReading", data?.total_consumption);
        })
        .catch((err) => {
          getCatchMsg(err);
        });
    }
  };

  const handleApiDatas = (data) => {
    // navigate("/dashboard/details", { state: data });
    if (data) {
      SetSessionStorage("MotorViewDatas", JSON.stringify(data));
    }

    settankdata(data.tank);
    setflowdata(data.flow_meter);
    setvalvedata(data.valve);
    setMultiDeviceData(data?.multi);

    setdevice(data);
    // Skip while the Notification toggle's own edit panel is open — this
    // runs on every background refresh (including the silent poll), and
    // without this guard it kept overwriting a just-toggled switch with
    // the still-old server value a few seconds later. Same pattern as the
    // isEdit guard on setMergeSettingData below.
    if (!editsettingRef?.current?.value) {
      setbutton(data?.notification_alert);
    }
    // Check Valve lives inside the Motor Schedule edit form, so it's
    // guarded the same way as the schedule itself below — skip the
    // overwrite while that edit session (motortime) is open.
    if (!motorTimeRef?.current?.value) {
      setCheckValveButton(data?.controller_setting?.check_valve);
    }
    setcontroller(data);
    let mergeData = data?.controllerMerge;
    // FIXED: this ran on every refresh (including the page's fast
    // silent background poll, every few seconds) and always replaced
    // the whole object — never included isEdit, so it silently reset
    // to falsy each time, closing the High Limit/Low Limit edit fields
    // out from under the user a few seconds after they opened them and
    // overwriting whatever they'd typed with the still-old server
    // value. Skip the overwrite entirely while actively editing.
    setMergeSettingData((pre) =>
      pre?.isEdit
        ? pre
        : {
            high_limit: mergeData?.high_limit,
            low_limit: mergeData?.low_limit,
            high_limit_action: mergeData?.high_limit_action || 0,
            low_limit_action: mergeData?.low_limit_action || 0,
            isEdit: false
          }
    );
    ShowHistoryTabData(data);
    // handleTabView()
    // setMergerController((pre) => ({
    //   ...pre,
    //   action: data?.mergerController ? "delete" : "merge",
    // }));
    // setValveModeButton(data?.controller_setting?.valve_status);
    setValveModeButton(data?.device_time_setting?.[0]?.valve_mode);

    TotalUsage(
      new Date(moment().subtract(7, "d").format("YYYY-MM-DD HH:mm:ss")),
      new Date(),
      1,
      1,
      "",
      data
    );

    // let deviceid = data?.flow_meter?.map((id) => {
    //   return { value: id?.device_id, label: id?.device_id };
    // });

    // setcode(deviceid);

    setlora(data?.lora_status === 1 ? true : false);
    settopic(data?.topic);
    // The background refresh must not put the old name back while the name is being
    // typed, or Save sends the old name: it says Success and nothing changes.
    if (editstateRef.current.value) {
      setname(data?.controller_name);
    }
    // Skip while the EB Number/Lat/Long edit panel (editEbs) is open —
    // same unguarded-overwrite bug as the others in this function.
    if (!editEbsRef?.current?.value) {
      setebdata({
        ebval: data?.eb_number,
        lat: data?.controller_setting?.latitude,
        lan: data?.controller_setting?.longitude,
        is_fixed: data?.is_fixed
      });
    }
    let grpid = data?.group?.find((ele, indx) => {
      return ele;
    });
    sepevtid(grpid);
    setDubMotorScheduleData(data?.time_setting);
    setDubValveScheduleData(data?.device_time_setting);
    // FIXED: these ran on every refresh (including the page's fast
    // silent background poll, every few seconds) and always overwrote
    // the schedule list from the server — same bug as MergeSettingData
    // above. With the Add/Edit Time Setting modal open, a poll landing
    // mid-selection reset the clock picker back to blank before the
    // user could save it. Skip the overwrite while that modal's open —
    // and also while the wider Motor/Valve Schedule edit session itself
    // is open (motortime/valvetime), not just its Add/Edit sub-modal:
    // a poll during that broader session (e.g. right after deleting a
    // Timing entry, before Save persists it) was silently re-fetching
    // the full list and undoing the not-yet-saved local delete.
    if (!modalstates?.Addtime && !modalstates?.edittime && !motortime) {
      dispatch(Updatemotorscheduleedit(data?.time_setting));
    }
    if (!modalstates?.valveadd && !modalstates?.valveedit && !valvetime) {
      dispatch(Updatevalvescheduleedit(data?.device_time_setting));
    }
    setdevice(data);

    // Skip while the Motor Mode/Run Hours edit panel (motorset) is open —
    // same unguarded-overwrite bug as the others in this function.
    if (!motorsetRef?.current?.value) {
      setmotorsch({
        motormode:
          data?.controller_setting?.motor_mode !== null
            ? data?.controller_setting?.motor_mode
            : 0,
        runhrs: data?.controller_setting?.allowed_running_hrs
      });
    }
    let moresetting = data?.controller_setting;
    // Skip while the More Settings edit panel (editsetting — the same
    // flag the Notification toggle above uses) is open. This covers
    // every field in that panel: HV, LV, OL, Dry, Continuous, Voltage,
    // Current, etc.
    if (!editsettingRef?.current?.value) {
      setmoresetting({
        HV: moresetting?.hv,
        LV: moresetting?.lv,
        OL: moresetting?.ol_amps,
        HV_diff: moresetting?.high_volt_diff,
        LV_diff: moresetting?.low_volt_diff,
        SD: moresetting?.sd_sec,
        E_starter: moresetting?.e_starter,
        Float: moresetting?.float,
        ph: moresetting?.ph_mode,
        Dry: moresetting?.dry_amps,
        Ol2ph: moresetting?.over_load_2ph,
        Dry2ph: moresetting?.dry_2ph,
        Offd: moresetting?.offd,
        continues: moresetting?.continuous,
        current: moresetting?.current,
        Voltage: moresetting?.voltage,
        voldisplay: moresetting?.volt_display,
        DSD: moresetting?.dry_sense_delay,
        pf: moresetting?.pf,
        DRT: moresetting?.dry_reset_time || ""
      });
    }

    let dsettings = data?.device_time_setting?.map((ele, ind) => {
      return {
        device_id: ele?.device_id,
        time_setting_id: ele?.time_setting_id,
        device_name: ele?.device_name,
        valve_mode: ele?.valve_mode,
        time1: ele?.time1,
        time2: ele?.time2,
        timer_name: "",
        weekly_schedule: ele?.weekly_schedule
      };
    });
    // Same poll-overwrite bug as MergeSettingData/motorscheduleedit above —
    // settimeset(dsettings) feeds toeditmotorsch()'s WeeklyScheduleList,
    // i.e. the actual time1/time2/weekly_schedule values that get saved.
    // This ran unguarded on every poll, so a poll landing mid-edit (or
    // whenever the server's own device_time_setting was still empty)
    // silently overwrote the user's in-progress valve weekly schedule
    // with zeroed-out data right before Save sent it.
    if (
      !modalstates?.Addtime &&
      !modalstates?.edittime &&
      !motortime &&
      !modalstates?.valveadd &&
      !modalstates?.valveedit &&
      !valvetime
    ) {
      setTimeSettingData((pre) => ({ ...pre, valve: dsettings }));

      // let msettings = data?.time_setting?.map((ele, index) => {
      //   return {
      //     time1: ele?.time1,
      //     time2: ele?.time2,
      //   };
      // });
      // setkeyvalue(msettings);

      settimeset(dsettings);
    }
  };

  const handledimentionAdd = () => {
    //  isloading(true)
    const formdata = new FormData();
    console.log(values, "values1231");

    if (values?.width) {
      formdata.append("diameter", values?.width);
    }
    if (values?.height) {
      formdata.append("length", values?.height);
    }

    if (values?.pressure) {
      formdata.append("pressure_value", values?.pressure);
    }
    if (values?.power_usage) {
      formdata.append("power_usage", values?.power_usage);
    }
    if (values?.amps) {
      formdata.append("amps", values?.amps);
    }
    if (values?.volts) {
      formdata.append("volts", values?.volts);
    }
    if (values?.depthactionvalue) {
      formdata.append("depth_action_value", values?.depthactionvalue);
    }
    if (values?.depth_action) {
      formdata.append("depth_action", values?.depth_action);
    }
    formdata.append("controller_id", controllerdata?.controller_id);
    handledimentionAddApi(formdata)
      .then((res) => {
        setEbs(!editEbs);
        toast.success(res?.data?.msg);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {
        // isloading(false)
      });
  };
  const handleShowAMCexpiryPopup = (data) => {
    data?.valve?.map((ele) => {
      if (ele.is_warning) {
        setexpiryModal({ show: true, UpdatedData: data });
      }
    });
    data?.flow_meter?.map((ele) => {
      if (ele.is_warning) {
        setexpiryModal({ show: true, UpdatedData: data });
      }
    });
    data?.tank?.map((ele) => {
      if (ele.is_warning) {
        setexpiryModal({ show: true, UpdatedData: data });
      }
    });
    if (data.is_warning) {
      setexpiryModal({ show: true, UpdatedData: data });
    }
  };
  const handleSetweeklySchedule = (timeList) => {
    let formattedList = timeList?.map((ele) => ({
      ...ele,
      weekly_schedule: WeeklyDaysList?.map((days, index) => ({
        ...days,
        status: parseInt(ele?.weekly_schedule?.split(",")[index]) ? 1 : 0
      }))
    }));

    setWeeklyTimeList(formattedList);
  };
  // silent=true is for the fast background poll below — skips the
  // loader spinner and anything that touches the edit form/one-time
  // popups, so a quiet refresh every few seconds can't stomp on an
  // in-progress edit or re-trigger a popup. handleApiDatas(data) (the
  // actual displayed readings/status) always runs either way — that's
  // the whole point of polling faster in the first place.
  const MotorController = (IsupdateWeeklyTime = false, silent = false) => {
    if (!silent) setloader(true);
    motordata(state?.id)
      .then(({ data }) => {
        setValueTimeList(data?.device_time_setting);
        handleApiDatas(data);

        // motordata() reads the Controller row straight from the DB —
        // for a not-yet-approved device that row's telemetry columns
        // (tower, r/y/b, etc.) are still empty, since the approval gate
        // blocks the normal ingestion write. Same live-preview overlay
        // ControllerDevice.js's grid already applies, so this page shows
        // the same numbers the card it was opened from just showed.
        if (data && data?.status !== 1 && data?.controller_code) {
          lastReceivedDataBatch([data.controller_code])
            .then(({ data: resp }) => {
              const preview = resp?.previews?.[data.controller_code];
              if (preview) {
                setcontroller((prev) => ({ ...prev, ...preview }));
              }
            })
            .catch(() => {});
        }

        if (data && !silent) {
          // setheight(data?.diameter);
          // setwidth(data?.length);
          setFieldValue("height", data?.length);
          setFieldValue("width", data?.diameter);
          setFieldValue("pressure", data?.pressure_value);
          setFieldValue("depthactionvalue", data?.depth_action_value);
          setFieldValue("depth_action", data?.depth_action);
          setFieldValue("power_usage", data?.power_usage);
          setFieldValue("amps", data?.amps);
          setFieldValue("volts", data?.volts);

          // setheight(data?.length);
          // setwidth(data?.diameter);
          // setPressure(data?.pressure_value);
        }

        if (!silent && (!valveTimeRef.current.value || IsupdateWeeklyTime)) {
          handleSetweeklySchedule(data?.device_time_setting);
        }
        if (!silent) {
          setNotificationAccess(data?.notification_access || []);
          if ((usertype === 2 || usertype === 3) && type === "initial") {
            handleShowAMCexpiryPopup(data);
          }
        }
        // navigate("/dashboard/details", { state: { data: data } });
      })
      .catch((err) => {
        if (err?.response?.detail) {
          toast("something went wrong", { type: "error" });
        }
      })
      .finally(() => {
        if (!silent) setloader(false);
      });
  };

  const handleValueChange = (value) => {
    setmoresetting({
      ...moresettingdata,
      DRT: dayjs(value).format("HH:mm:ss")
    });
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
                {/* <th>Created at</th> */}
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
                    {/* <td>{userdata.mobile_no}</td> */}
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
                // FIXED: no access_type check at all. "Add Service" is
                // an edit-type action — needs Control, blocked for
                // Operator too, not just View only. Button stays
                // visible but is blocked here, same rule as elsewhere.
                if (
                  controllerdata?.access_type === 2 ||
                  controllerdata?.access_type === 3
                ) {
                  return;
                }
                setaddmodal(true);
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
                        {service?.service_name}
                      </p>
                      {controllerdata?.access_type === 3 ||
                      controllerdata?.access_type === 2 ? null : (
                        <img
                          src={ExportedImages.EDIT_ICON_BLUE}
                          onClick={() => {
                            setLgShow({
                              show: true,
                              data: service
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
                        {service?.service_man_name}
                      </p>
                      <p className={devicestyle.controller_fault}>
                        {service?.created_at}
                      </p>
                    </div>
                    <div
                      className={`${devicestyle.fault_div_flex} service-div-flex`}
                    >
                      <p className={devicestyle.service_count}>
                        <span className={devicestyle.controller_fault}>
                          {service?.msg}
                        </span>
                      </p>
                      {controllerdata?.access_type === 3 ||
                      controllerdata?.access_type === 2 ? null : (
                        <FaTrashAlt
                          className="required"
                          onClick={() => {
                            setdeletemodal({
                              show: true,
                              serviceid: service?.service_id
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
              no data found
            </p>
          )}
        </div>
      </>
    );
  };

  const RefreshData = () => {
    let formData = new FormData();
    formData.append("controller_id", controllerdata?.controller_id);
    formData.append("controller_type", 1);
    formData.append("request_type", 2);
    buttonapi(formData);
  };

  // settingapi
  const toeditmotor = () => {
    if (motorset) {
      setloader(true);
      let formdata = {
        motor_mode: motorschedule?.motormode,
        allowed_running_hrs: motorschedule?.runhrs,
        // check_valve: CheckValveButton ? 1 : 0,
        check_valve:
          motorschedule?.motormode == 0 ||
          motorschedule?.motormode == 3 ||
          motorschedule?.motormode == 4
            ? 0
            : CheckValveButton
              ? 1
              : 0
      };
      editmotorsetting(state?.id, formdata)
        .then((res) => {
          toast(res?.data, { type: "success" });
          MotorController();
          RefreshData();
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
        })
        .finally(() => setloader(false));
    }
  };
  const hasMotorChanges = (oldArray, newArray, motor) => {
    if (!motor) return false; // Only check if motor is true

    const oldMap = new Map(
      oldArray?.map((item) => [item.time_setting_id, item])
    );
    const newMap = new Map(
      newArray?.map((item) => [item.time_setting_id, item])
    );

    for (const newItem of newArray) {
      const oldItem = oldMap.get(newItem.time_setting_id);
      if (oldItem) {
        if (oldItem.time1 !== newItem.time1 || oldItem.time2 !== newItem.time2)
          return true;
      } else {
        // Newly added item
        return true;
      }
    }

    for (const oldItem of oldArray) {
      if (!newMap.has(oldItem.time_setting_id)) {
        // Item removed
        return true;
      }
    }

    return false; // No changes detected
  };
  const getUpdatedDevices = (oldArray, newArray, type) => {
    const result = [];

    // Create maps for quick lookups
    const oldMap = new Map(
      oldArray?.map((item) => [item.time_setting_id, item])
    );
    const newMap = new Map(
      newArray?.map((item) => [item.time_setting_id, item])
    );

    // Check for modified or added devices
    newArray.forEach((newItem) => {
      const {
        device_id,
        time_setting_id,
        time1,
        time2,
        valve_mode,
        weekly_schedule
      } = newItem;
      const oldItem = oldMap.get(time_setting_id);

      if (oldItem) {
        // Check if device_id has changed
        if (oldItem.device_id !== device_id) {
          result.push(oldItem.device_id, device_id);
        }

        // Compare values based on valve_mode
        if (
          (valve_mode === 2 &&
            (oldItem.time1 !== time1 ||
              oldItem.time2 !== time2 ||
              oldItem.weekly_schedule !== weekly_schedule)) ||
          (valve_mode !== 2 &&
            (oldItem.time1 !== time1 || oldItem.time2 !== time2))
        ) {
          result.push(device_id);
        }
      } else {
        // Newly added item
        result.push(device_id);
      }
    });

    // Check for deleted items (present in oldArray but not in newArray)
    oldArray.forEach(({ device_id, time_setting_id }) => {
      if (!newMap.has(time_setting_id)) {
        result.push(device_id);
      }
    });

    return Array.from(new Set(result)); // Remove duplicates
  };

  const tovalveeditsave = () => {
    setloader(true);
    let WeeklyScheduleList = {
      key_value: weeklyTimeList
        ?.map((elem) => ({
          time_setting_id: elem?.time_setting_id ?? 0,
          device_id: elem?.device_id,
          device_name: elem?.device_name,

          time1: elem?.time1,
          time2: elem?.time2,
          valve_mode: elem?.valve_mode,
          timer_name: "",
          weekly_schedule: elem?.weekly_schedule
            ?.map((ele) => (ele?.status ? 1 : 0))
            .toString()
        }))
        .filter((ele) => ele?.valve_mode === 2)
    };

    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }
    abortcontroller = new AbortController();
    let UpdatedAutoSchedule = valvescheduleedit?.filter(
      (elem) => elem?.valve_mode !== 2
    );

    const edited_ids = getUpdatedDevices(timeSettingData?.valve, [
      ...WeeklyScheduleList?.key_value,
      ...UpdatedAutoSchedule
    ]);
    let formdata = {
      time_setting: {
        motor_schedule: motorschedule?.motormode,
        key_value: devicedata?.time_setting,
        edited_ids: []
      },
      device_time_settting: {
        motor_schedule: motorschedule?.motormode,
        check_valve:
          devicedata?.controller_setting?.check_valve !== null
            ? devicedata?.controller_setting?.check_valve
            : 0,
        valve_mode: 0,
        // valve_mode: ValveModeButton,
        key_value: [...UpdatedAutoSchedule, ...WeeklyScheduleList?.key_value],
        edited_ids: edited_ids
      }
    };

    editsettingapi(state?.id, formdata, abortcontroller)
      .then((res) => {
        toast(res?.data, { type: "success" });
        setvalvetime(false);
        // setTimeout(() => {
        MotorController("updateWeeklyTime");
        RefreshData();
        // }, 5000);
        setValveSchedulePending(true);
        setTimeout(() => setValveSchedulePending(false), 30000);
      })
      .catch((err) => {
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
  };

  const toeditmotorsch = () => {
    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }

    abortcontroller = new AbortController();
    // Weekly Schedule
    let WeeklyScheduleList = {
      key_value: timesetting
        ?.map((elem) => ({
          time_setting_id: elem?.time_setting_id ?? 0,
          device_id: elem?.device_id,
          device_name: elem?.device_name,

          time1: elem?.time1,
          time2: elem?.time2,
          valve_mode: elem?.valve_mode,
          timer_name: "",
          weekly_schedule: elem?.weekly_schedule
        }))
        .filter((ele) => ele?.valve_mode === 2)
    };

    // Auto Schedule
    let UpdatedAutoSchedule = timesetting?.filter(
      (elem) => elem?.valve_mode !== 2
    );
    // edited_ids was hardcoded to [] here — the backend only actually
    // pushes/persists a valve device's new schedule over MQTT when its id
    // is in this list (device.py's "if ids in edited_device:" gate). With
    // it always empty, saving from this combined Motor Schedule button
    // (the only place the check valve toggle lives) silently never sent
    // the valve weekly schedule to the device at all — it just looked
    // like it saved, matching devices reporting back an all-zero
    // schedule regardless of what was actually entered. Compute it the
    // same way tovalveeditsave() above does, by diffing old vs new.
    const valveEditedIds = getUpdatedDevices(timeSettingData?.valve, [
      ...UpdatedAutoSchedule,
      ...WeeklyScheduleList?.key_value
    ]);
    let formdata = {
      time_setting: {
        motor_schedule: motorschedule?.motormode,
        key_value: motorscheduleedit,
        edited_ids:
          devicedata?.controller_setting?.check_valve !== CheckValveButton ||
          hasMotorChanges(devicedata?.time_setting, motorscheduleedit, true)
            ? [devicedata?.controller_id]
            : []
      },
      device_time_settting: {
        motor_schedule: motorschedule?.motormode,
        check_valve:
          devicedata?.controller_setting?.check_valve !== null
            ? devicedata?.controller_setting?.check_valve
            : 0,
        check_valve: CheckValveButton ? 1 : 0,
        valve_mode: 0,
        // valve_mode: devicedata?.valve_status,
        key_value: [...UpdatedAutoSchedule, ...WeeklyScheduleList?.key_value],
        edited_ids: valveEditedIds
      }
    };

    editsettingapi(state?.id, formdata, abortcontroller)
      .then((res) => {
        setmotortime(false);
        toast(res.data, { type: "success" });
        MotorController();
        RefreshData();
        setMotorSchedulePending(true);
        setTimeout(() => setMotorSchedulePending(false), 30000);
      })
      .catch((err) => {
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else if (err?.config?.signal?.reason == "error cancelled") {
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      });
  };

  const toeditmorestting = (id, accesstype) => {
    if (editsetting) {
      setloader(true);

      let formdata = {
        notification_alert: buttonstate ? 1 : 0,
        lv: moresettingdata?.LV,
        hv: moresettingdata?.HV,
        pf: moresettingdata?.pf,
        dry_amps: moresettingdata?.Dry,
        ol_amps: moresettingdata?.OL,
        low_volt_diff: moresettingdata?.LV_diff,
        high_volt_diff: moresettingdata?.HV_diff,
        dry_2ph: moresettingdata?.Dry2ph,
        e_starter: moresettingdata?.E_starter,
        float: moresettingdata?.Float,
        ph_mode: moresettingdata?.ph,
        sd_sec: moresettingdata?.SD,
        dry_sense_delay: moresettingdata?.DSD,
        dry_reset_time: moresettingdata?.DRT,
        offd: moresettingdata?.Offd,
        voltage: moresettingdata?.Voltage,
        current: moresettingdata?.current,
        continuous: moresettingdata?.continues,
        volt_display: moresettingdata?.voldisplay,
        over_load_2ph: moresettingdata?.Ol2ph
      };
      // These fields are Optional[float]/Optional[int] on the backend
      // (accepts a real number OR null) — but a blank/cleared input in
      // React state holds "" (empty string), not null. Pydantic can't
      // match "" to either the number type or None, and reports the
      // *last* option it tried: "Input should be None". Convert blanks
      // to null here so an intentionally-cleared field is sent the way
      // the backend actually expects "no value" to look.
      Object.keys(formdata).forEach((key) => {
        if (formdata[key] === "") formdata[key] = null;
      });
      editmotorsetting(state?.id, formdata)
        .then((res) => {
          toast(res?.data, { type: "success" });

          MotorController();
          RefreshData();
        })
        .catch((err) => {
          setedit(true);
          // toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setloader(false));
    }
  };

  const handleTabView = (tabdata) => {
    sethistoryview({ ...tabdata });
    historyRef.current = { ...tabdata };
  };
  const checknum = (dsd_value) => {
    setmoresetting({
      ...moresettingdata,
      DSD: dsd_value <= 60 ? dsd_value : ""
    });
  };

  // const Changebutton = (id, togglestatus, accesstype, buttontype) => {
  //   if (abortcontroller) {
  //     abortcontroller.abort("error cancelled");
  //   }

  //   abortcontroller = new AbortController();
  //   if (
  //     accesstype === 0 ||
  //     accesstype === 1 ||
  //     accesstype === null ||
  //     accesstype === 2
  //   ) {
  //     if (buttontype === 1) {
  //       let formData = new FormData();
  //       formData.append("controller_id", id);
  //       formData.append("controller_type", 1);
  //       formData.append("request_type", togglestatus ? 3 : 4);
  //       setbuttongreyid(id);
  //       buttonapi(formData, abortcontroller)
  //         .then(({ data }) => {
  //           setTimeout(() => {
  //             MotorController();
  //             setbuttongreyid("");
  //           }, 5000);
  //         })
  //         .catch((err) => {
  //           getCatchMsg(err);
  //         });
  //     } else {
  //       let formData = new FormData();
  //       formData.append("device_id", id);
  //       formData.append("device_type", 3);
  //       formData.append("request_type", togglestatus ? 3 : 4);
  //       setbuttongreyid(id);
  //       devicerefreshapi(formData, abortcontroller)
  //         .then((res) => {
  //           if (res?.data?.status === 1) {
  //             setTimeout(() => {
  //               MotorController();
  //               setbuttongreyid("");
  //             }, 5000);
  //             // toast.success(res?.data?.msg);
  //           }
  //         })
  //         .catch((err) => {
  //           // getCatchMsg(err);
  //         })
  //         .finally(() => {});
  //     }
  //   }
  // };

  // Called after an ON/OFF command is sent — the motor's real response
  // time varies (measured: OFF ~2s, ON ~10s, occasionally longer). Stop
  // the moment the real status already matches what was requested
  // (checked via controllerdataRef, updated by the previous tick's
  // fetch) instead of always waiting out a fixed window — the common
  // fast case (OFF) then resolves in ~2-4s instead of always taking the
  // full worst-case wait. 20s cap covers the slow case too.
  const pollAfterButtonPress = (expectedStatus) => {
    let checks = 0;
    // Was 10 (20s) — live trace showed the motor sometimes takes LONGER
    // than 20s to actually switch, so this window gave up and fell back
    // to the still-true-at-that-moment-but-about-to-change OFF value
    // before the real change landed a few seconds later — correct at
    // every instant, but looked like a flip. 20 checks/40s covers that.
    const maxChecks = 20; // 20 x 2s = 40s cap
    const finishPolling = () => {
      clearInterval(pollInterval);
      setbuttongreyid("");
      setPendingToggleStatus(null);
      buttonProcessingRef.current = false;
    };
    const pollInterval = setInterval(() => {
      checks += 1;
      const realStatus = controllerdataRef.current?.controller_status === 1;
      if (realStatus === expectedStatus) {
        finishPolling(); // already confirmed by the previous tick's fetch — no need to wait further
        return;
      }
      // silent=true — without it this defaults to showing the full-page
      // loading spinner on every one of these background refetches,
      // which is exactly the "loading circle flashes at center every
      // ~10s" symptom reported. The toggle's own grey state is already
      // the loading indicator for this; no need for the page-wide one.
      MotorController(false, true);
      if (checks >= maxChecks) {
        finishPolling();
      }
    }, 2000);
  };

  const Changebutton = (id, togglestatus, accesstype, buttontype) => {
    if (buttonProcessingRef.current) {
      return; // already processing — checked via ref (updates
      // synchronously), not buttongreyid (state, updates next render),
      // so a second tap landing before the first render commits still
      // gets blocked instead of firing a second command.
    }

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
      buttonProcessingRef.current = true;
      setbuttongreyid(id); // 🔒 LOCK immediately
      setPendingToggleStatus(togglestatus); // show the requested state right away, greyed out

      // Tank is already at/above the high limit (configured to turn the
      // motor off) and the user just pressed ON — the merge will
      // re-send OFF on the very next tank reading, so this click won't
      // "stick". Let the user know why instead of leaving them to
      // wonder why it flips back.
      // Uses tankdata (the merged tank device's own low_limit/high_limit/
      // *_action/tank_level) — not MergeSettingData, which comes from a
      // separate ControllerMerge record that isn't what tank_handler.py
      // actually reads to decide auto ON/OFF (that reads the tank
      // Device row's own fields, exactly what tankdata carries).
      const mergedTank = tankdata?.[0];
      if (
        buttontype === 1 &&
        togglestatus &&
        mergedTank?.tank_level != null &&
        mergedTank?.high_limit != null &&
        mergedTank?.high_limit_action === 1 &&
        Number(mergedTank.tank_level) >= Number(mergedTank.high_limit)
      ) {
        toast("Tank is full — controller will turn OFF automatically", {
          type: "warning"
        });
      }

      if (buttontype === 1) {
        let formData = new FormData();
        formData.append("controller_id", id);
        formData.append("controller_type", 1);
        formData.append("request_type", togglestatus ? 3 : 4);

        buttonapi(formData, abortcontroller)
          .then(() => {
            // Was a single setTimeout (5000ms, then 11000ms) — but
            // measured live that the motor's real response time varies
            // by direction (OFF ~2s, ON ~10s for this hardware), so any
            // single fixed wait either shows stale data (too short) or
            // makes the fast case feel needlessly slow (too long).
            // Instead, poll a few times at short intervals — the button
            // updates as soon as whichever change actually lands.
            pollAfterButtonPress(togglestatus);
          })
          .catch((err) => {
            getCatchMsg(err);
            setbuttongreyid("");
            setPendingToggleStatus(null);
            buttonProcessingRef.current = false;
          });
      } else {
        let formData = new FormData();
        formData.append("device_id", id);
        formData.append("device_type", 3);
        formData.append("request_type", togglestatus ? 3 : 4);

        devicerefreshapi(formData, abortcontroller)
          .then((res) => {
            if (res?.data?.status === 1) {
              pollAfterButtonPress(togglestatus);
            } else {
              setbuttongreyid("");
              setPendingToggleStatus(null);
              buttonProcessingRef.current = false;
            }
          })
          .catch(() => {
            setbuttongreyid("");
            setPendingToggleStatus(null);
            buttonProcessingRef.current = false;
          });
      }
    }
  };

  const loadingspinner = (accesstype, requesttypedata, id, devicetype) => {
    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }

    abortcontroller = new AbortController();

    if (
      requesttypedata === 1 &&
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
      formData.append("device_type", devicetype);
      formData.append("request_type", 2);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            MotorController();
            setlocation();
          }, 5000);
        })
        .catch((err) => {
          getCatchMsg(err);
        });
    } else if (requesttypedata === 2) {
      // FIXED: the "Settings" button (tank/valve/flow refresh, sends
      // request_type=2) had no access_type check at all. This is an
      // "edit" action — needs Control (1), blocked for both Operator
      // (2) and View only (3). Backend now rejects it (403) too, but
      // block it here first so it doesn't even round-trip.
      if (accesstype === 2 || accesstype === 3) {
        return;
      }
      setspinnerindevice(true);
      setTimeout(() => {
        setspinnerindevice(false);
      }, 3000);

      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", devicetype);
      formData.append("request_type", 2);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            MotorController();
          }, 5000);
        })
        .catch((err) => {
          getCatchMsg(err);
        });
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
      }, 3000);

      let formData = new FormData();
      formData.append("controller_id", id);
      formData.append("controller_type", 1);
      formData.append("request_type", 2);

      buttonapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            MotorController();
            setlocation("");
          }, 5000);
        })
        .catch((err) => {
          getCatchMsg(err);
        });
    } else if (requesttypedata === 4 || requesttypedata === 5) {
      // FIXED: same missing access_type check as the request_type===2
      // branch above — this also sends request_type=2 under the hood,
      // so the same Control-only rule applies.
      if (accesstype === 2 || accesstype === 3) {
        return;
      }
      if (requesttypedata === 4) {
        setsettingloading(true);
        setTimeout(() => {
          setsettingloading(false);
        }, 3000);
      } else if (requesttypedata === 5) {
        setsettingloadingTwo(true);
        setTimeout(() => {
          setsettingloadingTwo(false);
        }, 3000);
      }

      let formData = new FormData();
      formData.append("controller_id", id);
      formData.append("controller_type", 1);
      formData.append("request_type", 2);
      buttonapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            MotorController();
          }, 5000);
        })
        .catch((err) => {
          getCatchMsg(err);
        });
    } else if (requesttypedata === 6) {
      setcondataloading(true);
      // setlocation(1);
      setTimeout(() => {
        setcondataloading(false);
      }, 3000);

      let formData = new FormData();
      formData.append("controller_id", id);
      formData.append("controller_type", 1);
      formData.append("request_type", 1);

      buttonapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            MotorController();
            // setlocation("");
          }, 5000);
        })
        .catch((err) => {
          getCatchMsg(err);
        });
    }
    if (requesttypedata === 7) {
      setloading(true);
      setTimeout(() => {
        setloading(false);
      }, 3000);
      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", devicetype);
      formData.append("request_type", 1);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            MotorController();
            setlocation();
          }, 5000);
        })
        .catch((err) => {
          getCatchMsg(err);
        });
    }
  };

  const handleRefreshAllTimeSettings = () => {
    setValveTimeSettingLoader(true);
    let formData = new FormData();
    formData.append("device_type", 3);
    formData.append("request_type", 5);
    formData.append("controller_id", controllerdata?.controller_id);

    devicerefreshapi(formData, abortcontroller)
      .then(({ data }) => {
        setTimeout(() => {
          MotorController();
          setValveTimeSettingLoader(false);
        }, 5000);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {});
  };
  const Edittankdetail = (device_id) => {
    if (edittank) {
      setloader(true);
      let tankdetail = {
        device_name: tankinputdata.devicename,
        low_limit: tankinputdata.lowlomit,
        high_limit:
          tankinputdata.highlimit !== "" ? tankinputdata.highlimit : null,
        tank_height: tankinputdata.tankheight,
        tank_width: tankinputdata.tank_width,
        latitude: tankinputdata.latitude,
        longitude: tankinputdata.longitude,
        is_fixed: tankinputdata?.is_fixed ? tankinputdata?.is_fixed : 0,
        low_limit_action: tankinputdata.lowlimitaction,
        high_limit_action: tankinputdata.highlimitaction,
        default_level: tankinputdata.default_level || 0,
        notification_alert: tankinputdata?.notification_alert || 0,
        status: 1
      };
      if (!tankdetail.tank_width) {
        delete tankdetail.tank_width;
      }
      editdevice(tankdetail, device_id)
        .then(({ data }) => {
          MotorController();
          toast(data, { type: "success" });
          let formData = new FormData();
          formData.append("device_id", device_id);
          formData.append("device_type", 1);
          formData.append("request_type", 2);
          devicerefreshapi(formData);
        })
        .catch((err) => {
          settank(true);
          // toast("High Limit and Low Limit required", { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setloader(false));
    }
  };

  const Editflowdetail = (device_id) => {
    if (editflow) {
      setloader(true);
      let flowdatail = {
        device_name: flowinputdata.devicename,
        usage_limit_action: flowinputdata.usagelimitaction,
        usage_limit:
          flowinputdata.usagelimit != ""
            ? JSON.parse(flowinputdata.usagelimit)
            : flowinputdata.usagelimit,
        daily_update:
          flowinputdata.dailyupdate != ""
            ? JSON.parse(flowinputdata.dailyupdate)
            : flowinputdata.dailyupdate,
        longitude: flowinputdata.longitude,
        latitude: flowinputdata.latitude,
        is_fixed: flowinputdata?.is_fixed ? flowinputdata?.is_fixed : 0,
        notification_alert: flowinputdata?.notification_alert || 0,
        status: 1
      };

      editdevice(flowdatail, device_id)
        .then(({ data }) => {
          MotorController();
          toast(data, { type: "success" });
          let formData = new FormData();
          formData.append("device_id", device_id);
          formData.append("device_type", 2);
          formData.append("request_type", 2);
          devicerefreshapi(formData);
        })
        .catch((err) => {
          setflow(true);
          // toast("Usage Limit and Daily Update required", { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setloader(false));
    }
  };

  const EditDeviceSetting = (valve) => {
    // UpdateDeviceTimeSetting()
  };
  const Editvalvedetail = (device_id) => {
    if (editvalve) {
      setloader(true);
      let valvedetail = {
        device_name: valveinputdata.devicename,
        latitude: valveinputdata.latitude,
        longitude: valveinputdata.longitude,
        valve_mode:
          typeof valveinputdata?.valve_mode === "string"
            ? parseInt(valveinputdata?.valve_mode)
            : valveinputdata?.valve_mode,
        is_fixed: valveinputdata?.is_fixed ? valveinputdata?.is_fixed : 0,
        notification_alert: valveinputdata?.notification_alert || 0,
        status: 1
      };
      editdevice(valvedetail, device_id)
        .then(({ data }) => {
          MotorController();
          toast(data, { type: "success" });
          let formData = new FormData();
          formData.append("device_id", device_id);
          formData.append("device_type", 3);
          formData.append("request_type", 2);
          devicerefreshapi(formData);
        })
        .catch((err) => {
          setvalve(true);
          // toast("Usage Limit required", { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setloader(false));
    }
  };

  const EditMultiDevicedetail = (device_id) => {
    if (editMultiDevice) {
      setloader(true);
      let finalObj = {
        device_name: multiDeviceInputData.devicename,
        latitude: multiDeviceInputData.latitude,
        longitude: multiDeviceInputData.longitude,
        is_fixed: multiDeviceInputData?.is_fixed
          ? multiDeviceInputData?.is_fixed
          : 0,
        notification_alert: multiDeviceInputData?.notification_alert || 0,
        status: 1
      };

      editdevice(finalObj, device_id)
        .then(({ data }) => {
          MotorController();
          toast(data, { type: "success" });
          let formData = new FormData();
          formData.append("device_id", device_id);
          formData.append("device_type", 5);
          formData.append("request_type", 2);
          devicerefreshapi(formData);
        })
        .catch((err) => {
          setEditMultiDevice(true);
          getCatchMsg(err);
        })
        .finally(() => setloader(false));
    }
  };
  const toshow = () => {
    if (!editstate) {
      setgroup(true);
    }
  };

  const todashboard = () => {
    // FIXED: this page can be reached without the list page having set
    // "controllerdetailspage" first (e.g. a card that links straight
    // here without going through that flow) — navigate(undefined) then
    // left the router in a broken state, and the next mount effect that
    // read a now-missing id (handleGetHistory, etc.) crashed the whole
    // app. Fall back to the controller grid instead of trusting the key
    // is always there.
    navigate(controllerdetailspage || "/dashboard/controllerdevice");
    sessionStorage.removeItem("controllerpage");
  };

  const toedit = () => {
    if (!editstate) {
      let editdata = {
        controller_name: contname,
        topic: topic,
        status: 1,
        eb_number: controllerdata?.eb_number,
        latitude: controllerdata?.latitude,
        longitude: controllerdata?.longitude,
        msg: controllerdata?.msg,
        is_fixed: controllerdata?.is_fixed ? controllerdata?.is_fixed : 0,
        lora_status: lorastate ? 1 : 0
      };
      editcontroller(state?.id, editdata)
        .then((res) => {
          MotorController();
          toast(res?.data, { type: "success" });
        })
        .catch((err) => {
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
        controllerid: controllerdata?.controller_id,
        page: state?.page,
        ControllerFilters: state?.ControllerFilters
      }
    });
    sessionStorage.setItem("controllerpage", "/dashboard/details");
  };

  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };

  const toediteb = () => {
    if (editEb) {
      let ebedit = {
        controller_name: controllerdata?.controller_name,
        eb_number: ebdata?.ebval,
        topic: controllerdata?.topic,
        latitude: ebdata?.lat,
        longitude: ebdata?.lan,
        is_fixed: ebdata?.is_fixed ? ebdata?.is_fixed : 0,
        status: 1,
        msg: controllerdata?.msg,
        lora_status: controllerdata?.lora_status
      };
      editcontroller(state?.id, ebedit)
        .then((res) => {
          MotorController();
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

  const ToDeletedevice = () => {
    navigate("/dashboard/deletedevice", {
      state: {
        controllerid: controllerdata.controller_id,
        ControllerFilters: state?.ControllerFilters
      }
    });
  };

  const handleMergeController = () => {
    let formdata = new FormData();
    formdata.append("controller_id", controllerdata?.controller_id);
    formdata.append(
      "device_id",
      mergeControllerDeviceID
        ? mergeControllerDeviceID
        : mergeConfirmation?.device_id
    );

    MergerControllerService(formdata)
      .then((result) => {
        if (result.data?.status === 1) {
          toast.success(result?.data?.msg);
          setMergerController({
            device_id: "",
            device_code: "",
            is_tank: false,
            action: ""
          });
          setmergeConfirmation({
            action: "",
            show: false,
            merge_id: "",
            tankdata: ""
          });
          MotorController();
        } else {
          toast.error(result?.data?.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  const handleMergeDevice = () => {
    let formdata = new FormData();

    formdata.append(
      "parent_device_id",
      devicemergeConfirmation?.data
      // mergeSingleDeviceID ? mergeSingleDeviceID : mergerDevice?.parent_device_id
    );
    formdata.append(
      "child_device_id",
      mergeSingleDeviceID
      // mergeMultiDeviceID ? mergeMultiDeviceID : mergerDevice?.child_device_id
    );

    MergerDeviceService(formdata)
      .then((result) => {
        if (result.data?.status === 1) {
          toast.success(result?.data?.msg);
          setMergerDevice({
            child_device_id: "",
            child_device_code: "",
            is_tank: false,
            action: "",
            parent_device_id: ""
          });
          setdevicemergeConfirmation({
            type: "",
            action: "",
            show: false,
            merge_id: "",
            tankdata: ""
          });
          MotorController();
        } else {
          toast.error(result?.data?.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  const handleDeleteMergeController = (merge_id, type) => {
    let formdata = new FormData();
    formdata.append("merge_id", merge_id);
    formdata.append("merge_type", !type ? 1 : 2);
    DeleteMergerService(formdata)
      .then((result) => {
        if (result.data?.status === 1) {
          toast.success(result.data.msg);
          if (type) {
            setMergerDevice({
              device_id: "",
              device_code: "",
              is_tank: false,
              action: ""
            });
            setdevicemergeConfirmation({
              type: "",
              action: "",
              show: false,
              merge_id: "",
              tankdata: ""
            });
            setDeviceMergeSettingData((pre) => ({
              ...pre,
              isEdit: false
            }));
          } else {
            setMergerController({
              device_id: "",
              device_code: "",
              is_tank: false,
              action: ""
            });
            setmergeConfirmation({
              action: "",
              show: false,
              merge_id: "",
              tankdata: ""
            });
          }

          MotorController();
        } else {
          toast.error(result.data.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };
  const checkIsEditEnabled = (item) => {
    return editMultiDeviceChild?.isEdit &&
      editMultiDeviceChild?.device_id === item?.device_id
      ? true
      : false;
  };

  const HandlecheckDeviceType = (code, type) => {
    let formdata = new FormData();
    formdata.append("product_code", code);
    formdata.append("for_merge", 1);
    checkproduct(formdata)
      .then((res) => {
        if (res?.data?.error === 0) {
          if (res?.data?.device_type === 1 || res?.data?.device_type === 2) {
            if (type) {
              setMergerDevice((pre) => ({
                ...pre,
                child_device_id: res?.data?.device_id
              }));
              setdevicemergeConfirmation((pre) => ({
                ...pre,
                tankdata: res.data,
                action: "merge",
                child_device_id: res?.data?.device_id,
                show: true
              }));
            } else {
              if (res?.data?.device_type === 1) {
                setmergeConfirmation((pre) => ({
                  ...pre,
                  show: true,
                  tankdata: res.data,
                  action: "merge",
                  device_id: res.data?.device_id
                }));
              }
            }
          } else if (res?.data?.device_type === 5) {
            if (type) {
              setMergerDevice((pre) => ({
                ...pre,
                child_device_id: res?.data?.device_id
              }));
              setdevicemergeConfirmation((pre) => ({
                ...pre,
                tankdata: {
                  ...res.data,
                  child_device: res?.data?.child_device?.filter(
                    (ele) => ele?.device_type === 1 || ele?.device_type === 2
                  )
                },
                action: "",
                child_device_id: res?.data?.device_id,
                show: false
              }));
            } else {
              setmergeConfirmation((pre) => ({
                ...pre,
                show: false,
                tankdata: {
                  ...res.data,
                  child_device: res?.data?.child_device?.filter(
                    (ele) => ele?.device_type === 1
                  )
                },
                action: "",
                device_id: res.data?.device_id
              }));
            }

            return;
          } else {
            toast.error("Invalid device type");
          }
        } else if (res?.data?.error === 1) {
          toast.error(res?.data?.msg);
        } else {
          toast("Something went wrong!!!", { type: "error" });
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {
        setMergeControllerDeviceID("");
        setMergeMultiDeviceID("");
        // setMergeSingleDeviceID("");
      });
  };

  const handleUpdateMergeSettings = (for_type, device_type = 0) => {
    let formData = new FormData();
    let SettinData = for_type === 1 ? MergeSettingData : DeviceMergeSettingData;
    formData.append(
      "merge_id",
      for_type === 1
        ? controllerdata?.controllerMerge?.id
        : DeviceMergeSettingData?.merge_id
    );
    if (for_type) {
      formData.append("for_type", for_type);
    }
    if (device_type === 0 || device_type === 1) {
      if (SettinData?.high_limit) {
        formData.append("high_limit", SettinData?.high_limit);
      }
      if (SettinData?.low_limit) {
        formData.append("low_limit", SettinData?.low_limit);
      }
      if (SettinData.high_limit_action !== null) {
        formData.append("high_limit_action", SettinData.high_limit_action);
      }
      if (SettinData.low_limit_action !== null) {
        formData.append("low_limit_action", SettinData.low_limit_action);
      }
    } else {
      if (for_type === 2 && SettinData?.usage_limit_action !== null) {
        formData.append("usage_limit_action", SettinData?.usage_limit_action);
      }
    }
    UpdateMergeSettingService(formData)
      .then((res) => {
        if (res.data?.status === 1) {
          toast.success(res?.data?.msg);
          if (for_type === 1) {
            setMergeSettingData((pre) => ({
              high_limit: "",
              low_limit: "",
              high_limit_action: "",
              low_limit_action: "",
              isEdit: false
            }));
          } else {
            setDeviceMergeSettingData((pre) => ({
              high_limit: "",
              low_limit: "",
              high_limit_action: "",
              low_limit_action: "",
              usage_limit_action: "",
              isEdit: false
            }));
          }
          MotorController();
        } else {
          toast.error(res.data.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };
  useEffect(() => {
    valveTimeRef.current.value = valvetime;
  }, [valvetime]);
  useEffect(() => {
    motorTimeRef.current.value = motortime;
  }, [motortime]);
  useEffect(() => {
    editsettingRef.current.value = editsetting;
  }, [editsetting]);
  useEffect(() => {
    motorsetRef.current.value = motorset;
  }, [motorset]);
  useEffect(() => {
    editEbsRef.current.value = editEbs;
  }, [editEbs]);
  useEffect(() => {
    editstateRef.current.value = editstate;
  }, [editstate]);

  const mergeDeviceLength = (valve) => valve.deviceMerge?.length == 2;

  const getUpdatingFields = () => {
    let editedDevice = editMultiDeviceChild?.editData;
    if (editMultiDeviceChild?.editData?.device_type === 1) {
      return {
        device_name: editedDevice?.device_name,
        low_limit: editedDevice?.low_limit,
        high_limit:
          editedDevice?.high_limit !== "" ? editedDevice?.high_limit : null,
        low_limit_action: editedDevice?.low_limit_action,
        high_limit_action: editedDevice?.high_limit_action,
        tank_height: editedDevice?.tank_height,
        tank_width: editedDevice?.tank_width,
        default_level: editedDevice?.default_level || 0,
        status: 1
      };
    } else if (editMultiDeviceChild?.editData?.device_type === 2) {
      return {
        device_name: editedDevice?.device_name || "",
        usage_limit: editedDevice?.usage_limit || 0,
        usage_limit_action: editedDevice?.usage_limit_action || 0,
        status: 1
      };
    } else if (editMultiDeviceChild?.editData?.device_type === 3) {
      return {
        device_name: editedDevice?.device_name,

        status: 1,

        valve_mode: editedDevice?.valve_mode || 0
      };
    } else {
      return {};
    }
  };

  const handleEditMultiDeviceChildItem = () => {
    setloader(true);
    editdevice(getUpdatingFields(), editMultiDeviceChild?.device_id)
      .then(({ data }) => {
        MotorController();
        setEditMultiDeviceChild({
          isEdit: false,
          device_id: null,
          editData: {}
        });
        toast(data, { type: "success" });
        let formData = new FormData();
        formData.append("device_id", editMultiDeviceChild?.device_id);
        formData.append("device_type", editMultiDeviceChild?.device_type);
        formData.append("request_type", 2);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  const getMultiDeviceCount = (type = "", data, isChart = false) => {
    const dataMap = {
      all: (ele) => [
        ...(ele?.valve_data || []),
        ...(ele?.level_data || []),
        ...(ele?.flow_data || [])
      ],
      tank: (ele) => ele?.level_data || [],
      flow: (ele) => ele?.flow_data || [],
      valve: (ele) => ele?.valve_data || []
    };

    const currentData = data || devicedata;

    const multiData =
      currentData?.multi?.flatMap(dataMap[type] || (() => [])) || [];

    return multiData;
  };

  const handleChangeControllerCode = () => {
    let formData = new FormData();
    formData.append("controller_id", isEditControllerCode?.item?.controllerID);
    formData.append(
      "controller_code",
      isEditControllerCode?.editedControllerCode
    );
    // let finalOBJ = {
    //   controller_id: isEditControllerCode?.item?.controllerID,
    //   controller_code: isEditControllerCode?.item?.controllerCode,
    // };

    UpdateControllerCode(formData)
      .then((res) => {
        // if (res?.data?.status === 1) {
        MotorController();
        toast.success(res?.data);
        setIsEditControllerCode({
          isEdit: false,
          item: { controllerCode: "", controllerID: "" },
          editedControllerCode: "",
          isShowModal: false
        });

        // } else {
        //   toast.error(res?.data?.msg);
        // }
      })
      .catch((err) => {
        setIsEditControllerCode((pre) => {
          return {
            ...pre,
            isShowModal: false
          };
        });
        getCatchMsg(err);
      });
  };

  // Common reusable function
  const getPermissionDetailsById = (permissions, id) => {
    if (!Array.isArray(permissions)) return null;

    const item = permissions.find(
      (p) => p.permission_id === id && p.status === 1
    );

    return item
      ? { title: item.title, permission_id: item.permission_id }
      : null;
  };

  // The R/Y/B electrical-readings block below used to gate purely on
  // software_version (its first digit tells 1-phase vs 3-phase) — but
  // that field only ever gets set by a separate settings-sync (c0=102)
  // message, completely independent of whether real r/y/b telemetry
  // exists (c0=100). A controller can have live, accurate r/y/b data
  // (confirmed against the list screen's own already-fixed cards) and
  // still never have received a settings-sync, hiding the whole panel.
  // Same fix as Motorcontrolleron.js/ProductionControllerDetails.js: show
  // it whenever real r/y/b values are present, falling back to 3-phase
  // display when software_version isn't known (the payload always
  // carries all three m1/m2/m3 sub-values regardless of phase count).
  const swPhaseDigit = controllerdata?.software_version
    ? parseInt(String(controllerdata.software_version).charAt(0))
    : null;
  const showElectricalReadings =
    controllerdata?.r != null && controllerdata?.r !== ""
      ? true
      : swPhaseDigit === 1 || swPhaseDigit === 3;
  const showThreePhase =
    swPhaseDigit === 3 ||
    (swPhaseDigit === null &&
      controllerdata?.y != null &&
      controllerdata?.y !== "");

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
      {mergeConfirmation.show && (
        <MergeConfirmationModal
          show={mergeConfirmation.show}
          close={() => {
            setmergeConfirmation((pre) => ({
              ...pre,
              show: false
            }));
          }}
          data={mergeConfirmation.tankdata}
          msg={
            mergeConfirmation?.action === "delete"
              ? "Are you sure you want to remove the merged device?"
              : "Are you sure you want to merge this device to the Controller?"
          }
          onOk={() => {
            if (mergeConfirmation?.action === "merge") {
              handleMergeController();
            } else if (mergeConfirmation?.action === "delete") {
              handleDeleteMergeController(mergeConfirmation.merge_id);
            }
          }}
        />
      )}
      {devicemergeConfirmation.show && (
        <MergeConfirmationModal
          show={devicemergeConfirmation.show}
          close={() => {
            setdevicemergeConfirmation((pre) => ({
              ...pre,
              show: false
            }));
          }}
          data={devicemergeConfirmation.tankdata}
          msg={
            devicemergeConfirmation?.action === "delete"
              ? "Are you sure you want to remove the merged device?"
              : "Are you sure you want to merge this device to the valve?"
          }
          onOk={() => {
            if (devicemergeConfirmation?.action === "merge") {
              handleMergeDevice();
            } else if (devicemergeConfirmation?.action === "delete") {
              handleDeleteMergeController(
                devicemergeConfirmation.merge_id,
                "device"
              );
            }
          }}
        />
      )}
      {group ? (
        <Changegroup
          show={group}
          close={() => setgroup(false)}
          controller={controllerdata}
          pevid={pevid}
          LightController={MotorController}
        />
      ) : null}

      <div className="motorbackground_images">
        <div className="router-pages">
          <div className={commonstyle.controller_head}>
            <div className="pre-page">
              <FaArrowLeft
                className="arrow total_head"
                onClick={() => todashboard()}
              />

              <p className="controller-name total_head">Motor Controller</p>
            </div>
            <div className={commonstyle.cnt_buttons}>
              {controllerdata?.access_type == 3 ||
              controllerdata?.access_type == 2 ? null : (
                <div className="cnt-buttons">
                  <button
                    type="button"
                    className="dev-add-btn"
                    onClick={() => toadd()}
                  >
                    Add device
                  </button>
                </div>
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
                controllerdata?.amc_status < 1 &&
                (usertype === 3 || usertype === 2)
                  ? "BlurViewContainer"
                  : ""
              }
            >
              <div className="controller-view">
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
                    {controllerdata?.access_type == 3 ||
                    controllerdata?.access_type == 2 ? null : (
                      <img
                        src={
                          editstate
                            ? ExportedImages.EDIT_ICON_BLACK
                            : ExportedImages.SAVE_ICON_BLUE
                        }
                        alt="edit"
                        onClick={() => {
                          toedit();
                          seteditstate(!editstate);
                        }}
                        className="pointerCurser"
                      />
                    )}
                  </div>

                  {controllerdata?.controller_code ? (
                    <div className="motor-btn">
                      {condataloading &&
                      controllerdata?.controller_id === deviceid ? (
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
                              type.requesttypeSix,
                              controllerdata?.controller_id
                            );
                            setdeviceid(controllerdata?.controller_id);
                            // setindex(index)
                          }}
                        />
                      )}
                      {controllerdata?.tower ? (
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
                      )}
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
                        disabled={
                          controllerdata?.controller_id === buttongreyid
                        }
                        isChecked={pendingToggleStatus}
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
                      controllerdata?.access_type === null ||
                      controllerdata?.access_type === 1 ||
                      controllerdata?.access_type === 2 ||
                      controllerdata?.access_type === 3 ? (
                      controllerdata?.controller_code ? (
                        <Toggle
                          // id={index}
                          disabled={
                            controllerdata?.controller_id === buttongreyid
                          }
                          isChecked={
                            controllerdata.controller_status === 1
                              ? true
                              : false
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

                    {/* <div className="status-update p0"> */}
                    {/* LOADING IMAGE */}

                    {/* END */}
                    <div>
                      <p className="tank-header">status update</p>
                      <p className="tank-date">
                        {controllerdata?.status_change_time
                          ? controllerdata?.status_change_time
                          : null}
                      </p>
                      {/* </div> */}
                    </div>
                  </div>
                ) : null}
                {controllerdata?.controller_code ? (
                  <p className="line motorLine One"></p>
                ) : null}
                {controllerdata?.controller_code ? (
                  <>
                    <div className="sub-details">
                      {showElectricalReadings ? (
                        <div className="data-update">
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
                          {showThreePhase ? (
                            <>
                              <div className="motor-detail-sub-div  bg-color-two">
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

                              <div className="motor-detail-sub-div  bg-color-three">
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
                              <div className="motor-detail-sub-div  bg-color-two">
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

                              <div className="motor-detail-sub-div  bg-color-three">
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
                            <div className="motor-detail-sub-div  bg-color-two">
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
                            <div className="motor-detail-sub-div  bg-color-three">
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
                              {Number(controllerdata?.r)} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {Number(controllerdata?.rl1)} A
                            </p>
                            <p className="tankpf">PF {Number(controllerdata?.rpf1)}</p>
                          </div>
                        ) : null}
                        {controllerdata?.y ? (
                          <div className="motor-detail-sub-div  bg-color-two">
                            <p className="volt-text-1">
                              <span>Y</span> {Number(controllerdata?.y)} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {Number(controllerdata?.yl2)} A
                            </p>
                            <p className="tankpf">PF {Number(controllerdata?.ypf2)}</p>
                          </div>
                        ) : null}
                        {controllerdata?.b ? (
                          <div className="motor-detail-sub-div  bg-color-three">
                            <p className="volt-text-1">
                              <span>B</span> {Number(controllerdata?.b)} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {Number(controllerdata?.bl3)} A
                            </p>
                            <p className="tankpf">PF {Number(controllerdata?.bpf3)}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null} */}
                      <div className="detailsflex">
                        <p
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                          }}
                        >
                          <span>
                            <span className="tank-header">ID - </span>
                            {isEditControllerCode?.isEdit ? (
                              <input
                                type="text"
                                className="notification filedPickBackground"
                                onKeyPress={avoidletters}
                                maxLength={25}
                                defaultValue={
                                  isEditControllerCode?.editedControllerCode
                                }
                                onChange={(e) =>
                                  setIsEditControllerCode((pre) => {
                                    return {
                                      ...pre,
                                      editedControllerCode: e.target.value
                                    };
                                  })
                                }
                              />
                            ) : (
                              <span className="tank-date">
                                {controllerdata?.controller_code}
                              </span>
                            )}
                          </span>
                          {LoginUserData?.user_type === 1 ? (
                            <img
                              src={
                                isEditControllerCode?.isEdit &&
                                isEditControllerCode?.item?.controllerCode !==
                                  isEditControllerCode?.editedControllerCode
                                  ? ExportedImages.SAVE_ICON_BLUE
                                  : !isEditControllerCode?.isEdit
                                    ? ExportedImages.EDIT_ICON_BLUE
                                    : ExportedImages.CANCEL_ICON
                              }
                              height={20}
                              className="pointerCurser"
                              onClick={() => {
                                if (
                                  isEditControllerCode?.isEdit &&
                                  isEditControllerCode?.item?.controllerCode ===
                                    isEditControllerCode?.editedControllerCode
                                ) {
                                  setIsEditControllerCode({
                                    isEdit: false,
                                    item: {
                                      controllerCode: "",
                                      controllerID: ""
                                    },
                                    editedControllerCode: "",
                                    isShowModal: false
                                  });
                                } else if (
                                  isEditControllerCode?.isEdit &&
                                  isEditControllerCode?.item?.controllerCode !==
                                    isEditControllerCode?.editedControllerCode
                                ) {
                                  setIsEditControllerCode((pre) => {
                                    return {
                                      ...pre,
                                      isShowModal: true
                                    };
                                  });
                                } else {
                                  setIsEditControllerCode({
                                    isEdit: true,
                                    item: {
                                      controllerCode:
                                        controllerdata?.controller_code,
                                      controllerID:
                                        controllerdata?.controller_id
                                    },
                                    editedControllerCode:
                                      controllerdata?.controller_code,
                                    isShowModal: false
                                  });
                                }
                              }}
                            />
                          ) : null}
                        </p>
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

                        {(getPermissionDetailsById(userpersmission?.data, 15) ||
                          usertype === 1) && (
                          <>
                            <p>
                              <span
                                className={
                                  editstate
                                    ? "tank-header"
                                    : "notification filedPickBackground"
                                }
                                onClick={() => toshow()}
                              >
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  15
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      15
                                    )?.title
                                  : "Group"}
                                -
                              </span>
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
                        <p></p>
                        {(getPermissionDetailsById(userpersmission?.data, 17) ||
                          usertype === 1) && (
                          <>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  17
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      17
                                    )?.title
                                  : "Mode"}
                                -
                              </span>
                              <span className="tank-date">
                                {controllerdata?.controller_mode === 0
                                  ? "Manual"
                                  : controllerdata?.controller_mode === 1
                                    ? "Daily OP"
                                    : controllerdata?.controller_mode === 2
                                      ? "Daily OC"
                                      : controllerdata?.controller_mode === 3
                                        ? "Cyclic OP"
                                        : controllerdata?.controller_mode === 4
                                          ? "Cyclic OC"
                                          : null}
                              </span>
                            </p>
                          </>
                        )}

                        {(getPermissionDetailsById(userpersmission?.data, 18) ||
                          usertype === 1) && (
                          <>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  18
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      18
                                    )?.title
                                  : "Power Usage"}
                                -
                              </span>
                              <span className="tank-date">
                                {controllerdata?.kilo_watt_hr}
                              </span>
                            </p>
                          </>
                        )}
                      </div>

                      <div className="detailsflex">
                        {(getPermissionDetailsById(userpersmission?.data, 10) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  10
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      10
                                    )?.title
                                  : "Live Load"}
                                -
                              </span>
                              <span className="tank-date">
                                {controllerdata?.kilo_watt}
                              </span>
                            </p>
                          </div>
                        )}

                        {(getPermissionDetailsById(userpersmission?.data, 19) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  19
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      19
                                    )?.title
                                  : "Ran Time"}
                                -
                              </span>
                              <span className="tank-date">
                                {controllerdata?.pump_running_hrs >= 100
                                  ? `${Math.floor(
                                      controllerdata.pump_running_hrs / 100
                                    )}:${String(
                                      controllerdata.pump_running_hrs % 100
                                    ).padStart(2, "0")}`
                                  : controllerdata?.pump_running_hrs}
                              </span>
                            </p>
                          </div>
                        )}

                        {(getPermissionDetailsById(userpersmission?.data, 20) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  20
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      20
                                    )?.title
                                  : "Total hours"}
                                -
                              </span>
                              <span className="tank-date">
                                {controllerdata?.total_hrs
                                  ? controllerdata?.total_hrs.split(":")[0]
                                  : ""}
                              </span>
                            </p>
                          </div>
                        )}

                        {(getPermissionDetailsById(userpersmission?.data, 21) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  21
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      21
                                    )?.title
                                  : "Hardware Version"}
                                -
                              </span>
                              <span className="tank-date">
                                {
                                  // controller_setting.hardware_version is
                                  // only ever populated by a settings-sync
                                  // (c0=102) message that arrived AFTER
                                  // approval — the backend explicitly
                                  // defaults it to the literal number 0
                                  // (not blank) whenever no ControllerSetting
                                  // row exists yet. The top-level
                                  // controllerdata.hardware_version comes
                                  // straight off the Controller row instead
                                  // (view_controller in controller.py) and
                                  // correctly returns blank when unset — use
                                  // it as the fallback so an unset version
                                  // shows as blank, not a misleading "0".
                                  controllerdata?.controller_setting
                                    ?.hardware_version ||
                                    controllerdata?.hardware_version
                                }
                              </span>
                            </p>
                          </div>
                        )}

                        {(getPermissionDetailsById(userpersmission?.data, 22) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  22
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      22
                                    )?.title
                                  : "Software Version"}
                                -
                              </span>
                              <span className="tank-date">
                                {
                                  // same reasoning as hardware_version above
                                  controllerdata?.controller_setting
                                    ?.software_version ||
                                    controllerdata?.software_version
                                }
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="detailsflex">
                        {/* <p>
                          <span className="tank-header">tank status - </span>
                          <span className="tank-date">
                            {controllerdata?.tank_level !== null
                              ? `${Number(controllerdata?.tank_level)}%`
                              : null}
                          </span>
                        </p> */}

                        {(getPermissionDetailsById(userpersmission?.data, 11) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  11
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      11
                                    )?.title
                                  : "Tank Status"}
                                -
                              </span>
                              <span className="tank-date">
                                {controllerdata?.tank_level !== null
                                  ? `${Number(controllerdata?.tank_level)}%`
                                  : null}
                              </span>
                            </p>
                          </div>
                        )}

                        {(getPermissionDetailsById(userpersmission?.data, 12) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  12
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      12
                                    )?.title
                                  : "Flow Status"}
                                -
                              </span>
                              <span
                                className={
                                  controllerdata?.controller_setting
                                    ?.usage_limit_status === 1
                                    ? "tank-date close-btn"
                                    : "tank-date oped_btn"
                                }
                              >
                                {controllerdata?.controller_setting
                                  ?.usage_limit_status === 1
                                  ? "Reached"
                                  : "Not Reached"}
                              </span>
                            </p>
                          </div>
                        )}

                        {(getPermissionDetailsById(userpersmission?.data, 13) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  13
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      13
                                    )?.title
                                  : "Valve Status"}
                                -
                              </span>
                              <span>
                                <button
                                  type="button"
                                  className={
                                    controllerdata?.controller_setting
                                      ?.valve_status === 1
                                      ? "oped_btn"
                                      : "close-btn"
                                  }
                                >
                                  {controllerdata?.controller_setting
                                    ?.valve_status === 1
                                    ? "Opened"
                                    : "Closed"}
                                </button>
                              </span>
                            </p>
                          </div>
                        )}

                        {/* <p>
                          <span className="tank-header">KVAR - </span>
                          <span className="tank-date">
                            {controllerdata?.kvar !== 0
                              ? controllerdata?.kvar
                              : controllerdata?.formula_value}
                          </span>
                        </p> */}

                        {(getPermissionDetailsById(userpersmission?.data, 8) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  8
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      8
                                    )?.title
                                  : "Kvar"}
                                -
                              </span>
                              <span>
                                <span className="tank-date">
                                  {controllerdata?.kvar}
                                  {getPermissionDetailsById(
                                    userpersmission?.data,
                                    36
                                  )?.title ?? "bar"}
                                  {/* {controllerdata?.formula_value > 0 &&
                                  height > 0 &&
                                  width > 0
                                    ? Number(controllerdata?.kvar) !==
                                        Number(controllerdata?.formula_value) &&
                                      ` / ${controllerdata?.formula_value}`
                                    : " "} */}
                                </span>
                              </span>
                            </p>
                          </div>
                        )}

                        {(getPermissionDetailsById(userpersmission?.data, 14) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  14
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      14
                                    )?.title
                                  : "Formula Value"}
                                -
                              </span>
                              <span className="tank-date">
                                {controllerdata?.formula_value}KL
                                {/* {controllerdata?.formula_value > 0 &&
                                  height > 0 &&
                                  width > 0
                                    ? Number(controllerdata?.kvar) !==
                                        Number(controllerdata?.formula_value) &&
                                      ` / ${controllerdata?.formula_value}`
                                    : " "} */}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* <p>
                          <span className="tank-header">CAP - </span>
                          <span className="tank-date">
                            {controllerdata?.cap}
                          </span>
                        </p> */}

                        {(getPermissionDetailsById(userpersmission?.data, 9) ||
                          usertype === 1) && (
                          <div>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  9
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      9
                                    )?.title
                                  : "Cap"}
                              </span>
                              <span className="tank-date">
                                {/* <p className="tank-date"> */}
                                {`-${controllerdata?.cap}`}
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  37
                                )?.title ?? "KL"}
                                {/* </p> */}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="detailsflex">
                        {(getPermissionDetailsById(userpersmission?.data, 23) ||
                          usertype === 1) && (
                          <>
                            <p>
                              <span className="tank-header">
                                {getPermissionDetailsById(
                                  userpersmission?.data,
                                  23
                                )?.title
                                  ? getPermissionDetailsById(
                                      userpersmission?.data,
                                      23
                                    )?.title
                                  : "Lora"}
                                -
                              </span>
                              <span className="tank-date">
                                {lorastate ? (
                                  <MdOutlineCheckBox
                                    className="loracolor"
                                    disabled={editstate}
                                    onClick={() => {
                                      setlora(
                                        !editstate ? !lorastate : lorastate
                                      );
                                    }}
                                  />
                                ) : (
                                  <MdOutlineCheckBoxOutlineBlank
                                    className="loraempty"
                                    disabled={editstate}
                                    onClick={() => {
                                      setlora(
                                        !editstate ? !lorastate : lorastate
                                      );
                                    }}
                                  />
                                )}
                              </span>
                            </p>
                          </>
                        )}

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
                                maxLength={60}
                                className="notification filedPickBackground"
                                onChange={(e) => settopic(e.target.value)}
                                defaultValue={controllerdata?.topic}
                              />
                            )}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className={"mergeAlertBlock"}>
                      <div
                        className="mergeSettings"
                        style={{ flexDirection: "row", flexFlow: "wrap" }}
                      >
                        <p className="mergeControllerBlock">
                          {controllerdata?.controllerMerge ? (
                            <img
                              src={ExportedImages.MERGE_LINK_ICON}
                              alt="LinkIcon"
                              className="mergeIcon"
                            />
                          ) : (
                            " Merge "
                          )}
                          {controllerdata.controllerMerge && (
                            <div className="d-flex gap-2">
                              <span className="tank-date mergetankname">
                                {controllerdata?.controllerMerge?.device_name}
                              </span>

                              <span className="tank-date">
                                ( {controllerdata?.controllerMerge?.device_code}
                                )
                              </span>
                            </div>
                          )}
                          {controllerdata.controllerMerge &&
                            usertype !== 3 &&
                            MergeSettingData.isEdit && (
                              <img
                                src={ExportedImages.DELETE_ICON_RED}
                                alt="deleteimg"
                                className="MergeIcon"
                                onClick={() => {
                                  setmergeConfirmation({
                                    action: "delete",
                                    show: true,
                                    merge_id:
                                      controllerdata?.controllerMerge.id,
                                    tankdata: controllerdata.controllerMerge
                                  });
                                }}
                              />
                            )}
                          {!controllerdata?.controllerMerge &&
                          mergerController.action ? (
                            <div className="merge_filed_section">
                              <input
                                type="text"
                                className="mergeInput filedPickBackground"
                                value={mergerController.device_code}
                                maxLength={15}
                                onChange={(event) => {
                                  setMergerController((pre) => ({
                                    ...pre,
                                    device_code: event.target.value
                                  }));
                                }}
                              />

                              {mergeConfirmation?.tankdata?.device_type === 5 &&
                                mergerController.device_code !== "" && (
                                  <select
                                    value={mergeControllerDeviceID}
                                    className={
                                      "location filedPickBackground merge_select"
                                    }
                                    onChange={(e) => {
                                      setMergeControllerDeviceID(
                                        e.target.value
                                      );
                                    }}
                                  >
                                    <option value="" disabled selected>
                                      Select a device
                                    </option>
                                    {mergeConfirmation?.tankdata?.child_device?.map(
                                      (ele, ind) => {
                                        return (
                                          <option key={ele?.id} value={ele?.id}>
                                            {ind + 1}.{ele?.device_name}
                                          </option>
                                        );
                                      }
                                    )}
                                  </select>
                                )}
                            </div>
                          ) : (
                            ""
                          )}
                          {!controllerdata.controllerMerge &&
                            usertype !== 3 && (
                              <div className="merge_icon_container">
                                <img
                                  src={
                                    mergerController.action
                                      ? mergerController?.device_code
                                        ? mergeConfirmation?.tankdata
                                            ?.device_type === 5
                                          ? ExportedImages?.EDIT_ICON_BLUE
                                          : ExportedImages.SAVED_TICK_ICON
                                        : ExportedImages.CANCEL_ICON
                                      : ExportedImages.MERGE_LINK_ICON
                                  }
                                  alt="MergeIcon"
                                  className={
                                    mergerController.action
                                      ? "SavemergeIcon"
                                      : "MergeIcon"
                                  }
                                  onClick={() => {
                                    if (
                                      mergerController?.action &&
                                      !mergerController?.device_code
                                    ) {
                                      setMergerController({
                                        device_id: "",
                                        device_code: "",
                                        is_tank: false,
                                        action: ""
                                      });
                                      setmergeConfirmation({
                                        action: "",
                                        show: false,
                                        merge_id: "",
                                        tankdata: ""
                                      });
                                    }
                                    if (mergerController.action) {
                                      if (mergerController.device_code > 0) {
                                        HandlecheckDeviceType(
                                          mergerController.device_code
                                        );
                                      }
                                    } else {
                                      setMergerController((pre) => ({
                                        device_id: "",
                                        device_code: "",
                                        is_tank: false,
                                        action: mergerController.action
                                          ? ""
                                          : "merge"
                                      }));
                                    }
                                  }}
                                />

                                {mergeConfirmation?.tankdata?.device_type ===
                                  5 && mergerController.device_code !== "" ? (
                                  <img
                                    src={ExportedImages.SAVED_TICK_ICON}
                                    style={{
                                      width: 18,
                                      cursor: "pointer"
                                    }}
                                    onClick={() => {
                                      if (
                                        mergeConfirmation?.tankdata
                                          ?.device_type === 5 &&
                                        mergeControllerDeviceID
                                      ) {
                                        setmergeConfirmation((pre) => ({
                                          ...pre,
                                          show: true,
                                          action: "merge"
                                        }));
                                      } else {
                                        toast.error("Select any device");
                                      }
                                    }}
                                  />
                                ) : null}
                              </div>
                            )}
                        </p>
                        {controllerdata?.controllerMerge && (
                          <div
                            className="mergeSettings mergeSettinglimit"
                            style={{ flexDirection: "row", flexFlow: "wrap" }}
                          >
                            <p
                              className="tank-date mergetankname  input_width NoWrapStyle"
                              style={{ alignItems: "flex-start" }}
                            >
                              High Limit -
                              {MergeSettingData.isEdit ? (
                                <>
                                  &nbsp;
                                  <input
                                    type="text"
                                    maxLength={8}
                                    // onKeyPress={avoidletters}
                                    className={"location filedPickBackground"}
                                    onChange={(e) => {
                                      if (
                                        Float_Validation(e.target?.value) &&
                                        e.target.value <= 99999.99
                                      ) {
                                        setMergeSettingData({
                                          ...MergeSettingData,
                                          high_limit: e.target.value
                                        });
                                      }
                                    }}
                                    value={MergeSettingData?.high_limit}
                                    // onClick={() => tolimit()}
                                  />
                                  &nbsp;
                                  <select
                                    className={"location filedPickBackground"}
                                    onClick={(e) => {
                                      setMergeSettingData({
                                        ...MergeSettingData,
                                        high_limit_action: JSON.parse(
                                          e.target.value
                                        )
                                      });
                                    }}
                                  >
                                    <option
                                      value="0"
                                      selected={
                                        MergeSettingData?.high_limit_action ===
                                        0
                                          ? true
                                          : false
                                      }
                                    >
                                      No Action
                                    </option>
                                    <option
                                      value="1"
                                      selected={
                                        MergeSettingData?.high_limit_action ===
                                        1
                                          ? true
                                          : false
                                      }
                                    >
                                      Off Motor
                                    </option>
                                    <option
                                      value="2"
                                      selected={
                                        MergeSettingData?.high_limit_action ===
                                        2
                                          ? true
                                          : false
                                      }
                                    >
                                      On Motor
                                    </option>
                                  </select>
                                </>
                              ) : (
                                <>
                                  <span className="tank-date">
                                    {
                                      controllerdata?.controllerMerge
                                        ?.high_limit
                                    }
                                  </span>
                                  &nbsp;
                                  <span className="tank-date">
                                    (
                                    {getlimitAction(
                                      controllerdata?.controllerMerge
                                        .high_limit_action
                                    )}
                                    )
                                  </span>
                                </>
                              )}
                            </p>
                            <p
                              className="tank-date mergetankname  input_width NoWrapStyle"
                              style={{ alignItems: "flex-start" }}
                            >
                              Low Limit -
                              {MergeSettingData.isEdit ? (
                                <>
                                  &nbsp;
                                  <input
                                    type="text"
                                    maxLength={10}
                                    // onKeyPress={avoidletters}
                                    className={"location filedPickBackground"}
                                    onChange={(e) => {
                                      if (
                                        Float_Validation(e.target.value) &&
                                        e.target.value <= 99999.99
                                      ) {
                                        setMergeSettingData({
                                          ...MergeSettingData,
                                          low_limit: e.target.value
                                        });
                                      }
                                    }}
                                    value={MergeSettingData?.low_limit}
                                    // onClick={() => tolimit()}
                                  />
                                  &nbsp;
                                  <select
                                    className={"location filedPickBackground"}
                                    onClick={(e) => {
                                      setMergeSettingData({
                                        ...MergeSettingData,
                                        low_limit_action: JSON.parse(
                                          e.target.value
                                        )
                                      });
                                    }}
                                  >
                                    <option
                                      value="0"
                                      selected={
                                        MergeSettingData?.low_limit_action === 0
                                          ? true
                                          : false
                                      }
                                    >
                                      No Action
                                    </option>
                                    <option
                                      value="1"
                                      selected={
                                        MergeSettingData?.low_limit_action === 1
                                          ? true
                                          : false
                                      }
                                    >
                                      Off Motor
                                    </option>
                                    <option
                                      value="2"
                                      selected={
                                        MergeSettingData?.low_limit_action === 2
                                          ? true
                                          : false
                                      }
                                    >
                                      On Motor
                                    </option>
                                  </select>
                                </>
                              ) : (
                                <>
                                  <span className="tank-date">
                                    {controllerdata?.controllerMerge?.low_limit}
                                  </span>
                                  &nbsp;
                                  <span className="tank-date">
                                    (
                                    {getlimitAction(
                                      controllerdata?.controllerMerge
                                        .low_limit_action
                                    )}
                                    )
                                  </span>
                                </>
                              )}
                            </p>
                            {usertype !== 3 && (
                              <img
                                src={
                                  !MergeSettingData.isEdit
                                    ? ExportedImages.EDIT_ICON_BLUE
                                    : ExportedImages.SAVE_ICON_BLUE
                                }
                                className="pointerCurser"
                                onClick={() => {
                                  if (MergeSettingData?.isEdit) {
                                    handleUpdateMergeSettings(1);
                                  } else {
                                    setMergeSettingData((pre) => ({
                                      ...pre,
                                      isEdit: true
                                    }));
                                  }
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="alertflex">
                        <p className="alerts mb-0">
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
                            <p className="mb-0">
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
                                <span className="tank-header">
                                  Notifications-
                                </span>
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
                    </div>
                    <p className="line motorLinetwo"></p>

                    <div>
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
                                maxLength={25}
                                defaultValue={ebdata?.ebval}
                                onChange={(e) =>
                                  setebdata({
                                    ...ebdata,
                                    ebval: e.target.value
                                  })
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
                              alt="edit"
                              src={
                                editEb
                                  ? ExportedImages.SAVE_ICON_BLUE
                                  : ExportedImages.EDIT_ICON_BLUE
                              }
                              onClick={() => {
                                toediteb();
                                setEb(!editEb);
                              }}
                              className="pointerCurser"
                            />
                          ) : null}
                        </div>

                        <div className="controllerfixed">
                          <div className="service">
                            <p className="tank-header">Location</p>
                            {locationtype === 1 ? (
                              <MdLocationOn className="locateapi" />
                            ) : (
                              <MdLocationOn
                                className="locate"
                                onClick={() => {
                                  if (!(locationtype === 1)) {
                                    loadingspinner(
                                      controllerdata?.access_type,
                                      type.requesttypeThree,
                                      controllerdata?.controller_id
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
                                    is_fixed: ebdata.is_fixed === 1 ? 0 : 1
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
                                maxLength={10}
                                onChange={(e) =>
                                  setebdata({ ...ebdata, lat: e.target.value })
                                }
                              />
                              <span>'N</span>
                            </>
                          ) : controllerdata?.controller_setting?.latitude ? (
                            <span>
                              &nbsp;&nbsp;Lat-
                              {controllerdata?.controller_setting?.latitude}
                              &nbsp; 'N
                            </span>
                          ) : null}
                          {editEb ? (
                            <>
                              &nbsp;&nbsp;Long&nbsp;
                              <input
                                type="text"
                                className="location filedPickBackground"
                                onKeyPress={latlong}
                                maxLength={10}
                                defaultValue={ebdata?.lan}
                                onChange={(e) =>
                                  setebdata({ ...ebdata, lan: e.target.value })
                                }
                              />
                              <span>'E</span>
                            </>
                          ) : controllerdata?.controller_setting?.longitude ? (
                            <span>
                              &nbsp;&nbsp;Long-
                              {controllerdata?.controller_setting?.longitude}
                              &nbsp; 'E
                            </span>
                          ) : null}
                        </p>
                      </div>
                      {/* MMMMMM */}
                      <div>
                        <div style={{ display: "flex", gap: "20px" }}>
                          <p style={{ fontWeight: "500" }}>Pipe Details-</p>
                          <img
                            width="18px"
                            height="18px"
                            alt="edit"
                            src={
                              editEbs
                                ? ExportedImages.SAVE_ICON_BLUE
                                : ExportedImages.EDIT_ICON_BLUE
                            }
                            onClick={() => {
                              setEbs(!editEbs);
                            }}
                            className="pointerCurser"
                          />
                        </div>
                      </div>
                      {editEbs ? (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              gap: "20px",
                              alignItems: "flex-start"
                            }}
                          >
                            {/* Length */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column"
                              }}
                            >
                              <label style={{ marginBottom: "5px" }}>
                                Length(m)
                              </label>
                              <input
                                style={{
                                  width: "100px",
                                  border:
                                    values?.height === ""
                                      ? "1px solid red"
                                      : "1px solid #ccc",
                                  padding: "5px",
                                  borderRadius: "4px"
                                }}
                                value={values?.height}
                                onChange={(e) =>
                                  setFieldValue("height", e.target.value)
                                }
                                type="number"
                                required
                              />

                              {values?.height === "" && (
                                <small
                                  style={{ color: "red", marginTop: "3px" }}
                                >
                                  * Required
                                </small>
                              )}
                            </div>

                            {/* Dia */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column"
                              }}
                            >
                              <label style={{ marginBottom: "5px" }}>
                                Diameter(mm)
                              </label>
                              <input
                                style={{
                                  width: "100px",
                                  border:
                                    values?.width === ""
                                      ? "1px solid red"
                                      : "1px solid #ccc",
                                  padding: "5px",
                                  borderRadius: "4px"
                                }}
                                value={values?.width}
                                onChange={(e) =>
                                  setFieldValue("width", e.target.value)
                                }
                                type="number"
                                required
                              />
                              {values?.width === "" && (
                                <small
                                  style={{ color: "red", marginTop: "3px" }}
                                >
                                  * Required
                                </small>
                              )}
                            </div>

                            {usertype === 1 && (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column"
                                  }}
                                >
                                  <label style={{ marginBottom: "5px" }}>
                                    Pressure Value
                                  </label>
                                  <input
                                    style={{
                                      width: "100px",
                                      border:
                                        values?.pressure === ""
                                          ? "1px solid red"
                                          : "1px solid #ccc",
                                      padding: "5px",
                                      borderRadius: "4px"
                                    }}
                                    value={values?.pressure}
                                    onChange={(e) =>
                                      setFieldValue("pressure", e.target.value)
                                    }
                                    type="number"
                                    required
                                  />
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column"
                                  }}
                                >
                                  <label style={{ marginBottom: "5px" }}>
                                    Power Usage
                                  </label>
                                  <input
                                    style={{
                                      width: "100px",
                                      border:
                                        values?.power_usage === ""
                                          ? "1px solid red"
                                          : "1px solid #ccc",
                                      padding: "5px",
                                      borderRadius: "4px"
                                    }}
                                    value={values?.power_usage}
                                    onChange={(e) =>
                                      setFieldValue(
                                        "power_usage",
                                        e.target.value
                                      )
                                    }
                                    type="number"
                                    required
                                  />
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column"
                                  }}
                                >
                                  <label style={{ marginBottom: "5px" }}>
                                    Amps
                                  </label>
                                  <input
                                    style={{
                                      width: "100px",
                                      border:
                                        values?.power_usage === ""
                                          ? "1px solid red"
                                          : "1px solid #ccc",
                                      padding: "5px",
                                      borderRadius: "4px"
                                    }}
                                    value={values?.amps}
                                    onChange={(e) =>
                                      setFieldValue("amps", e.target.value)
                                    }
                                    type="string"
                                    required
                                  />
                                  {errors?.amps && touched?.amps && (
                                    <small
                                      style={{ color: "red", marginTop: "3px" }}
                                    >
                                      {errors?.amps}
                                    </small>
                                  )}
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: 100
                                  }}
                                >
                                  <label style={{ marginBottom: "5px" }}>
                                    Volts
                                  </label>
                                  <input
                                    style={{
                                      width: "100px",
                                      border:
                                        values?.volts === ""
                                          ? "1px solid red"
                                          : "1px solid #ccc",
                                      padding: "5px",
                                      borderRadius: "4px"
                                    }}
                                    value={values?.volts}
                                    onChange={(e) =>
                                      setFieldValue("volts", e.target.value)
                                    }
                                    type="string"
                                    required
                                  />
                                  {errors?.volts && (
                                    <small
                                      style={{
                                        color: "red",
                                        marginTop: "3px",
                                        fontSize: "12px"
                                      }}
                                    >
                                      {errors?.volts}
                                    </small>
                                  )}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column"
                                  }}
                                >
                                  <label style={{ marginBottom: "5px" }}>
                                    Depth Action Value
                                  </label>
                                  <input
                                    style={{
                                      width: "150px",
                                      padding: "5px",
                                      borderRadius: "4px",
                                      border:
                                        values?.volts === ""
                                          ? "1px solid red"
                                          : "1px solid #ccc"
                                    }}
                                    value={values?.depthactionvalue}
                                    onChange={(e) =>
                                      setFieldValue(
                                        "depthactionvalue",
                                        e.target.value
                                      )
                                    }
                                    type="number"
                                    required
                                  />
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative",
                                    width: "200px"
                                  }}
                                >
                                  <label style={{ marginBottom: "5px" }}>
                                    Depth value Action
                                  </label>

                                  <select
                                    value={values?.depth_action || ""}
                                    onChange={(e) =>
                                      setFieldValue(
                                        "depth_action",
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      padding: "6px 28px 6px 10px", // space for X
                                      fontSize: "14px",
                                      border: "1px solid #555",
                                      borderRadius: "4px",
                                      backgroundColor: "white",
                                      appearance: "none",
                                      width: "150px"
                                    }}
                                  >
                                    <option value="" disabled hidden />
                                    <option value="1">Increase +</option>
                                    <option value="2">Decrease -</option>
                                  </select>

                                  {/* Clear (X) icon */}
                                  {values?.depth_action && (
                                    <span
                                      onClick={() =>
                                        setFieldValue("depth_action", "")
                                      }
                                      style={{
                                        position: "absolute",
                                        right: "60px",
                                        top: "35px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        color: "#999"
                                      }}
                                    >
                                      ✕
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                            {/* Button */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-end"
                              }}
                            >
                              <button
                                style={{
                                  marginTop: "30px",
                                  border: "none",
                                  backgroundColor: "#176BA0",
                                  color: "white",
                                  padding: "8px 18px",
                                  borderRadius: "4px",
                                  cursor: "pointer"
                                }}
                                onClick={() => {
                                  console.log(
                                    values,
                                    errors,
                                    usertype,
                                    "Valuews"
                                  );

                                  if (
                                    values?.height === "" ||
                                    values?.width === "" ||
                                    errors?.length
                                  ) {
                                    alert("Please fill all required fields");
                                    return;
                                  } else {
                                    handleSubmit();
                                  }
                                }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sub-details">
                      <p>
                        <span className="tank-header">Access Type</span>
                        <span className="tank-date">
                          -
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
                        &nbsp;&nbsp;&nbsp;
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
                              <span className="tank-header">
                                Notifications-
                              </span>
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
                      <span
                        className={
                          editstate
                            ? "tank-header"
                            : "notification filedPickBackground"
                        }
                        onClick={() => toshow()}
                      >
                        Group -
                      </span>
                      {controllerdata?.group?.map((ele, ind) => {
                        return (
                          <>
                            <span className="tank-date" key={ind}>
                              {ele.group_name}
                            </span>
                          </>
                        );
                      })}
                    </p>
                  </>
                )}
              </div>
              {(usertype === 2 || usertype === 3) && (
                <BlurComponent
                  blurData={{
                    name: controllerdata?.controller_name || "",
                    show: controllerdata?.amc_status < 1 ? true : false,
                    id: controllerdata?.controller_code || "",
                    amc_msg: controllerdata?.amc_msg || "",
                    not_show_pay: controllerdata?.not_show_pay,
                    not_show_charge: controllerdata?.not_show_charge,
                    amc_cost: controllerdata?.amc_cost || ""
                  }}
                />
              )}
            </div>
          </div>
          {/* The chlorinator comes right below the controller, before the other devices and the multi devices. */}
          <ChlorinatorCard
            controllerdata={controllerdata}
            onRefresh={() => MotorController(false, true)}
            usertype={usertype}
          />
          {(tankdata?.length > 0 ||
            flowdata?.length > 0 ||
            valvedata?.length > 0 ||
            multiDeviceData?.length > 0) && (
            <div>
              <h3 className={devicestyle.page_head}>Device Details</h3>
              {tankdata?.length > 0 ||
              flowdata?.length > 0 ||
              valvedata?.length > 0 ||
              multiDeviceData?.length > 0 ? (
                <div className={`${devicestyle.total_device}`}>
                  {tankdata?.map((tank, index) => {
                    return (
                      <div
                        className={
                          tank.amc_status < 1 &&
                          (usertype === 3 || usertype === 2)
                            ? "BlurViewContainer"
                            : ""
                        }
                      >
                        <div
                          className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                    ${commonstyle.cards_padding} new-details tank-bgcolor`}
                          key={index}
                        >
                          <div className={devicestyle.tank_level}>
                            <div className="motor-level">
                              <div className="inputWidth">
                                {edittank && index === deviceindex ? (
                                  <input
                                    type="text"
                                    disabled={
                                      !edittank
                                        ? true
                                        : edittank && index === deviceindex
                                          ? false
                                          : true
                                    }
                                    className={`${devicestyle.device_name_input} filedPickBackground`}
                                    onChange={(e) =>
                                      settankinputdata({
                                        ...tankinputdata,
                                        devicename: e.target.value
                                      })
                                    }
                                    defaultValue={tank.device_name}
                                  />
                                ) : (
                                  <OverlayTrigger
                                    key="top"
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip-top">
                                        <strong>{tank?.device_name}</strong>
                                      </Tooltip>
                                    }
                                  >
                                    <p
                                      className={`${devicestyle.device_name} ${devicestyle.device_name_tank_col}`}
                                    >
                                      {tank?.device_name}
                                    </p>
                                  </OverlayTrigger>
                                )}
                              </div>

                              {tank?.tower ? (
                                <>
                                  <img
                                    src={
                                      tank?.tower >= 20 && tank?.tower <= 39
                                        ? ExportedImages.TOWER_ICON1
                                        : tank?.tower >= 40 && tank?.tower <= 59
                                          ? ExportedImages.TOWER_ICON2
                                          : tank?.tower >= 60 &&
                                              tank?.tower <= 79
                                            ? ExportedImages.TOWER_ICON3
                                            : tank?.tower >= 80 &&
                                                tank?.tower <= 99
                                              ? ExportedImages.TOWER_ICON4
                                              : tank?.tower === 100
                                                ? ExportedImages.TOWER_ICON5
                                                : ExportedImages.EMPTY_TOWER_ICON
                                    }
                                    alt="tower"
                                    style={{ width: "30px" }}
                                  />
                                  <p
                                    className={
                                      devicestyle.devicetowerpercentage
                                    }
                                  >
                                    {tank?.tower}%
                                  </p>
                                </>
                              ) : (
                                <img
                                  src={ExportedImages.EMPTY_TOWER_ICON}
                                  alt="tower"
                                  style={{ width: "30px" }}
                                />
                              )}
                            </div>

                            <div className={devicestyle.edit_date}>
                              {tank?.device_time ? (
                                <p className="tank-date">{tank?.device_time}</p>
                              ) : null}

                              {devicedata?.access_type === 0 ||
                              devicedata?.access_type === 1 ||
                              devicedata?.access_type === null ? (
                                editflow || editvalve ? null : (
                                  <img
                                    alt=""
                                    src={
                                      edittank && index === deviceindex
                                        ? ExportedImages.SAVE_ICON_BLUE
                                        : !edittank
                                          ? ExportedImages.EDIT_ICON_BLUE
                                          : null
                                    }
                                    className="pointerCurser"
                                    onClick={() => {
                                      settank(!edittank);
                                      Edittankdetail(tank?.device_id);
                                      setdeviceindex(index);
                                      settankinputdata(
                                        // !edittank
                                        // ?
                                        {
                                          is_fixed: tank.is_fixed,
                                          devicename: tank.device_name,
                                          tankheight: tank.tank_height,
                                          highlimit: tank.high_limit,
                                          lowlomit: tank.low_limit,
                                          latitude: tank.latitude,
                                          longitude: tank.longitude,
                                          highlimitaction:
                                            tank.high_limit_action,
                                          lowlimitaction: tank.low_limit_action,
                                          tank_width: tank.tank_width,
                                          default_level: tank.default_level,
                                          notification_alert:
                                            tank?.notification_alert
                                        }
                                        // : null
                                      );
                                    }}
                                  />
                                )
                              ) : null}
                            </div>
                          </div>

                          <div className="tank-level-data">
                            <p className={commonstyle.margin_zero}>
                              <span className="tank-header">ID - </span>
                              <span className="tank-date">
                                {tank.device_code}
                              </span>
                            </p>
                            {/* LOADING IMAGE */}
                            {isloading && deviceid === tank.device_id ? (
                              <img
                                src={ExportedImages.GREEN_SPINNER_GIF}
                                alt="tower"
                                className="tanpkinner"
                                style={{ height: "23px" }}
                              />
                            ) : (
                              <img
                                src={ExportedImages.SPINNER_ICON}
                                alt="rotating-arrow"
                                className="tanpkinner"
                                onClick={() => {
                                  loadingspinner(
                                    devicedata?.access_type,
                                    type.requesttypeSeven,
                                    tank.device_id,
                                    devicetype.tankdevicetype
                                  );
                                  // setdeviceindex(index);
                                  setdeviceid(tank.device_id);
                                }}
                              />
                            )}
                            {/* END */}

                            <div className="btnWidth">
                              <button
                                type="button"
                                className="settings-btn"
                                onClick={() => {
                                  loadingspinner(
                                    devicedata?.access_type,
                                    type.requesttypeTwo,
                                    tank.device_id,
                                    devicetype.tankdevicetype
                                  );
                                  // setspinnerindevice(true);
                                  setdeviceid(tank.device_id);
                                }}
                              >
                                {spinnerindevice &&
                                tank.device_id === deviceid ? (
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
                          </div>
                          {/* <hr></hr> */}

                          <div className="sub-details">
                            <div className="sub-details w60">
                              <div className="w-40 detailsflex">
                                <p className="input_width">
                                  <span
                                    className="tank-header"
                                    id={
                                      tank?.indication === 1
                                        ? "limitblink"
                                        : null
                                    }
                                  >
                                    High Limit -
                                  </span>
                                  {tank?.high_limit ||
                                  (edittank && index === deviceindex) ? (
                                    edittank && index === deviceindex ? (
                                      <input
                                        type="text"
                                        maxLength={10}
                                        onKeyPress={avoidletters}
                                        className={
                                          edittank && index === deviceindex
                                            ? "location filedPickBackground"
                                            : "devicebg tank-date"
                                        }
                                        disabled={
                                          !edittank
                                            ? true
                                            : edittank && index === deviceindex
                                              ? false
                                              : true
                                        }
                                        onChange={(e) => {
                                          settankinputdata({
                                            ...tankinputdata,
                                            highlimit: e.target.value
                                          });
                                        }}
                                        defaultValue={tank?.high_limit}
                                        // onClick={() => tolimit()}
                                      />
                                    ) : (
                                      <span className="tank-date">
                                        {tank?.high_limit}
                                      </span>
                                    )
                                  ) : null}
                                  &nbsp;&nbsp;
                                  {edittank && index === deviceindex ? (
                                    <select
                                      className={
                                        edittank && index === deviceindex
                                          ? "location filedPickBackground"
                                          : "devicebg"
                                      }
                                      onClick={(e) => {
                                        settankinputdata({
                                          ...tankinputdata,
                                          highlimitaction: JSON.parse(
                                            e.target.value
                                          )
                                        });
                                      }}
                                    >
                                      <option
                                        value="0"
                                        selected={
                                          tank?.high_limit_action === 0
                                            ? true
                                            : false
                                        }
                                      >
                                        No Action
                                      </option>
                                      <option
                                        value="1"
                                        selected={
                                          tank?.high_limit_action === 1
                                            ? true
                                            : false
                                        }
                                      >
                                        Off Motor
                                      </option>
                                      <option
                                        value="2"
                                        selected={
                                          tank?.high_limit_action === 2
                                            ? true
                                            : false
                                        }
                                      >
                                        On Motor
                                      </option>
                                    </select>
                                  ) : (
                                    <>
                                      <span className="tank-date">
                                        {tank?.high_limit_action === 0
                                          ? "No action"
                                          : tank?.high_limit_action === 1
                                            ? "Off Motor"
                                            : tank?.high_limit_action === 2
                                              ? "On Motor"
                                              : null}
                                      </span>
                                    </>
                                  )}
                                </p>

                                <p className=" input_width">
                                  <span
                                    className={"tank-header"}
                                    id={
                                      tank?.indication === 2
                                        ? "limitblink"
                                        : null
                                    }
                                  >
                                    Low Limit -
                                  </span>
                                  {tank?.low_limit ||
                                  (edittank && index === deviceindex) ? (
                                    edittank && index === deviceindex ? (
                                      <input
                                        type="text"
                                        maxLength={10}
                                        onKeyPress={avoidletters}
                                        className={
                                          edittank && index === deviceindex
                                            ? "location filedPickBackground"
                                            : "devicebg"
                                        }
                                        disabled={
                                          !edittank
                                            ? true
                                            : edittank && index === deviceindex
                                              ? false
                                              : true
                                        }
                                        onChange={(e) => {
                                          settankinputdata({
                                            ...tankinputdata,
                                            lowlomit: e.target.value
                                          });
                                        }}
                                        defaultValue={tank?.low_limit}
                                        // onClick={() => tolimit()}
                                      />
                                    ) : (
                                      <span className="tank-date">
                                        {tank?.low_limit}
                                      </span>
                                    )
                                  ) : null}
                                  &nbsp;&nbsp;
                                  {edittank && index === deviceindex ? (
                                    <select
                                      className={
                                        edittank && index === deviceindex
                                          ? "location filedPickBackground"
                                          : "devicebg"
                                      }
                                      onClick={(e) =>
                                        settankinputdata({
                                          ...tankinputdata,
                                          lowlimitaction: JSON.parse(
                                            e.target.value
                                          )
                                        })
                                      }
                                    >
                                      <option
                                        value="0"
                                        selected={
                                          tank?.low_limit_action === 0
                                            ? true
                                            : false
                                        }
                                      >
                                        No Action
                                      </option>
                                      <option
                                        value="1"
                                        selected={
                                          tank?.low_limit_action === 1
                                            ? true
                                            : false
                                        }
                                      >
                                        Off Motor
                                      </option>
                                      <option
                                        value="2"
                                        selected={
                                          tank?.low_limit_action === 2
                                            ? true
                                            : false
                                        }
                                      >
                                        On Motor
                                      </option>
                                    </select>
                                  ) : (
                                    <>
                                      <span className="tank-date">
                                        {tank?.low_limit_action === 0
                                          ? "No action"
                                          : tank?.low_limit_action === 1
                                            ? "Off Motor"
                                            : tank?.low_limit_action === 2
                                              ? "On Motor"
                                              : null}
                                      </span>
                                    </>
                                  )}
                                </p>
                                <p>
                                  <span className="tank-header">
                                    Tank Height -
                                  </span>
                                  {edittank && index === deviceindex ? (
                                    <input
                                      type="text"
                                      maxLength={10}
                                      disabled={
                                        !edittank
                                          ? true
                                          : edittank && index === deviceindex
                                            ? false
                                            : true
                                      }
                                      onKeyPress={(e) => avoidletters(e)}
                                      className={
                                        edittank && index === deviceindex
                                          ? "location filedPickBackground"
                                          : "devicebg"
                                      }
                                      onChange={(e) => {
                                        settankinputdata({
                                          ...tankinputdata,
                                          tankheight: e.target.value
                                        });
                                      }}
                                      defaultValue={tank?.tank_height}
                                    />
                                  ) : (
                                    <span className="tank-date">
                                      {tank?.tank_height !== null
                                        ? tank?.tank_height
                                        : "-"}
                                    </span>
                                  )}
                                  <span className="tank-date"> ft</span>
                                </p>
                                {
                                  <p>
                                    <span className="tank-header">
                                      Tank Dia -{" "}
                                    </span>

                                    {edittank && index === deviceindex ? (
                                      <input
                                        type="text"
                                        maxLength={10}
                                        disabled={
                                          !edittank
                                            ? true
                                            : edittank && index === deviceindex
                                              ? false
                                              : true
                                        }
                                        onKeyPress={(e) => avoidletters(e)}
                                        className={
                                          edittank && index === deviceindex
                                            ? "location filedPickBackground"
                                            : "devicebg"
                                        }
                                        onChange={(e) => {
                                          settankinputdata({
                                            ...tankinputdata,
                                            tank_width: e.target.value
                                          });
                                        }}
                                        defaultValue={tank?.tank_width}
                                      />
                                    ) : (
                                      <span className="tank-date">
                                        {tank?.tank_width !== null
                                          ? tank?.tank_width
                                          : ""}
                                      </span>
                                    )}

                                    <span className="tank-date">
                                      {" "}
                                      {tank?.tank_width !== null ? "ft" : ""}
                                    </span>
                                  </p>
                                }

                                <p>
                                  <span className="tank-header">Location</span>
                                  &nbsp;
                                  {locationtype === tank.device_id ? (
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
                                        if (
                                          !(locationtype === tank.device_id)
                                        ) {
                                          setlocation(tank.device_id);
                                          loadingspinner(
                                            devicedata?.access_type,
                                            type.requesttypeOne,
                                            tank.device_id,
                                            devicetype.tankdevicetype
                                          );
                                          setdeviceid("");
                                        }
                                      }}
                                    />
                                  )}
                                  &nbsp;
                                  <p className="tank-usage">
                                    <Checkbox
                                      // disabled={
                                      //   edittank && index === deviceindex
                                      //     ? false
                                      //     : true
                                      // }
                                      checked={
                                        edittank && index === deviceindex
                                          ? tankinputdata?.is_fixed === 1
                                          : tank?.is_fixed
                                      }
                                      onChange={() => {
                                        if (edittank && index === deviceindex) {
                                          settankinputdata({
                                            ...tankinputdata,
                                            is_fixed:
                                              tankinputdata?.is_fixed === 1
                                                ? 0
                                                : 1
                                          });
                                        }
                                      }}
                                    />
                                    &nbsp;
                                    <span className="tank-header">
                                      is Fixed
                                    </span>
                                  </p>
                                  {edittank && index === deviceindex ? (
                                    <span className="d-inline-table">
                                      {/* flex_container */}
                                      <div className="latlan">
                                        Lat
                                        <input
                                          type="text"
                                          onKeyPress={latlong}
                                          maxLength={10}
                                          disabled={
                                            !edittank
                                              ? true
                                              : edittank &&
                                                  index === deviceindex
                                                ? false
                                                : true
                                          }
                                          className={
                                            edittank && index === deviceindex
                                              ? "location filedPickBackground"
                                              : "devicebg"
                                          }
                                          onChange={(e) => {
                                            settankinputdata({
                                              ...tankinputdata,
                                              latitude: e.target.value
                                            });
                                          }}
                                          defaultValue={tank?.latitude}
                                        />
                                        'N
                                      </div>

                                      <div className="latlan">
                                        Long
                                        <input
                                          type="text"
                                          onKeyPress={latlong}
                                          maxLength={10}
                                          disabled={
                                            !edittank
                                              ? true
                                              : edittank &&
                                                  index === deviceindex
                                                ? false
                                                : true
                                          }
                                          className={
                                            edittank && index === deviceindex
                                              ? "location filedPickBackground"
                                              : "devicebg"
                                          }
                                          onChange={(e) => {
                                            settankinputdata({
                                              ...tankinputdata,
                                              longitude: e.target.value
                                            });
                                          }}
                                          defaultValue={tank?.longitude}
                                        />
                                        'E
                                      </div>
                                    </span>
                                  ) : (
                                    <p className="tank-header">
                                      {/* {tank.latitude === "" && tank.longitude === ""
                              ? null
                              : `${tank.latitude}‘N,${tank.longitude}’E`} */}
                                      Lat-
                                      <span className="tank-date">
                                        {tank.latitude === ""
                                          ? null
                                          : `${tank?.latitude} 'N`}
                                      </span>
                                      <br />
                                      Long-
                                      <span className="tank-date">
                                        {tank.longitude === ""
                                          ? null
                                          : `${tank?.longitude} 'E`}
                                      </span>
                                    </p>
                                  )}
                                </p>

                                <p>
                                  <span className="tank-header">
                                    Water Quality
                                  </span>
                                  <span className="tank-date">
                                    - {tank?.source === 1 ? "TDS" : "EB"}
                                  </span>
                                </p>
                                {tank?.source === 1 && (
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 10,
                                      alignItems: "center"
                                    }}
                                  >
                                    <p>
                                      <span className="tank-header">TDS</span>
                                      <span className="tank-date">
                                        - {tank?.battery}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="tank-header">PH</span>
                                      <span className="tank-date">
                                        - {tank?.solar_panel}
                                      </span>
                                    </p>
                                  </div>
                                )}
                                <p>
                                  <span className="tank-header">
                                    Hardware Version -
                                  </span>
                                  <span className="tank-date">
                                    {tank?.hardware_version}
                                  </span>
                                </p>
                                <p>
                                  <span className="tank-header">
                                    Software Version -
                                  </span>
                                  <span className="tank-date">
                                    {tank?.software_version}
                                  </span>
                                </p>
                                <p>
                                  <span className="tank-header">
                                    Default Level-
                                  </span>

                                  {edittank && index === deviceindex ? (
                                    <input
                                      type="text"
                                      maxLength={10}
                                      disabled={
                                        !edittank
                                          ? true
                                          : edittank && index === deviceindex
                                            ? false
                                            : true
                                      }
                                      onKeyPress={(e) => avoidletters(e)}
                                      className={
                                        edittank && index === deviceindex
                                          ? "location filedPickBackground"
                                          : "devicebg"
                                      }
                                      onChange={(e) => {
                                        if (e.target.value <= 100) {
                                          settankinputdata({
                                            ...tankinputdata,
                                            default_level: e.target.value
                                          });
                                        }
                                      }}
                                      value={tankinputdata?.default_level}
                                    />
                                  ) : (
                                    <span className="tank-date">
                                      {tank?.default_level !== null
                                        ? `${tank?.default_level}`
                                        : null}
                                    </span>
                                  )}
                                  <span className="tank-date">%</span>
                                </p>
                                <p>
                                  <span className="tank-header">
                                    Notification
                                  </span>
                                  &nbsp;
                                  <Toggle
                                    // id={index}
                                    editstate={
                                      edittank && index === deviceindex
                                        ? true
                                        : false
                                    }
                                    isChecked={
                                      edittank && index === deviceindex
                                        ? tankinputdata?.notification_alert
                                        : tank?.notification_alert === 1
                                          ? true
                                          : false
                                    }
                                    handleChange={({ status }) => {
                                      settankinputdata((pre) => ({
                                        ...pre,
                                        notification_alert: status ? 1 : 0
                                      }));
                                    }}
                                  />
                                </p>
                              </div>
                            </div>

                            <div className="sub-right-details">
                              <div className="detailsflex mb-2">
                                <p className="tank-level-details text-end">
                                  <span className="tank-header">
                                    TankLevel-
                                  </span>
                                  <span className="tank-date">
                                    {tank?.tank_level !== null
                                      ? `${tank?.tank_level}%`
                                      : null}
                                  </span>
                                </p>
                              </div>
                              <div className="tankCardupdatedFlex">
                                <div className="detailstank">
                                  {tank?.tank_level !== null ? (
                                    <>
                                      <p
                                        className={
                                          devicestyle.merge_tank_percentage_label
                                        }
                                      >
                                        {tank?.tank_level !== null
                                          ? `${Number(tank?.tank_level)}%`
                                          : null}
                                      </p>
                                      {tank?.tank_level >= 1 &&
                                      tank?.tank_level <= 10 ? (
                                        <img
                                          src={ExportedImages.WATER_TANK_10_GIF}
                                        />
                                      ) : tank?.tank_level > 10 &&
                                        tank?.tank_level <= 20 ? (
                                        <img
                                          src={ExportedImages.WATER_TANK_20_GIF}
                                        />
                                      ) : tank?.tank_level > 20 &&
                                        tank?.tank_level <= 30 ? (
                                        <img
                                          src={ExportedImages.WATER_TANK_30_GIF}
                                        />
                                      ) : tank?.tank_level > 30 &&
                                        tank?.tank_level <= 40 ? (
                                        <img
                                          src={ExportedImages.WATER_TANK_40_GIF}
                                        />
                                      ) : tank?.tank_level > 40 &&
                                        tank?.tank_level <= 60 ? (
                                        <img
                                          src={ExportedImages.WATER_TANK_50_GIF}
                                        />
                                      ) : tank?.tank_level > 60 &&
                                        tank?.tank_level <= 70 ? (
                                        <img
                                          src={ExportedImages.WATER_TANK_60_GIF}
                                        />
                                      ) : tank?.tank_level > 70 &&
                                        tank?.tank_level <= 80 ? (
                                        <img
                                          src={ExportedImages.WATER_TANK_70_GIF}
                                        />
                                      ) : tank?.tank_level > 80 &&
                                        tank?.tank_level <= 90 ? (
                                        <img
                                          src={ExportedImages.WATER_TANK_80_GIF}
                                        />
                                      ) : tank?.tank_level > 90 &&
                                        tank?.tank_level <= 95 ? (
                                        <img
                                          src={ExportedImages.WATER_TANK_90_GIF}
                                        />
                                      ) : tank?.tank_level > 95 &&
                                        tank?.tank_level <= 100 ? (
                                        <img
                                          src={
                                            ExportedImages.WATER_TANK_100_GIF
                                          }
                                        />
                                      ) : (
                                        <img
                                          src={ExportedImages.EMPTY_WATER_TANK}
                                        />
                                      )}
                                    </>
                                  ) : null}
                                </div>

                                {
                                  <p className="tank-level-details text-center VolumeWidth">
                                    <span className="tank-header">
                                      {tank?.water_volume !== null
                                        ? `${formatIndianNumber(
                                            tank?.water_volume
                                          )} kL`
                                        : "0 kL"}
                                    </span>
                                    {/* <span className="tank-date">Ltr</span> */}
                                  </p>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        {(usertype === 3 || usertype === 2) && (
                          <BlurComponent
                            blurData={{
                              name: tank?.device_name || "",
                              show: tank?.amc_status < 1 ? true : false,
                              id: tank?.device_code || "",
                              amc_msg: tank?.amc_msg || "",
                              not_show_pay: tank?.not_show_pay,
                              not_show_charge: tank?.not_show_charge,
                              amc_cost: tank?.amc_cost || ""
                            }}
                          />
                        )}
                      </div>
                    );
                  })}

                  {flowdata?.map((flow, index) => {
                    return (
                      <div
                        className={
                          flow.amc_status < 1 &&
                          (usertype === 3 || usertype === 2)
                            ? "BlurViewContainer"
                            : ""
                        }
                      >
                        <div
                          className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                    ${commonstyle.cards_padding} new-details flow-bgcolor`}
                          key={index}
                        >
                          <div className={devicestyle.tank_level}>
                            <div className="motor-level">
                              <div className="inputWidth">
                                {editflow && index === deviceindex ? (
                                  <input
                                    type="text"
                                    maxLength={50}
                                    className={`${devicestyle.device_name_input} filedPickBackground`}
                                    onChange={(e) => {
                                      setflowinputdata({
                                        ...flowinputdata,
                                        devicename: e.target.value
                                      });
                                    }}
                                    defaultValue={flow.device_name}
                                  />
                                ) : (
                                  <OverlayTrigger
                                    key="top"
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip-top">
                                        <strong>{flow.device_name}</strong>
                                      </Tooltip>
                                    }
                                  >
                                    <p
                                      className={`${devicestyle.device_name} 
                              ${devicestyle.device_name_flow_col}`}
                                    >
                                      {flow.device_name}
                                    </p>
                                  </OverlayTrigger>
                                )}
                              </div>

                              {flow?.tower ? (
                                <>
                                  <img
                                    src={
                                      flow?.tower >= 20 && flow?.tower <= 39
                                        ? ExportedImages.TOWER_ICON1
                                        : flow?.tower >= 40 && flow?.tower <= 59
                                          ? ExportedImages.TOWER_ICON2
                                          : flow?.tower >= 60 &&
                                              flow?.tower <= 79
                                            ? ExportedImages.TOWER_ICON3
                                            : flow?.tower >= 80 &&
                                                flow?.tower <= 99
                                              ? ExportedImages.TOWER_ICON4
                                              : flow?.tower === 100
                                                ? ExportedImages.TOWER_ICON5
                                                : ExportedImages.EMPTY_TOWER_ICON
                                    }
                                    alt="tower"
                                    style={{ width: "30px" }}
                                  />
                                  <p
                                    className={
                                      devicestyle.devicetowerpercentage
                                    }
                                  >
                                    {flow?.tower}%
                                  </p>
                                </>
                              ) : (
                                <img
                                  src={ExportedImages.EMPTY_TOWER_ICON}
                                  alt="tower"
                                  style={{ width: "30px" }}
                                />
                              )}
                            </div>

                            <div className={devicestyle.edit_date}>
                              {flow?.device_time ? (
                                <p className="tank-date">
                                  {" "}
                                  {flow?.device_time}
                                </p>
                              ) : null}
                              {devicedata?.access_type === 0 ||
                              devicedata?.access_type === 1 ||
                              devicedata?.access_type === null ? (
                                editMultiDevice ||
                                edittank ||
                                editvalve ? null : (
                                  <img
                                    src={
                                      editflow && index === deviceindex
                                        ? ExportedImages.SAVE_ICON_BLUE
                                        : !editflow
                                          ? ExportedImages.EDIT_ICON_BLUE
                                          : null
                                    }
                                    className="pointerCurser"
                                    onClick={() => {
                                      setflow(!editflow);
                                      Editflowdetail(flow.device_id);
                                      setdeviceindex(index);
                                      setflowinputdata(
                                        // !editflow
                                        //   ?
                                        {
                                          is_fixed: flow.is_fixed,
                                          devicename: flow.device_name,
                                          usagelimitaction:
                                            flow.usage_limit_action,
                                          latitude: flow.latitude,
                                          longitude: flow.longitude,
                                          dailyupdate: flow.daily_update,
                                          usagelimit: flow?.usage_limit,
                                          notification_alert:
                                            flow?.notification_alert || 0
                                        }
                                        // : null
                                      );
                                    }}
                                  />
                                )
                              ) : null}
                            </div>
                          </div>

                          <div className="tank-level-data">
                            <p className="tank-usage">
                              <span className="tank-header">ID - </span>
                              <span className="tank-date">
                                {flow.device_code}
                              </span>
                            </p>

                            {/* LOADING IMAGE */}
                            {isloading && deviceid === flow.device_id ? (
                              <img
                                src={ExportedImages.GREEN_SPINNER_GIF}
                                alt="tower"
                                className="flowspinner"
                                style={{ height: "23px" }}
                              />
                            ) : (
                              <img
                                src={ExportedImages.SPINNER_ICON}
                                alt="rotating-arrow"
                                className="flowspinner"
                                onClick={() => {
                                  loadingspinner(
                                    devicedata.access_type,
                                    type.requesttypeSeven,
                                    flow.device_id,
                                    devicetype.flowdevicetype
                                  );
                                  // setdeviceindex(index);
                                  setdeviceid(flow.device_id);
                                }}
                              />
                            )}
                            {/* END */}
                            <div className="usagelimitBlock">
                              <p className="tank-usage">
                                <span className="tank-header">
                                  UsageLimit -{" "}
                                </span>
                                {flow?.usage_limit ||
                                (editflow && index === deviceindex) ? (
                                  editflow && index === deviceindex ? (
                                    <input
                                      type="text"
                                      className={
                                        editflow && index === deviceindex
                                          ? "location filedPickBackground"
                                          : "devicebg"
                                      }
                                      disabled={
                                        !editflow
                                          ? true
                                          : editflow && index === deviceindex
                                            ? false
                                            : true
                                      }
                                      onChange={(e) =>
                                        setflowinputdata({
                                          ...flowinputdata,
                                          usagelimit: e.target.value
                                        })
                                      }
                                      defaultValue={flow?.usage_limit}
                                    />
                                  ) : (
                                    <span className="tank-date">
                                      {flow?.usage_limit}
                                    </span>
                                  )
                                ) : null}
                                &nbsp;&nbsp;
                                {editflow && index === deviceindex ? (
                                  <br />
                                ) : null}
                                {editflow && index === deviceindex ? (
                                  <select
                                    className={
                                      editflow && index === deviceindex
                                        ? "usagelimit_width filedPickBackground"
                                        : "devicebg"
                                    }
                                    disabled={
                                      !editflow
                                        ? true
                                        : editflow && index === deviceindex
                                          ? false
                                          : true
                                    }
                                    onClick={(e) => {
                                      setflowinputdata({
                                        ...flowinputdata,
                                        usagelimitaction: JSON.parse(
                                          e.target.value
                                        )
                                      });
                                    }}
                                  >
                                    <option
                                      value="0"
                                      selected={
                                        flow?.usage_limit_action === 0
                                          ? true
                                          : false
                                      }
                                    >
                                      No action
                                    </option>
                                    <option
                                      value="1"
                                      selected={
                                        flow?.usage_limit_action === 1
                                          ? true
                                          : false
                                      }
                                    >
                                      off Motor
                                    </option>
                                    <option
                                      value="2"
                                      selected={
                                        flow?.usage_limit_action === 2
                                          ? true
                                          : false
                                      }
                                    >
                                      On Motor
                                    </option>
                                  </select>
                                ) : (
                                  <span className="tank-date">
                                    {
                                      // flow.usage_limit_action === 2
                                      //   ? "ON Motor"
                                      //   :
                                      flow.usage_limit_action === 1
                                        ? "Off Motor"
                                        : flow.usage_limit_action === 0
                                          ? "No Action"
                                          : ""
                                    }
                                  </span>
                                )}
                              </p>
                              {flow.usage_limit_status === 1 && (
                                <OverlayTrigger
                                  key="top"
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top">
                                      <strong>Usage Limit</strong>
                                    </Tooltip>
                                  }
                                >
                                  <p
                                    id="blink"
                                    style={{
                                      width: "100px",
                                      marginBottom: "0px"
                                    }}
                                  >
                                    Usage Limit
                                  </p>
                                </OverlayTrigger>
                              )}
                            </div>
                          </div>

                          <div className="sub-details mt-2">
                            <div className="flex-data">
                              <p className="tank-usage">
                                <span className="tank-header">
                                  Total usage -{" "}
                                </span>
                                <span className="tank-date">
                                  {flow.total_usage} kL
                                </span>
                              </p>
                              <p className="tank-usage">
                                <span className="tank-header">
                                  Daily Usage -{" "}
                                </span>
                                <span className="tank-date">
                                  {flow.today_usage}
                                </span>
                              </p>
                              <p className="tank-usage new-index">
                                <span className="tank-header">Location </span>
                                &nbsp;
                                {locationtype === flow.device_id ? (
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
                                      if (!(locationtype === flow.device_id)) {
                                        setlocation(flow.device_id);
                                        loadingspinner(
                                          devicedata?.access_type,
                                          type.requesttypeOne,
                                          flow.device_id,
                                          devicetype.flowdevicetype
                                        );
                                        setdeviceid("");
                                      }
                                    }}
                                  />
                                )}
                                &nbsp;
                                <p className="tank-usage">
                                  <Checkbox
                                    // disabled={
                                    //   editflow && index === deviceindex ? false : true
                                    // }
                                    checked={
                                      editflow && index === deviceindex
                                        ? flowinputdata.is_fixed
                                        : flow.is_fixed
                                    }
                                    onChange={() => {
                                      if (editflow && index === deviceindex) {
                                        setflowinputdata((pre) => ({
                                          ...pre,
                                          is_fixed:
                                            flowinputdata.is_fixed === 1 ? 0 : 1
                                        }));
                                      }
                                    }}
                                  />
                                  &nbsp;
                                  <span className="tank-header">is Fixed</span>
                                </p>
                                {editflow && index === deviceindex ? (
                                  <span className="d-inline-table">
                                    <div className="latlan">
                                      {/* input */}
                                      Lat
                                      <input
                                        type="text"
                                        onKeyPress={latlong}
                                        maxLength={10}
                                        className={
                                          editflow && index === deviceindex
                                            ? "location filedPickBackground"
                                            : "devicebg"
                                        }
                                        defaultValue={flow?.latitude}
                                        onChange={(e) =>
                                          setflowinputdata({
                                            ...flowinputdata,
                                            latitude: e.target.value
                                          })
                                        }
                                      />
                                      'N
                                    </div>
                                    <div className="latlan">
                                      Long
                                      <input
                                        type="text"
                                        onKeyPress={latlong}
                                        maxLength={10}
                                        className={
                                          editflow && index === deviceindex
                                            ? "location filedPickBackground"
                                            : "devicebg"
                                        }
                                        defaultValue={flow?.longitude}
                                        onChange={(e) =>
                                          setflowinputdata({
                                            ...flowinputdata,
                                            longitude: e.target.value
                                          })
                                        }
                                      />
                                      'E
                                    </div>
                                  </span>
                                ) : (
                                  <p className="tank-header">
                                    Lat-
                                    <span className="tank-date">
                                      {flow.latitude === ""
                                        ? null
                                        : `${flow?.latitude} 'N`}
                                    </span>
                                    <br />
                                    Long-
                                    <span className="tank-date">
                                      {flow.longitude === ""
                                        ? null
                                        : `${flow?.longitude} 'E`}
                                    </span>
                                  </p>
                                )}
                              </p>
                              <p className="tank-usage">
                                <span className="tank-header">Source - </span>
                                <span className="tank-date">
                                  {flow?.source === 1 ? "Battery" : "EB"}
                                </span>
                              </p>
                              {flow?.source === 1 ? (
                                <p className="tank-usage">
                                  <span className="tank-header">
                                    Battery -{" "}
                                  </span>
                                  <span className="tank-date">
                                    {flow.battery}
                                  </span>
                                </p>
                              ) : null}
                              {flow?.source === 1 ? (
                                <p className="tank-usage">
                                  <span className="tank-header">
                                    Solar Panel -
                                  </span>
                                  <span className="tank-date">
                                    {flow.solar_panel}
                                  </span>
                                </p>
                              ) : null}
                            </div>

                            <img
                              src={ExportedImages.Flow_Image}
                              alt="flowgif"
                              className="deviceflowgif"
                            />

                            <div className="flex-data text-end">
                              <p className="tank-usage">
                                <span className="tank-header">
                                  Flow Rate -{" "}
                                </span>
                                <span className="tank-date">
                                  {" "}
                                  {flow.flow_rate}
                                </span>
                              </p>

                              <p className="tank-usage">
                                <span className="tank-header">
                                  Daily Update -{" "}
                                </span>
                                {editflow && index === deviceindex ? (
                                  // input
                                  <input
                                    type="text"
                                    maxLength={4}
                                    onKeyPress={avoidletters}
                                    className={
                                      editflow && index === deviceindex
                                        ? "location filedPickBackground"
                                        : "devicebg"
                                    }
                                    disabled={
                                      !editflow
                                        ? true
                                        : editflow && index === deviceindex
                                          ? false
                                          : true
                                    }
                                    defaultValue={
                                      flow.daily_update == null
                                        ? null
                                        : flow.daily_update
                                    }
                                    onChange={(e) =>
                                      setflowinputdata({
                                        ...flowinputdata,
                                        dailyupdate: e.target.value
                                      })
                                    }
                                  />
                                ) : (
                                  <span className="tank-date">
                                    {flow.daily_update == null
                                      ? null
                                      : flow.daily_update}
                                  </span>
                                )}
                              </p>

                              <p className="tank-usage">
                                <span className="tank-header">
                                  Hardware Version -
                                </span>
                                <span className="tank-date">
                                  {flow?.hardware_version}
                                </span>
                              </p>
                              <p className="tank-usage">
                                <span className="tank-header">
                                  Software Version -
                                </span>
                                <span className="tank-date">
                                  {flow?.software_version}
                                </span>
                              </p>

                              <div className="d-flex justify-content-end">
                                <button
                                  type="button"
                                  className="settings-btn mb-2"
                                  onClick={() => {
                                    loadingspinner(
                                      devicedata?.access_type,
                                      type.requesttypeTwo,
                                      flow.device_id,
                                      devicetype.flowdevicetype
                                    );
                                    setdeviceid(flow.device_id);
                                    // setspinnerindevice(true);
                                  }}
                                >
                                  {spinnerindevice &&
                                  flow.device_id === deviceid ? (
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
                              <p className="tank-usage">
                                <span className="tank-header">
                                  Liter/Pulse -{" "}
                                </span>
                                <span className="tank-date">
                                  {flow.lt_per_pulse}
                                </span>
                              </p>
                              <p>
                                <span className="tank-header">
                                  Notification
                                </span>
                                &nbsp;
                                <Toggle
                                  editstate={
                                    editflow && index === deviceindex
                                      ? true
                                      : false
                                  }
                                  isChecked={
                                    editflow && index === deviceindex
                                      ? flowinputdata?.notification_alert
                                      : flow?.notification_alert === 1
                                        ? true
                                        : false
                                  }
                                  handleChange={({ status }) => {
                                    setflowinputdata((pre) => ({
                                      ...pre,
                                      notification_alert: status ? 1 : 0
                                    }));
                                  }}
                                />
                              </p>
                            </div>
                          </div>
                          <div className="sub-details mb-2"></div>
                        </div>
                        {(usertype === 3 || usertype === 2) && (
                          <BlurComponent
                            blurData={{
                              name: flow?.device_name || "",
                              show: flow?.amc_status < 1 ? true : false,
                              id: flow?.device_code || "",
                              amc_msg: flow?.amc_msg || "",
                              not_show_pay: flow?.not_show_pay,
                              not_show_charge: flow?.not_show_charge,
                              amc_cost: flow?.amc_cost || ""
                            }}
                          />
                        )}
                      </div>
                    );
                  })}

                  {valvedata?.map((valve, index) => {
                    return (
                      <div
                        className={
                          valve.amc_status < 1 &&
                          (usertype === 3 || usertype === 2)
                            ? "BlurViewContainer"
                            : ""
                        }
                      >
                        <div
                          className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                    ${commonstyle.cards_padding} new-details value-bgcolor`}
                          key={index}
                        >
                          <div className={devicestyle.tank_level}>
                            <div className="motor-level">
                              <div className="inputWidth">
                                {editvalve && index === deviceindex ? (
                                  <input
                                    type="text"
                                    maxLength={50}
                                    className={`${devicestyle.device_name_input} filedPickBackground`}
                                    onChange={(e) => {
                                      setvalveinputdata({
                                        ...valveinputdata,
                                        devicename: e.target.value
                                      });
                                    }}
                                    defaultValue={valve.device_name}
                                  />
                                ) : (
                                  <OverlayTrigger
                                    key="top"
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip-top">
                                        <strong>{valve.device_name}</strong>
                                      </Tooltip>
                                    }
                                  >
                                    <p
                                      className={`${devicestyle.device_name} ${devicestyle.device_name_valve_col}`}
                                    >
                                      {valve.device_name}
                                    </p>
                                  </OverlayTrigger>
                                )}
                              </div>

                              {valve?.tower ? (
                                <>
                                  <img
                                    src={
                                      valve?.tower >= 20 && valve?.tower <= 39
                                        ? ExportedImages.TOWER_ICON1
                                        : valve?.tower >= 40 &&
                                            valve?.tower <= 59
                                          ? ExportedImages.TOWER_ICON2
                                          : valve?.tower >= 60 &&
                                              valve?.tower <= 79
                                            ? ExportedImages.TOWER_ICON3
                                            : valve?.tower >= 80 &&
                                                valve?.tower <= 99
                                              ? ExportedImages.TOWER_ICON4
                                              : valve?.tower === 100
                                                ? ExportedImages.TOWER_ICON5
                                                : ExportedImages.EMPTY_TOWER_ICON
                                    }
                                    alt="tower"
                                    style={{ width: "30px" }}
                                  />
                                  <p
                                    className={
                                      devicestyle.devicetowerpercentage
                                    }
                                  >
                                    {valve?.tower}%
                                  </p>
                                </>
                              ) : (
                                <img
                                  src={ExportedImages.EMPTY_TOWER_ICON}
                                  alt="tower"
                                  style={{ width: "30px" }}
                                />
                              )}
                            </div>

                            <div className={devicestyle.edit_date}>
                              {valve?.device_time ? (
                                <p className="tank-date">
                                  {" "}
                                  {valve?.device_time}
                                </p>
                              ) : null}
                              {devicedata?.access_type === 0 ||
                              devicedata?.access_type === 1 ||
                              devicedata?.access_type === null ? (
                                editMultiDevice ||
                                edittank ||
                                editflow ? null : (
                                  <img
                                    src={
                                      editvalve && index === deviceindex
                                        ? ExportedImages.SAVE_ICON_BLUE
                                        : !editvalve
                                          ? ExportedImages.EDIT_ICON_BLUE
                                          : null
                                    }
                                    className="pointerCurser"
                                    onClick={() => {
                                      setdeviceindex(index);
                                      setvalve(!editvalve);
                                      Editvalvedetail(valve.device_id);
                                      EditDeviceSetting(valve);
                                      setvalveinputdata(
                                        !editvalve
                                          ? {
                                              devicename: valve.device_name,
                                              latitude: valve.latitude,
                                              longitude: valve.longitude,
                                              is_fixed: valve?.is_fixed,
                                              valve_mode: valve?.valve_mode,
                                              notification_alert:
                                                valve?.notification_alert
                                            }
                                          : null
                                      );
                                    }}
                                  />
                                )
                              ) : null}
                            </div>
                          </div>

                          <div className="tank-level-data">
                            <p className="tank-usage">
                              <span className="tank-header">ID - </span>
                              <span className="tank-date">
                                {valve.device_code}
                              </span>
                            </p>
                            {/* LOADING IMAGE */}
                            {isloading && valve.device_id === deviceid ? (
                              <img
                                src={ExportedImages.GREEN_SPINNER_GIF}
                                alt="tower"
                                className="valvespinner"
                                style={{ height: "23px" }}
                              />
                            ) : (
                              <img
                                src={ExportedImages.SPINNER_ICON}
                                alt="rotating-arrow"
                                className="valvespinner"
                                onClick={() => {
                                  loadingspinner(
                                    devicedata?.access_type,
                                    type.requesttypeSeven,
                                    valve.device_id,
                                    devicetype.valvedevicetype
                                  );
                                  // setdeviceindex(index);
                                  setdeviceid(valve.device_id);
                                }}
                              />
                            )}
                            {/* END */}

                            <div className="valvebuttonflex">
                              <p className="mobile" style={{ width: "100px" }}>
                                {valve.operated_by}
                              </p>
                              {valve.device_id === buttongreyid ? (
                                <>
                                  <CommonSwitch
                                    checked={
                                      valve.valve_status === 1 ? true : false
                                    }
                                    color="gray"
                                    type={3}
                                    onChange={() => {
                                      Changebutton(
                                        valve.device_id,
                                        valve.valve_status === 1 ? false : true,
                                        devicedata?.access_type,
                                        buttontype.devicebuttontype
                                      );
                                    }}
                                  />
                                </>
                              ) : devicedata?.access_type === 0 ||
                                devicedata?.access_type === 1 ||
                                devicedata?.access_type === 2 ||
                                devicedata?.access_type === 3 ||
                                devicedata?.access_type === null ? (
                                valve.device_code ? (
                                  <>
                                    <CommonSwitch
                                      checked={
                                        valve.valve_status === 1 ? true : false
                                      }
                                      status={valve.valve_status}
                                      type={3}
                                      onChange={() => {
                                        Changebutton(
                                          valve.device_id,
                                          valve.valve_status === 1
                                            ? false
                                            : true,
                                          devicedata?.access_type,
                                          buttontype.devicebuttontype
                                        );
                                      }}
                                    />
                                  </>
                                ) : null
                              ) : null}
                            </div>
                          </div>
                          {/* <hr></hr> */}
                          <div className="sub-details">
                            <div className="tank-width">
                              <p className="tank-usage">
                                <span className="tank-header">Mode - </span>
                                {editvalve && index === deviceindex ? (
                                  <select
                                    className={"location filedPickBackground"}
                                    style={{ maxWidth: 80 }}
                                    onClick={(event) => {
                                      setvalveinputdata((pre) => ({
                                        ...pre,
                                        valve_mode: event?.target?.value
                                      }));
                                    }}
                                  >
                                    {ValveModalList?.map((ele) => {
                                      return (
                                        <option
                                          value={ele?.value}
                                          selected={
                                            valveinputdata?.valve_mode ===
                                            ele?.value
                                              ? true
                                              : false
                                          }
                                        >
                                          {ele?.label}
                                        </option>
                                      );
                                    })}
                                  </select>
                                ) : (
                                  <span className="tank-date">
                                    {valve.valve_mode === 1
                                      ? ""
                                      : valve.valve_mode === 0
                                        ? "Manual"
                                        : valve.valve_mode === 2
                                          ? "Weekly"
                                          : ""}
                                  </span>
                                )}
                              </p>
                            </div>
                            {/* <div>
                          <img
                            src={ExportedImages.VALVE_IMG}
                            className="valveimg"
                            style={{ top: "140px" }}
                          />
                        </div> */}
                            <div>
                              <img
                                src={ExportedImages.valveImage}
                                className="valveimg"
                                style={{ top: "200px" }}
                              />
                            </div>
                            <div
                              className={`tank-width ${devicestyle.ValveTimeFlex}`}
                              style={{ flexDirection: "column" }}
                            >
                              <button
                                type="button"
                                className="settings-btn"
                                onClick={() => {
                                  loadingspinner(
                                    devicedata?.access_type,
                                    type.requesttypeTwo,
                                    valve.device_id,
                                    devicetype.valvedevicetype
                                  );
                                  setdeviceid(valve.device_id);
                                  // setspinnerindevice(true);
                                }}
                              >
                                {spinnerindevice &&
                                valve.device_id === deviceid ? (
                                  <img
                                    src={ExportedImages.WHITE_SPINNER_GIF}
                                    className="settingspinner"
                                  />
                                ) : (
                                  <ImSpinner11 />
                                )}
                                &nbsp;&nbsp;&nbsp;Settings
                              </button>
                              <p className="tank-date">
                                {valve?.setting_time
                                  ? dayjs(valve?.setting_time).format(
                                      "DD-MM-YY HH:mm:ss"
                                    )
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <p
                            className="tank-usage"
                            style={
                              {
                                // alignItems: "flex-start",
                                // display: "flex",
                              }
                            }
                          >
                            <span className="tank-header">Status Update -</span>
                            &nbsp;
                            <span className="tank-date">
                              {valve?.status_updated_at
                                ? dayjs(valve?.status_updated_at).format(
                                    "DD-MM-YYYY HH:mm:ss"
                                  )
                                : ""}
                            </span>
                          </p>

                          <p className="tank-usage">
                            <span className="tank-header">Location</span>
                            &nbsp;
                            {locationtype === valve.device_id ? (
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
                                  if (!(locationtype === valve.device_id)) {
                                    setlocation(valve.device_id);
                                    loadingspinner(
                                      devicedata?.access_type,
                                      type.requesttypeOne,
                                      valve.device_id,
                                      devicetype.valvedevicetype
                                    );
                                    setdeviceid("");
                                  }
                                }}
                              />
                            )}
                            &nbsp;
                            <p className="tank-usage">
                              <Checkbox
                                // disabled={
                                //   editvalve && index === deviceindex ? false : true
                                // }
                                checked={
                                  editvalve && index === deviceindex
                                    ? valveinputdata.is_fixed
                                    : valve.is_fixed
                                }
                                onChange={() => {
                                  if (editvalve && index === deviceindex) {
                                    setvalveinputdata((pre) => ({
                                      ...pre,
                                      is_fixed:
                                        valveinputdata.is_fixed === 1 ? 0 : 1
                                    }));
                                  }
                                }}
                              />
                              &nbsp;
                              <span className="tank-header">is Fixed</span>
                            </p>
                            {editvalve && index === deviceindex ? (
                              <span className="d-inline-table">
                                <div className="latlan">
                                  Lat
                                  <input
                                    type="text"
                                    onKeyPress={latlong}
                                    maxLength={10}
                                    className={
                                      editvalve && index === deviceindex
                                        ? "location filedPickBackground"
                                        : "devicebg"
                                    }
                                    defaultValue={valve.latitude}
                                    // disabled={((!editvalve)&&(index===deviceindex))  ? true : false}
                                    onChange={(e) => {
                                      setvalveinputdata({
                                        ...valveinputdata,
                                        latitude: e.target.value
                                      });
                                    }}
                                  />
                                  'N
                                </div>

                                <div className="latlan">
                                  Long
                                  <input
                                    type="text"
                                    onKeyPress={latlong}
                                    maxLength={10}
                                    className={
                                      editvalve && index === deviceindex
                                        ? "location filedPickBackground"
                                        : "devicebg"
                                    }
                                    defaultValue={valve.longitude}
                                    // disabled={((!editvalve)&&(index===deviceindex))  ? true : false}
                                    onChange={(e) => {
                                      setvalveinputdata({
                                        ...valveinputdata,
                                        longitude: e.target.value
                                      });
                                    }}
                                  />
                                  'E
                                </div>
                              </span>
                            ) : (
                              <p className="tank-header">
                                Lat-
                                <span className="tank-date">
                                  {valve.latitude === ""
                                    ? null
                                    : `${valve?.latitude} 'N`}
                                </span>
                                <br />
                                Long-
                                <span className="tank-date">
                                  {valve.longitude === ""
                                    ? null
                                    : `${valve?.longitude} 'E`}
                                </span>
                              </p>
                            )}
                          </p>
                          <p className="tank-usage">
                            <span className="tank-header">Source-</span>
                            &nbsp;
                            <span className="tank-date">
                              {valve?.source === 1 ? "Battery" : "EB"}
                            </span>
                          </p>
                          {valve?.source === 1 ? (
                            <p className="tank-usage">
                              <span className="tank-header">Battery-</span>
                              &nbsp;
                              <span className="tank-date">
                                {valve?.battery}
                              </span>
                            </p>
                          ) : null}
                          {valve?.source === 1 ? (
                            <p className="tank-usage">
                              <span className="tank-header">Solar panel-</span>
                              &nbsp;
                              <span className="tank-date">
                                {valve?.solar_panel}
                              </span>
                            </p>
                          ) : null}
                          <p className="tank-usage">
                            <span className="tank-header">
                              Software Version-
                            </span>
                            &nbsp;
                            <span className="tank-date">
                              {valve?.software_version}
                            </span>
                          </p>
                          <p className="tank-usage">
                            <span className="tank-header">
                              Hardware Version-
                            </span>
                            &nbsp;
                            <span className="tank-date">
                              {valve?.hardware_version}
                            </span>
                          </p>
                          <p className="tank-usage">
                            <span className="tank-header">Notification</span>
                            &nbsp;
                            <Toggle
                              editstate={
                                editvalve && index === deviceindex
                                  ? true
                                  : false
                              }
                              isChecked={
                                editvalve && index === deviceindex
                                  ? valveinputdata?.notification_alert
                                  : valve?.notification_alert === 1
                                    ? true
                                    : false
                              }
                              handleChange={({ status }) => {
                                setvalveinputdata((pre) => ({
                                  ...pre,
                                  notification_alert: status ? 1 : 0
                                }));
                              }}
                            />
                          </p>
                          {valve.deviceMerge?.length !== 2 && (
                            <p
                              className="devicemergeInputblock"
                              style={{
                                display:
                                  !valve.deviceMerge?.length && usertype === 3
                                    ? "none"
                                    : ""
                              }}
                            >
                              {usertype !== 3 ? "Merge" : ""}

                              {!mergeDeviceLength(valve) &&
                                mergerDevice.action &&
                                mergerDevice?.parent_device_id ===
                                  valve.device_id && (
                                  <div className="merge_filed_section">
                                    <input
                                      type="text"
                                      className="mergeInput filedPickBackground"
                                      value={mergerDevice.device_code}
                                      maxLength={18}
                                      onChange={(event) => {
                                        setMergerDevice((pre) => ({
                                          ...pre,
                                          device_code: event.target.value
                                        }));
                                      }}
                                    />

                                    {devicemergeConfirmation?.tankdata
                                      ?.device_type === 5 &&
                                      selectedId === valve?.device_id &&
                                      mergerDevice.device_code !== "" && (
                                        <div>
                                          <select
                                            value={mergeSingleDeviceID}
                                            className={
                                              "location filedPickBackground merge_select"
                                            }
                                            onChange={(e) => {
                                              setMergeSingleDeviceID(
                                                e.target.value
                                              );
                                            }}
                                          >
                                            <option value="" disabled selected>
                                              Select a device
                                            </option>
                                            {devicemergeConfirmation?.tankdata?.child_device?.map(
                                              (ele, ind) => {
                                                return (
                                                  <option
                                                    key={ele?.id}
                                                    value={ele?.id}
                                                  >
                                                    {ind + 1}.{ele?.device_name}
                                                  </option>
                                                );
                                              }
                                            )}
                                          </select>
                                        </div>
                                      )}
                                  </div>
                                )}
                              {!mergeDeviceLength(valve) && usertype !== 3 && (
                                <div className="merge_icon_container">
                                  <img
                                    src={
                                      mergerDevice.action &&
                                      mergerDevice?.parent_device_id ===
                                        valve.device_id
                                        ? mergerDevice?.device_code
                                          ? devicemergeConfirmation?.tankdata
                                              ?.device_type === 5
                                            ? ExportedImages?.EDIT_ICON_BLUE
                                            : ExportedImages.SAVED_TICK_ICON
                                          : ExportedImages.CANCEL_ICON
                                        : ExportedImages.MERGE_LINK_ICON
                                    }
                                    alt="MergeIcon"
                                    className={
                                      mergerDevice.action &&
                                      mergerDevice?.parent_device_id ===
                                        valve.device_id
                                        ? "SavemergeIcon"
                                        : "MergeIcon"
                                    }
                                    onClick={() => {
                                      setSelectedId(valve?.device_id);
                                      setMergeSingleDeviceID(null);
                                      if (!mergerDevice?.device_code) {
                                        setMergerDevice({
                                          child_device_id: "",
                                          child_device_code: "",
                                          is_tank: false,
                                          action: "",
                                          parent_device_id: ""
                                        });
                                        setdevicemergeConfirmation({
                                          show: false,
                                          data: {},
                                          action: "",
                                          tankdata: ""
                                        });
                                      }

                                      if (
                                        mergerDevice.action &&
                                        mergerDevice?.parent_device_id ===
                                          valve.device_id
                                      ) {
                                        if (mergerDevice.device_code > 0) {
                                          setMergeSingleDeviceID("");
                                          HandlecheckDeviceType(
                                            mergerDevice.device_code,
                                            "device"
                                          );
                                        }
                                      } else {
                                        setdevicemergeConfirmation((prev) => ({
                                          ...prev,
                                          tankdata: { device_type: null }
                                        }));
                                        setMergerDevice((pre) => ({
                                          child_device_id: "",
                                          child_device_code: "",
                                          parent_device_id: valve?.device_id,
                                          is_tank: false,
                                          action:
                                            mergerDevice?.parent_device_id ===
                                              valve.device_id &&
                                            mergerDevice.action
                                              ? ""
                                              : "merge"
                                        }));
                                      }
                                    }}
                                  />
                                  {devicemergeConfirmation?.tankdata
                                    ?.device_type === 5 &&
                                  selectedId === valve.device_id &&
                                  mergerDevice.device_code !== "" ? (
                                    <img
                                      src={ExportedImages?.SAVED_TICK_ICON}
                                      style={{
                                        width: 18,
                                        cursor: "pointer"
                                      }}
                                      onClick={() => {
                                        if (
                                          devicemergeConfirmation?.tankdata
                                            ?.device_type === 5 &&
                                          mergeSingleDeviceID
                                        ) {
                                          setdevicemergeConfirmation((pre) => ({
                                            ...pre,
                                            show: true,
                                            action: "merge",
                                            data: valve?.device_id
                                          }));
                                        } else {
                                          toast.error("Select any device");
                                        }
                                      }}
                                    />
                                  ) : null}
                                </div>
                              )}
                            </p>
                          )}
                          {valve.deviceMerge?.length
                            ? valve?.deviceMerge?.map((item) => {
                                return (
                                  <div
                                    className="mergeSettings mergeSettinglimit"
                                    style={{ width: "100%" }}
                                  >
                                    <div
                                      className={devicestyle.DeviceLineStyle}
                                    >
                                      <div>
                                        <span className="tank-date mergetankname">
                                          {item?.device_name}
                                        </span>
                                        <span className="tank-date">
                                          ( {item?.device_code} )
                                        </span>
                                      </div>

                                      <div
                                        className={
                                          devicestyle.deviceStyleContainer
                                        }
                                      >
                                        <p className="tank-date mergetankname  input_width">
                                          {item?.device_type === 1
                                            ? "Tank"
                                            : "Flow"}{" "}
                                          Status- &nbsp;
                                          <span className="tank-date">
                                            {item?.device_type === 1
                                              ? item?.tank_level
                                              : item?.usage_limit === 1
                                                ? "Reached"
                                                : item?.usage_limit === 0
                                                  ? "Not Reached"
                                                  : ""}
                                          </span>
                                        </p>
                                        {usertype !== 3 &&
                                        DeviceMergeSettingData.isEdit &&
                                        DeviceMergeSettingData?.merge_id ===
                                          item?.merge_id ? (
                                          <img
                                            src={ExportedImages.DELETE_ICON_RED}
                                            alt="deleteimg"
                                            className="MergeIcon"
                                            onClick={() => {
                                              setdevicemergeConfirmation({
                                                action: "delete",
                                                show: true,
                                                merge_id: item.merge_id,
                                                tankdata: item
                                              });
                                            }}
                                          />
                                        ) : (
                                          ""
                                        )}
                                        {(usertype !== 3 &&
                                          DeviceMergeSettingData.isEdit &&
                                          DeviceMergeSettingData?.merge_id ===
                                            item?.merge_id) ||
                                        !DeviceMergeSettingData?.isEdit ? (
                                          <img
                                            src={
                                              DeviceMergeSettingData.isEdit &&
                                              DeviceMergeSettingData?.merge_id ===
                                                item?.merge_id
                                                ? ExportedImages.SAVE_ICON_BLUE
                                                : ExportedImages.EDIT_ICON_BLUE
                                            }
                                            className="pointerCurser"
                                            onClick={() => {
                                              if (
                                                DeviceMergeSettingData?.isEdit
                                              ) {
                                                handleUpdateMergeSettings(
                                                  2,
                                                  item?.device_type
                                                );
                                              } else {
                                                setDeviceMergeSettingData(
                                                  (pre) => ({
                                                    ...pre,
                                                    isEdit: true,
                                                    merge_id: item?.merge_id
                                                  })
                                                );
                                              }
                                            }}
                                          />
                                        ) : (
                                          ""
                                        )}
                                      </div>
                                    </div>
                                    <div
                                      className="mergeSettings"
                                      style={{
                                        flexDirection: "row",
                                        flexFlow: "wrap",
                                        width: "100%"
                                      }}
                                    >
                                      {item?.device_type === 1 && (
                                        <p className="tank-date mergetankname  input_width NoWrapStyle">
                                          High Limit -
                                          {DeviceMergeSettingData.isEdit &&
                                          DeviceMergeSettingData?.merge_id ===
                                            item?.merge_id ? (
                                            <>
                                              &nbsp;
                                              <input
                                                type="text"
                                                maxLength={8}
                                                style={{ maxWidth: "60px" }}
                                                // onKeyPress={avoidletters}
                                                className={
                                                  "location filedPickBackground"
                                                }
                                                onChange={(e) => {
                                                  if (
                                                    Float_Validation(
                                                      e.target?.value
                                                    ) &&
                                                    e.target.value <= 99999.99
                                                  ) {
                                                    setDeviceMergeSettingData({
                                                      ...DeviceMergeSettingData,
                                                      high_limit: e.target.value
                                                    });
                                                  }
                                                }}
                                                value={
                                                  DeviceMergeSettingData?.high_limit
                                                }
                                                // onClick={() => tolimit()}
                                              />
                                              &nbsp;
                                              <select
                                                className={
                                                  "location filedPickBackground"
                                                }
                                                onClick={(e) => {
                                                  setDeviceMergeSettingData({
                                                    ...DeviceMergeSettingData,
                                                    high_limit_action:
                                                      JSON.parse(e.target.value)
                                                  });
                                                }}
                                              >
                                                <option
                                                  value="0"
                                                  selected={
                                                    DeviceMergeSettingData?.high_limit_action ===
                                                    0
                                                      ? true
                                                      : false
                                                  }
                                                >
                                                  No Action
                                                </option>
                                                <option
                                                  value="1"
                                                  selected={
                                                    DeviceMergeSettingData?.high_limit_action ===
                                                    1
                                                      ? true
                                                      : false
                                                  }
                                                >
                                                  Close Valve
                                                </option>
                                                <option
                                                  value="2"
                                                  selected={
                                                    DeviceMergeSettingData?.high_limit_action ===
                                                    2
                                                      ? true
                                                      : false
                                                  }
                                                >
                                                  Open Valve
                                                </option>
                                              </select>
                                            </>
                                          ) : (
                                            <>
                                              <span className="tank-date">
                                                {item?.high_limit}
                                              </span>
                                              &nbsp;
                                              <span className="tank-date">
                                                (
                                                {getlimitAction(
                                                  item.high_limit_action
                                                )}
                                                )
                                              </span>
                                            </>
                                          )}
                                        </p>
                                      )}
                                      {item?.device_type === 1 && (
                                        <p className="tank-date mergetankname  input_width NoWrapStyle">
                                          Low Limit -
                                          {DeviceMergeSettingData.isEdit &&
                                          DeviceMergeSettingData?.merge_id ===
                                            item?.merge_id ? (
                                            <>
                                              &nbsp;
                                              <input
                                                type="text"
                                                maxLength={10}
                                                style={{ maxWidth: "60px" }}
                                                // onKeyPress={avoidletters}
                                                className={
                                                  "location filedPickBackground"
                                                }
                                                onChange={(e) => {
                                                  if (
                                                    Float_Validation(
                                                      e.target.value
                                                    ) &&
                                                    e.target.value <= 99999.99
                                                  ) {
                                                    setDeviceMergeSettingData({
                                                      ...DeviceMergeSettingData,
                                                      low_limit: e.target.value
                                                    });
                                                  }
                                                }}
                                                value={
                                                  DeviceMergeSettingData?.low_limit
                                                }
                                                // onClick={() => tolimit()}
                                              />
                                              &nbsp;
                                              <select
                                                className={
                                                  "location filedPickBackground"
                                                }
                                                onClick={(e) => {
                                                  setDeviceMergeSettingData({
                                                    ...DeviceMergeSettingData,
                                                    low_limit_action:
                                                      JSON.parse(e.target.value)
                                                  });
                                                }}
                                              >
                                                <option
                                                  value="0"
                                                  selected={
                                                    DeviceMergeSettingData?.low_limit_action ===
                                                    0
                                                      ? true
                                                      : false
                                                  }
                                                >
                                                  No Action
                                                </option>
                                                <option
                                                  value="1"
                                                  selected={
                                                    DeviceMergeSettingData?.low_limit_action ===
                                                    1
                                                      ? true
                                                      : false
                                                  }
                                                >
                                                  Close Valve
                                                </option>
                                                <option
                                                  value="2"
                                                  selected={
                                                    DeviceMergeSettingData?.low_limit_action ===
                                                    2
                                                      ? true
                                                      : false
                                                  }
                                                >
                                                  Open Valve
                                                </option>
                                              </select>
                                            </>
                                          ) : (
                                            <>
                                              <span className="tank-date">
                                                {item?.low_limit}
                                              </span>
                                              &nbsp;
                                              <span className="tank-date">
                                                {getlimitAction(
                                                  item.low_limit_action
                                                )}
                                              </span>
                                            </>
                                          )}
                                        </p>
                                      )}
                                      {item?.device_type === 2 && (
                                        <div
                                          className="tank-date mergetankname  input_width NoWrapStyle"
                                          style={{ width: "100%" }}
                                        >
                                          <span>Usage Limit Action-</span>
                                          {DeviceMergeSettingData.isEdit &&
                                          DeviceMergeSettingData?.merge_id ===
                                            item?.merge_id ? (
                                            <>
                                              <select
                                                className={
                                                  "location filedPickBackground"
                                                }
                                                onClick={(e) => {
                                                  setDeviceMergeSettingData({
                                                    ...DeviceMergeSettingData,
                                                    usage_limit_action:
                                                      JSON.parse(e.target.value)
                                                  });
                                                }}
                                              >
                                                <option
                                                  value="0"
                                                  selected={
                                                    DeviceMergeSettingData?.usage_limit_action ===
                                                    0
                                                      ? true
                                                      : false
                                                  }
                                                >
                                                  No Action
                                                </option>
                                                <option
                                                  value="1"
                                                  selected={
                                                    DeviceMergeSettingData?.usage_limit_action ===
                                                    1
                                                      ? true
                                                      : false
                                                  }
                                                >
                                                  Close Valve
                                                </option>
                                                <option
                                                  value="2"
                                                  selected={
                                                    DeviceMergeSettingData?.usage_limit_action ===
                                                    2
                                                      ? true
                                                      : false
                                                  }
                                                >
                                                  Open Valve
                                                </option>
                                              </select>
                                            </>
                                          ) : (
                                            <>
                                              <span className="tank-date">
                                                (
                                                {getlimitAction(
                                                  item.usage_limit_action
                                                )}
                                                )
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            : ""}
                        </div>
                        {(usertype === 3 || usertype === 2) && (
                          <BlurComponent
                            blurData={{
                              name: valve?.device_name || "",
                              show: valve?.amc_status < 1 ? true : false,
                              id: valve?.device_code || "",
                              amc_msg: valve?.amc_msg || "",
                              not_show_pay: valve?.not_show_pay,
                              not_show_charge: valve?.not_show_charge,
                              amc_cost: valve?.amc_cost || ""
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
            </div>
          )}

          {multiDeviceData?.length > 0
            ? multiDeviceData?.map((multideviceItem, index) => {
                return (
                  <div
                    className={
                      multideviceItem.amc_status < 1 &&
                      (usertype === 3 || usertype === 2)
                        ? "BlurViewContainer"
                        : ""
                    }
                  >
                    <div
                      className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                      ${commonstyle.cards_padding} new-details tank-bgcolor mt-2`}
                      key={index}
                    >
                      <div className={devicestyle.tank_level}>
                        <div className="motor-level">
                          <div className={commonstyle.rowStyle}>
                            <div className="inputWidth">
                              {editMultiDevice && index === deviceindex ? (
                                <input
                                  type="text"
                                  disabled={
                                    !editMultiDevice
                                      ? true
                                      : editMultiDevice && index === deviceindex
                                        ? false
                                        : true
                                  }
                                  className={`${devicestyle.device_name_input} filedPickBackground`}
                                  onChange={(e) =>
                                    setMultiDeviceInputData({
                                      ...multiDeviceInputData,
                                      devicename: e.target.value
                                    })
                                  }
                                  defaultValue={multideviceItem.device_name}
                                />
                              ) : (
                                <OverlayTrigger
                                  key="top"
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top">
                                      <strong>
                                        {multideviceItem?.device_name}
                                      </strong>
                                    </Tooltip>
                                  }
                                >
                                  <p
                                    className={`${devicestyle.device_name} `}
                                    style={{ background: "#FF9D23" }}
                                  >
                                    {multideviceItem?.device_name}
                                  </p>
                                </OverlayTrigger>
                              )}
                            </div>
                            {devicedata?.access_type === 0 ||
                            devicedata?.access_type === 1 ||
                            devicedata?.access_type === null ? (
                              editflow || editvalve ? null : (
                                <img
                                  alt="pointerCurser"
                                  src={
                                    editMultiDevice && index === deviceindex
                                      ? ExportedImages.SAVE_ICON_BLUE
                                      : !editMultiDevice
                                        ? ExportedImages.EDIT_ICON_BLUE
                                        : null
                                  }
                                  className="pointerCurser"
                                  onClick={() => {
                                    setEditMultiDevice((pre) => !pre);
                                    EditMultiDevicedetail(
                                      multideviceItem?.device_id
                                    );
                                    setdeviceindex(index);
                                    setMultiDeviceInputData({
                                      is_fixed: multideviceItem.is_fixed,
                                      devicename: multideviceItem.device_name,

                                      latitude: multideviceItem.latitude,
                                      longitude: multideviceItem.longitude,
                                      notification_alert:
                                        multideviceItem?.notification_alert || 0
                                    });
                                  }}
                                />
                              )
                            ) : null}
                          </div>

                          {multideviceItem?.tower ? (
                            <>
                              <img
                                src={
                                  multideviceItem?.tower >= 20 &&
                                  multideviceItem?.tower <= 39
                                    ? ExportedImages.TOWER_ICON1
                                    : multideviceItem?.tower >= 40 &&
                                        multideviceItem?.tower <= 59
                                      ? ExportedImages.TOWER_ICON2
                                      : multideviceItem?.tower >= 60 &&
                                          multideviceItem?.tower <= 79
                                        ? ExportedImages.TOWER_ICON3
                                        : multideviceItem?.tower >= 80 &&
                                            multideviceItem?.tower <= 99
                                          ? ExportedImages.TOWER_ICON4
                                          : multideviceItem?.tower === 100
                                            ? ExportedImages.TOWER_ICON5
                                            : ExportedImages.EMPTY_TOWER_ICON
                                }
                                alt="tower"
                                style={{ width: "30px" }}
                              />
                              <p className={devicestyle.devicetowerpercentage}>
                                {multideviceItem?.tower}%
                              </p>
                            </>
                          ) : (
                            <img
                              src={ExportedImages.EMPTY_TOWER_ICON}
                              alt="tower"
                              style={{ width: "30px" }}
                            />
                          )}
                        </div>

                        <div className={devicestyle.edit_date}>
                          {multideviceItem?.device_time ? (
                            <p className="tank-date">
                              {multideviceItem?.device_time}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="tank-level-data">
                        <p className={commonstyle.margin_zero}>
                          <span className="tank-header">ID - </span>
                          <span className="tank-date">
                            {multideviceItem.device_code}
                          </span>
                        </p>
                        {/* LOADING IMAGE */}
                        {isloading && deviceid === multideviceItem.device_id ? (
                          <img
                            src={ExportedImages.GREEN_SPINNER_GIF}
                            alt="tower"
                            className="tanpkinner"
                            style={{ height: "23px" }}
                          />
                        ) : (
                          <img
                            src={ExportedImages.SPINNER_ICON}
                            alt="rotating-arrow"
                            className="tanpkinner"
                            onClick={() => {
                              loadingspinner(
                                devicedata?.access_type,
                                type.requesttypeSeven,
                                multideviceItem.device_id,
                                devicetype.multideviceType
                              );

                              setdeviceid(multideviceItem.device_id);
                            }}
                          />
                        )}
                        {/* END */}

                        <div className="btnWidth">
                          <button
                            type="button"
                            className="settings-btn"
                            onClick={() => {
                              loadingspinner(
                                devicedata?.access_type,
                                type.requesttypeTwo,
                                multideviceItem.device_id,
                                devicetype.multideviceType
                              );
                              setdeviceid(multideviceItem.device_id);
                            }}
                          >
                            {spinnerindevice &&
                            multideviceItem.device_id === deviceid ? (
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
                      </div>

                      <div className="sub-details w-100">
                        <div className="detailsflex">
                          <div className="d-flex flex-row">
                            <p className="tank-header">Location</p>
                            {locationtype === multideviceItem.device_id ? (
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
                                  if (
                                    !(
                                      locationtype === multideviceItem.device_id
                                    )
                                  ) {
                                    setlocation(multideviceItem.device_id);
                                    loadingspinner(
                                      devicedata?.access_type,
                                      type.requesttypeOne,
                                      multideviceItem.device_id,
                                      devicetype.multideviceType
                                    );
                                    setdeviceid("");
                                  }
                                }}
                              />
                            )}
                            <div className="tank-usage">
                              <Checkbox
                                checked={
                                  editMultiDevice && index === deviceindex
                                    ? multiDeviceInputData?.is_fixed === 1
                                    : multideviceItem?.is_fixed
                                }
                                onChange={() => {
                                  if (
                                    editMultiDevice &&
                                    index === deviceindex
                                  ) {
                                    setMultiDeviceInputData({
                                      ...multiDeviceInputData,
                                      is_fixed:
                                        multiDeviceInputData?.is_fixed === 1
                                          ? 0
                                          : 1
                                    });
                                  }
                                }}
                              />
                              &nbsp;
                              <span className="tank-header">is Fixed</span>
                            </div>
                          </div>
                          {editMultiDevice && index === deviceindex ? (
                            <div className="d-flex flex-row">
                              <div className="latlan">
                                Lat
                                <input
                                  type="text"
                                  onKeyPress={latlong}
                                  maxLength={10}
                                  disabled={
                                    !editMultiDevice
                                      ? true
                                      : editMultiDevice && index === deviceindex
                                        ? false
                                        : true
                                  }
                                  className={
                                    editMultiDevice && index === deviceindex
                                      ? "location filedPickBackground"
                                      : "devicebg"
                                  }
                                  onChange={(e) => {
                                    setMultiDeviceInputData({
                                      ...multiDeviceInputData,
                                      latitude: e.target.value
                                    });
                                  }}
                                  defaultValue={multideviceItem?.latitude}
                                />
                                'N
                              </div>

                              <div className="latlan">
                                Long
                                <input
                                  type="text"
                                  onKeyPress={latlong}
                                  maxLength={10}
                                  disabled={
                                    !editMultiDevice
                                      ? true
                                      : editMultiDevice && index === deviceindex
                                        ? false
                                        : true
                                  }
                                  className={
                                    editMultiDevice && index === deviceindex
                                      ? "location filedPickBackground"
                                      : "devicebg"
                                  }
                                  onChange={(e) => {
                                    setMultiDeviceInputData({
                                      ...multiDeviceInputData,
                                      longitude: e.target.value
                                    });
                                  }}
                                  defaultValue={multideviceItem?.longitude}
                                />
                                'E
                              </div>
                            </div>
                          ) : (
                            <div className="tank-header">
                              Lat-
                              <span className="tank-date">
                                {multideviceItem.latitude === ""
                                  ? null
                                  : `${multideviceItem?.latitude} 'N`}
                              </span>
                              &nbsp; &nbsp; Long-
                              <span className="tank-date">
                                {multideviceItem.longitude === ""
                                  ? null
                                  : `${multideviceItem?.longitude} 'E`}
                              </span>
                            </div>
                          )}
                          {multideviceItem?.reserved1 && (
                            <p className="tank-header">
                              {multideviceItem?.reserved1}
                            </p>
                          )}
                          {multideviceItem?.reserved2 && (
                            <p className="tank-header">
                              {multideviceItem?.reserved2}
                            </p>
                          )}{" "}
                          {multideviceItem?.reserved3 && (
                            <p className="tank-header">
                              {multideviceItem?.reserved3}
                            </p>
                          )}{" "}
                          {multideviceItem?.reserved4 && (
                            <p className="tank-header">
                              {multideviceItem?.reserved4}
                            </p>
                          )}
                        </div>
                        <div className="detailsflex">
                          <p>
                            <span className="tank-header">Source</span>
                            <span className="tank-date">
                              -{" "}
                              {multideviceItem?.source === 1 ? "Battery" : "EB"}
                            </span>
                          </p>

                          {multideviceItem?.source === 1 && (
                            <div
                              style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center"
                              }}
                            >
                              <p className="tank-usage">
                                <span className="tank-header">Battery - </span>
                                <span className="tank-date">
                                  {multideviceItem.battery}
                                </span>
                              </p>
                              <p className="tank-usage">
                                <span className="tank-header">
                                  Solar Panel -
                                </span>
                                <span className="tank-date">
                                  {multideviceItem.solar_panel}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="detailsflex">
                          <p>
                            <span className="tank-header">
                              Hardware Version -
                            </span>
                            <span className="tank-date">
                              {multideviceItem?.hardware_version}
                            </span>
                          </p>
                          <p>
                            <span className="tank-header">
                              Software Version -
                            </span>
                            <span className="tank-date">
                              {multideviceItem?.software_version}
                            </span>
                          </p>
                          <p>
                            <span className="tank-header">Notification</span>
                            &nbsp;
                            <Toggle
                              // id={index}
                              editstate={
                                editMultiDevice && index === deviceindex
                                  ? true
                                  : false
                              }
                              isChecked={
                                editMultiDevice && index === deviceindex
                                  ? multiDeviceInputData?.notification_alert
                                  : multideviceItem?.notification_alert === 1
                                    ? true
                                    : false
                              }
                              handleChange={({ status }) => {
                                setMultiDeviceInputData((pre) => ({
                                  ...pre,
                                  notification_alert: status ? 1 : 0
                                }));
                              }}
                            />
                          </p>
                        </div>
                      </div>
                      <hr />
                      <div>
                        <Row gutter={[10, 10]}>
                          {multideviceItem?.level_data?.length > 0 ? (
                            <Col xs={24}>
                              <Row gutter={[10, 10]}>
                                <Col xs={24}>
                                  <p className={commonstyle.deviceHeader}>
                                    Tank
                                  </p>
                                </Col>
                                {multideviceItem?.level_data?.map(
                                  (tankItem, tankIndex) => {
                                    return (
                                      <Col
                                        xs={24}
                                        sm={24}
                                        md={12}
                                        lg={12}
                                        xl={6}
                                      >
                                        <div
                                          className={commonstyle.CartItemBox}
                                        >
                                          <div className={commonstyle.rowStyle}>
                                            <div
                                              className={commonstyle.rowStyle}
                                            >
                                              {" "}
                                              <div className="inputWidth">
                                                {checkIsEditEnabled(
                                                  tankItem
                                                ) ? (
                                                  <input
                                                    type="text"
                                                    disabled={
                                                      !editMultiDeviceChild?.isEdit
                                                        ? true
                                                        : checkIsEditEnabled(
                                                              tankItem
                                                            )
                                                          ? false
                                                          : true
                                                    }
                                                    className={`${devicestyle.device_name_input} filedPickBackground`}
                                                    onChange={(e) => {
                                                      setEditMultiDeviceChild(
                                                        (pre) => ({
                                                          ...pre,
                                                          editData: {
                                                            ...pre.editData,
                                                            device_name:
                                                              e.target.value
                                                          }
                                                        })
                                                      );
                                                    }}
                                                    value={
                                                      checkIsEditEnabled(
                                                        tankItem
                                                      )
                                                        ? editMultiDeviceChild
                                                            ?.editData
                                                            ?.device_name
                                                        : tankItem.device_name
                                                    }
                                                  />
                                                ) : (
                                                  <OverlayTrigger
                                                    key="top"
                                                    placement="top"
                                                    overlay={
                                                      <Tooltip id="tooltip-top">
                                                        <strong>
                                                          {
                                                            tankItem?.device_name
                                                          }
                                                        </strong>
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <p
                                                      className={`${devicestyle.device_name} ${devicestyle.device_name_tank_col}`}
                                                    >
                                                      {tankItem?.device_name}
                                                    </p>
                                                  </OverlayTrigger>
                                                )}
                                              </div>
                                              <img
                                                alt="pointerCurser"
                                                src={
                                                  checkIsEditEnabled(tankItem)
                                                    ? ExportedImages.SAVE_ICON_BLUE
                                                    : !editMultiDeviceChild?.isEdit
                                                      ? ExportedImages.EDIT_ICON_BLUE
                                                      : null
                                                }
                                                height={20}
                                                className="pointerCurser"
                                                onClick={() => {
                                                  if (
                                                    editMultiDeviceChild?.isEdit
                                                  ) {
                                                    handleEditMultiDeviceChildItem();
                                                  } else {
                                                    setEditMultiDeviceChild({
                                                      isEdit: true,
                                                      device_id:
                                                        tankItem?.device_id,
                                                      editData: tankItem
                                                    });
                                                  }
                                                }}
                                              />
                                            </div>

                                            <div className="d-flex flex-row align-items-center">
                                              {tankItem?.device_code && (
                                                <p
                                                  className={
                                                    devicestyle.lineTextStyle
                                                  }
                                                >
                                                  {tankItem?.device_code}
                                                </p>
                                              )}
                                              {devicedata?.access_type === 0 ||
                                              devicedata?.access_type === 1 ||
                                              devicedata?.access_type ===
                                                null ? (
                                                editMultiDevice ||
                                                editflow ||
                                                editvalve ? null : (
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      gap: 10
                                                    }}
                                                  >
                                                    <p className="fw-bold h6">
                                                      {tankItem?.device_order}
                                                    </p>
                                                  </div>
                                                )
                                              ) : null}
                                            </div>
                                          </div>
                                          <div
                                            className={`${commonstyle.rowStyle} align-items-start`}
                                          >
                                            <div
                                              className={
                                                devicestyle.RowLineFlex
                                              }
                                            >
                                              <p className="input_width mb-0">
                                                <span
                                                  className="tank-header"
                                                  id={
                                                    tankItem?.indication === 1
                                                      ? "limitblink"
                                                      : null
                                                  }
                                                >
                                                  High Limit -
                                                </span>
                                                <div
                                                  className={
                                                    devicestyle.editFiledContainer
                                                  }
                                                >
                                                  {tankItem?.high_limit ||
                                                  checkIsEditEnabled(
                                                    tankItem
                                                  ) ? (
                                                    checkIsEditEnabled(
                                                      tankItem
                                                    ) ? (
                                                      <input
                                                        type="text"
                                                        maxLength={10}
                                                        onKeyPress={
                                                          avoidletters
                                                        }
                                                        className={
                                                          checkIsEditEnabled(
                                                            tankItem
                                                          )
                                                            ? "location filedPickBackground"
                                                            : "devicebg tank-date"
                                                        }
                                                        disabled={
                                                          !editMultiDeviceChild?.isEdit
                                                            ? true
                                                            : checkIsEditEnabled(
                                                                  tankItem
                                                                )
                                                              ? false
                                                              : true
                                                        }
                                                        onChange={(e) => {
                                                          setEditMultiDeviceChild(
                                                            (pre) => ({
                                                              ...pre,
                                                              editData: {
                                                                ...pre?.editData,
                                                                high_limit:
                                                                  e.target.value
                                                              }
                                                            })
                                                          );
                                                        }}
                                                        value={
                                                          checkIsEditEnabled(
                                                            tankItem
                                                          )
                                                            ? editMultiDeviceChild
                                                                ?.editData
                                                                ?.high_limit
                                                            : tankItem?.high_limit
                                                        }
                                                      />
                                                    ) : (
                                                      <span className="tank-date">
                                                        {tankItem?.high_limit}
                                                      </span>
                                                    )
                                                  ) : null}
                                                  &nbsp;&nbsp;
                                                  {checkIsEditEnabled(
                                                    tankItem
                                                  ) ? (
                                                    <select
                                                      className={
                                                        checkIsEditEnabled(
                                                          tankItem
                                                        )
                                                          ? "location filedPickBackground"
                                                          : "devicebg"
                                                      }
                                                      onClick={(e) => {
                                                        setEditMultiDeviceChild(
                                                          (pre) => ({
                                                            ...pre,
                                                            editData: {
                                                              ...pre?.editData,
                                                              high_limit_action:
                                                                JSON.parse(
                                                                  e.target.value
                                                                )
                                                            }
                                                          })
                                                        );
                                                      }}
                                                    >
                                                      <option
                                                        value="0"
                                                        selected={
                                                          tankItem?.high_limit_action ===
                                                          0
                                                            ? true
                                                            : false
                                                        }
                                                      >
                                                        No Action
                                                      </option>
                                                      <option
                                                        value="1"
                                                        selected={
                                                          tankItem?.high_limit_action ===
                                                          1
                                                            ? true
                                                            : false
                                                        }
                                                      >
                                                        Off Motor
                                                      </option>
                                                      <option
                                                        value="2"
                                                        selected={
                                                          tankItem?.high_limit_action ===
                                                          2
                                                            ? true
                                                            : false
                                                        }
                                                      >
                                                        On Motor
                                                      </option>
                                                    </select>
                                                  ) : (
                                                    <>
                                                      <span className="tank-date">
                                                        {tankItem?.high_limit_action ===
                                                        0
                                                          ? "No action"
                                                          : tankItem?.high_limit_action ===
                                                              1
                                                            ? "Off Motor"
                                                            : tankItem?.high_limit_action ===
                                                                2
                                                              ? "On Motor"
                                                              : null}
                                                      </span>
                                                    </>
                                                  )}
                                                </div>
                                              </p>

                                              <p className=" input_width mb-0">
                                                <span
                                                  className={"tank-header"}
                                                  id={
                                                    tankItem?.indication === 2
                                                      ? "limitblink"
                                                      : null
                                                  }
                                                >
                                                  Low Limit -
                                                </span>
                                                <div
                                                  className={
                                                    devicestyle.editFiledContainer
                                                  }
                                                >
                                                  {tankItem?.low_limit ||
                                                  checkIsEditEnabled(
                                                    tankItem
                                                  ) ? (
                                                    checkIsEditEnabled(
                                                      tankItem
                                                    ) ? (
                                                      <input
                                                        type="text"
                                                        maxLength={10}
                                                        onKeyPress={
                                                          avoidletters
                                                        }
                                                        className={
                                                          checkIsEditEnabled(
                                                            tankItem
                                                          )
                                                            ? "location filedPickBackground"
                                                            : "devicebg"
                                                        }
                                                        disabled={
                                                          !editMultiDeviceChild?.isEdit
                                                            ? true
                                                            : checkIsEditEnabled(
                                                                  tankItem
                                                                )
                                                              ? false
                                                              : true
                                                        }
                                                        onChange={(e) => {
                                                          setEditMultiDeviceChild(
                                                            (pre) => ({
                                                              ...pre,
                                                              editData: {
                                                                ...pre?.editData,
                                                                low_limit:
                                                                  e.target.value
                                                              }
                                                            })
                                                          );
                                                        }}
                                                        value={
                                                          checkIsEditEnabled(
                                                            tankItem
                                                          )
                                                            ? editMultiDeviceChild
                                                                ?.editData
                                                                ?.low_limit
                                                            : tankItem?.low_limit
                                                        }
                                                      />
                                                    ) : (
                                                      <span className="tank-date">
                                                        {tankItem?.low_limit}
                                                      </span>
                                                    )
                                                  ) : null}
                                                  &nbsp;&nbsp;
                                                  {checkIsEditEnabled(
                                                    tankItem
                                                  ) ? (
                                                    <select
                                                      className={
                                                        checkIsEditEnabled(
                                                          tankItem
                                                        )
                                                          ? "location filedPickBackground"
                                                          : "devicebg"
                                                      }
                                                      onClick={(e) =>
                                                        setEditMultiDeviceChild(
                                                          (pre) => ({
                                                            ...pre,
                                                            editData: {
                                                              ...pre?.editData,
                                                              low_limit_action:
                                                                JSON.parse(
                                                                  e.target.value
                                                                )
                                                            }
                                                          })
                                                        )
                                                      }
                                                    >
                                                      <option
                                                        value="0"
                                                        selected={
                                                          tankItem?.low_limit_action ===
                                                          0
                                                            ? true
                                                            : false
                                                        }
                                                      >
                                                        No Action
                                                      </option>
                                                      <option
                                                        value="1"
                                                        selected={
                                                          tankItem?.low_limit_action ===
                                                          1
                                                            ? true
                                                            : false
                                                        }
                                                      >
                                                        Off Motor
                                                      </option>
                                                      <option
                                                        value="2"
                                                        selected={
                                                          tankItem?.low_limit_action ===
                                                          2
                                                            ? true
                                                            : false
                                                        }
                                                      >
                                                        On Motor
                                                      </option>
                                                    </select>
                                                  ) : (
                                                    <>
                                                      <span className="tank-date">
                                                        {tankItem?.low_limit_action ===
                                                        0
                                                          ? "No action"
                                                          : tankItem?.low_limit_action ===
                                                              1
                                                            ? "Off Motor"
                                                            : tankItem?.low_limit_action ===
                                                                2
                                                              ? "On Motor"
                                                              : null}
                                                      </span>
                                                    </>
                                                  )}{" "}
                                                </div>
                                              </p>

                                              <p className="input_width mb-0">
                                                <span className={"tank-header"}>
                                                  Tank Level -
                                                </span>{" "}
                                                <span className="tank-date">
                                                  {tankItem?.tank_level || 0}%
                                                </span>
                                              </p>
                                              <p style={{ margin: 0 }}>
                                                <span className="tank-header">
                                                  Tank Height -
                                                </span>
                                                {checkIsEditEnabled(
                                                  tankItem
                                                ) ? (
                                                  <input
                                                    type="text"
                                                    maxLength={10}
                                                    disabled={
                                                      !editMultiDeviceChild?.isEdit
                                                        ? true
                                                        : checkIsEditEnabled(
                                                              tankItem
                                                            )
                                                          ? false
                                                          : true
                                                    }
                                                    onKeyPress={(e) =>
                                                      avoidletters(e)
                                                    }
                                                    className={
                                                      checkIsEditEnabled(
                                                        tankItem
                                                      )
                                                        ? "location filedPickBackground"
                                                        : "devicebg"
                                                    }
                                                    onChange={(e) => {
                                                      setEditMultiDeviceChild(
                                                        (pre) => ({
                                                          ...pre,
                                                          editData: {
                                                            ...pre?.editData,
                                                            tank_height:
                                                              e.target.value
                                                          }
                                                        })
                                                      );
                                                    }}
                                                    value={
                                                      checkIsEditEnabled(
                                                        tankItem
                                                      )
                                                        ? editMultiDeviceChild
                                                            ?.editData
                                                            ?.tank_height
                                                        : tankItem?.tank_height
                                                    }
                                                  />
                                                ) : (
                                                  <span className="tank-date">
                                                    {tankItem?.tank_height !==
                                                    null
                                                      ? tankItem?.tank_height
                                                      : "-"}
                                                  </span>
                                                )}
                                                <span className="tank-date">
                                                  {" "}
                                                  ft
                                                </span>
                                              </p>
                                              {checkIsEditEnabled(tankItem) && (
                                                <>
                                                  {
                                                    // (tankItem.tank_width > 0 ||
                                                    //   checkIsEditEnabled(
                                                    //     tankItem
                                                    //   )) &&

                                                    <p className="input_width mb-0">
                                                      <span className="tank-header">
                                                        Tank Dia -{" "}
                                                      </span>

                                                      {
                                                        checkIsEditEnabled(
                                                          tankItem
                                                        ) && (
                                                          <input
                                                            type="text"
                                                            maxLength={10}
                                                            disabled={
                                                              !editMultiDeviceChild?.isEdit
                                                                ? true
                                                                : checkIsEditEnabled(
                                                                      tankItem
                                                                    )
                                                                  ? false
                                                                  : true
                                                            }
                                                            onKeyPress={(e) =>
                                                              avoidletters(e)
                                                            }
                                                            className={
                                                              checkIsEditEnabled(
                                                                tankItem
                                                              )
                                                                ? "location filedPickBackground"
                                                                : "devicebg"
                                                            }
                                                            onChange={(e) => {
                                                              setEditMultiDeviceChild(
                                                                (pre) => ({
                                                                  ...pre,
                                                                  editData: {
                                                                    ...pre?.editData,
                                                                    tank_width:
                                                                      e.target
                                                                        .value
                                                                  }
                                                                })
                                                              );
                                                            }}
                                                            value={
                                                              checkIsEditEnabled(
                                                                tankItem
                                                              )
                                                                ? editMultiDeviceChild
                                                                    ?.editData
                                                                    ?.tank_width
                                                                : tankItem?.tank_width
                                                            }
                                                          />
                                                        )

                                                        // : (
                                                        //   <span className="tank-date">
                                                        //     {tankItem?.tank_width !==
                                                        //     null
                                                        //       ? tankItem?.tank_width
                                                        //       : "-"}
                                                        //   </span>
                                                        // )
                                                      }

                                                      <span className="tank-date">
                                                        {" "}
                                                        ft
                                                      </span>
                                                    </p>
                                                  }
                                                  <p style={{ margin: 0 }}>
                                                    <span className="tank-header">
                                                      Default Level -
                                                    </span>
                                                    {
                                                      checkIsEditEnabled(
                                                        tankItem
                                                      ) && (
                                                        <input
                                                          type="text"
                                                          maxLength={10}
                                                          disabled={
                                                            !editMultiDeviceChild?.isEdit
                                                              ? true
                                                              : checkIsEditEnabled(
                                                                    tankItem
                                                                  )
                                                                ? false
                                                                : true
                                                          }
                                                          onKeyPress={(e) =>
                                                            avoidletters(e)
                                                          }
                                                          className={
                                                            checkIsEditEnabled(
                                                              tankItem
                                                            )
                                                              ? "location filedPickBackground"
                                                              : "devicebg"
                                                          }
                                                          onChange={(e) => {
                                                            setEditMultiDeviceChild(
                                                              (pre) => ({
                                                                ...pre,
                                                                editData: {
                                                                  ...pre?.editData,
                                                                  default_level:
                                                                    e.target
                                                                      .value
                                                                }
                                                              })
                                                            );
                                                          }}
                                                          value={
                                                            checkIsEditEnabled(
                                                              tankItem
                                                            )
                                                              ? editMultiDeviceChild
                                                                  ?.editData
                                                                  ?.default_level
                                                              : tankItem?.default_level
                                                          }
                                                        />
                                                      )
                                                      // : (
                                                      //   <span className="tank-date">
                                                      //     {tankItem?.default_level !==
                                                      //     null
                                                      //       ? tankItem?.default_level
                                                      //       : "-"}
                                                      //   </span>
                                                      // )
                                                    }
                                                    <span className="tank-date">
                                                      {" "}
                                                      %
                                                    </span>
                                                  </p>
                                                </>
                                              )}
                                            </div>
                                            <div className="multidevicetank_container">
                                              <div className="multidevicetank">
                                                {tankItem?.tank_level !==
                                                null ? (
                                                  <>
                                                    <p
                                                      className={
                                                        devicestyle.multi_tank_percentage_label
                                                      }
                                                    >
                                                      {tankItem?.tank_level !==
                                                      null
                                                        ? `${Number(tankItem?.tank_level)}%`
                                                        : null}
                                                    </p>
                                                    {tankItem?.tank_level >=
                                                      1 &&
                                                    tankItem?.tank_level <=
                                                      10 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_10_GIF
                                                        }
                                                      />
                                                    ) : tankItem?.tank_level >
                                                        10 &&
                                                      tankItem?.tank_level <=
                                                        20 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_20_GIF
                                                        }
                                                      />
                                                    ) : tankItem?.tank_level >
                                                        20 &&
                                                      tankItem?.tank_level <=
                                                        30 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_30_GIF
                                                        }
                                                      />
                                                    ) : tankItem?.tank_level >
                                                        30 &&
                                                      tankItem?.tank_level <=
                                                        40 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_40_GIF
                                                        }
                                                      />
                                                    ) : tankItem?.tank_level >
                                                        40 &&
                                                      tankItem?.tank_level <=
                                                        60 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_50_GIF
                                                        }
                                                      />
                                                    ) : tankItem?.tank_level >
                                                        60 &&
                                                      tankItem?.tank_level <=
                                                        70 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_60_GIF
                                                        }
                                                      />
                                                    ) : tankItem?.tank_level >
                                                        70 &&
                                                      tankItem?.tank_level <=
                                                        80 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_70_GIF
                                                        }
                                                      />
                                                    ) : tankItem?.tank_level >
                                                        80 &&
                                                      tankItem?.tank_level <=
                                                        90 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_80_GIF
                                                        }
                                                      />
                                                    ) : tankItem?.tank_level >
                                                        90 &&
                                                      tankItem?.tank_level <=
                                                        95 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_90_GIF
                                                        }
                                                      />
                                                    ) : tankItem?.tank_level >
                                                        95 &&
                                                      tankItem?.tank_level <=
                                                        100 ? (
                                                      <img
                                                        src={
                                                          ExportedImages.WATER_TANK_100_GIF
                                                        }
                                                      />
                                                    ) : (
                                                      <img
                                                        src={
                                                          ExportedImages.EMPTY_WATER_TANK
                                                        }
                                                      />
                                                    )}
                                                  </>
                                                ) : null}
                                              </div>
                                              <p
                                                style={{
                                                  margin: 0,
                                                  fontWeight: "bolder"
                                                }}
                                              >
                                                {tankItem?.water_volume ?? "0"}
                                                kL
                                              </p>
                                            </div>

                                            {/* <div
                                              className={
                                                devicestyle.RowLineFlex
                                              }
                                            > */}
                                            {/* <p className="input_width mb-0">
                                                <span className={"tank-header"}>
                                                  Tank Level -
                                                </span>{" "}
                                                <span className="tank-date">
                                                  {tankItem?.tank_level || 0}%
                                                </span>
                                              </p>
                                              <p style={{ margin: 0 }}>
                                                <span className="tank-header">
                                                  Tank Height -
                                                </span>
                                                {checkIsEditEnabled(
                                                  tankItem
                                                ) ? (
                                                  <input
                                                    type="text"
                                                    maxLength={10}
                                                    disabled={
                                                      !editMultiDeviceChild?.isEdit
                                                        ? true
                                                        : checkIsEditEnabled(
                                                            tankItem
                                                          )
                                                        ? false
                                                        : true
                                                    }
                                                    onKeyPress={(e) =>
                                                      avoidletters(e)
                                                    }
                                                    className={
                                                      checkIsEditEnabled(
                                                        tankItem
                                                      )
                                                        ? "location filedPickBackground"
                                                        : "devicebg"
                                                    }
                                                    onChange={(e) => {
                                                      setEditMultiDeviceChild(
                                                        (pre) => ({
                                                          ...pre,
                                                          editData: {
                                                            ...pre?.editData,
                                                            tank_height:
                                                              e.target.value,
                                                          },
                                                        })
                                                      );
                                                    }}
                                                    value={
                                                      checkIsEditEnabled(
                                                        tankItem
                                                      )
                                                        ? editMultiDeviceChild
                                                            ?.editData
                                                            ?.tank_height
                                                        : tankItem?.tank_height
                                                    }
                                                  />
                                                ) : (
                                                  <span className="tank-date">
                                                    {tankItem?.tank_height !==
                                                    null
                                                      ? tankItem?.tank_height
                                                      : "-"}
                                                  </span>
                                                )}
                                                <span className="tank-date">
                                                  {" "}
                                                  ft
                                                </span>
                                              </p>
                                              <p style={{ margin: 0 }}>
                                                <span className="tank-header">
                                                  Default Level -
                                                </span>
                                                {checkIsEditEnabled(
                                                  tankItem
                                                ) ? (
                                                  <input
                                                    type="text"
                                                    maxLength={10}
                                                    disabled={
                                                      !editMultiDeviceChild?.isEdit
                                                        ? true
                                                        : checkIsEditEnabled(
                                                            tankItem
                                                          )
                                                        ? false
                                                        : true
                                                    }
                                                    onKeyPress={(e) =>
                                                      avoidletters(e)
                                                    }
                                                    className={
                                                      checkIsEditEnabled(
                                                        tankItem
                                                      )
                                                        ? "location filedPickBackground"
                                                        : "devicebg"
                                                    }
                                                    onChange={(e) => {
                                                      setEditMultiDeviceChild(
                                                        (pre) => ({
                                                          ...pre,
                                                          editData: {
                                                            ...pre?.editData,
                                                            default_level:
                                                              e.target.value,
                                                          },
                                                        })
                                                      );
                                                    }}
                                                    value={
                                                      checkIsEditEnabled(
                                                        tankItem
                                                      )
                                                        ? editMultiDeviceChild
                                                            ?.editData
                                                            ?.default_level
                                                        : tankItem?.default_level
                                                    }
                                                  />
                                                ) : (
                                                  <span className="tank-date">
                                                    {tankItem?.default_level !==
                                                    null
                                                      ? tankItem?.default_level
                                                      : "-"}
                                                  </span>
                                                )}
                                                <span className="tank-date">
                                                  {" "}
                                                  Kl
                                                </span>
                                              </p> */}
                                            {/* </div> */}
                                          </div>
                                        </div>
                                      </Col>
                                    );
                                  }
                                )}
                              </Row>
                            </Col>
                          ) : null}
                          {multideviceItem?.flow_data?.length > 0 ? (
                            <Col xs={24}>
                              <Row gutter={[10, 10]}>
                                <Col xs={24}>
                                  <p className={commonstyle.deviceHeader}>
                                    Flow
                                  </p>
                                </Col>
                                {multideviceItem?.flow_data?.map(
                                  (flowItem, tankIndex) => {
                                    return (
                                      <Col
                                        xs={24}
                                        sm={24}
                                        md={12}
                                        lg={12}
                                        xl={6}
                                      >
                                        <div
                                          className={commonstyle.CartItemBox}
                                        >
                                          <div className={commonstyle.rowStyle}>
                                            <div
                                              className={commonstyle.rowStyle}
                                            >
                                              <div className="inputWidth">
                                                {checkIsEditEnabled(
                                                  flowItem
                                                ) ? (
                                                  <input
                                                    type="text"
                                                    disabled={
                                                      !editMultiDeviceChild?.isEdit
                                                        ? true
                                                        : checkIsEditEnabled(
                                                              flowItem
                                                            )
                                                          ? false
                                                          : true
                                                    }
                                                    className={`${devicestyle.device_name_input} filedPickBackground`}
                                                    onChange={(e) => {
                                                      setEditMultiDeviceChild(
                                                        (pre) => ({
                                                          ...pre,
                                                          editData: {
                                                            ...pre.editData,
                                                            device_name:
                                                              e.target.value
                                                          }
                                                        })
                                                      );
                                                    }}
                                                    value={
                                                      checkIsEditEnabled(
                                                        flowItem
                                                      )
                                                        ? editMultiDeviceChild
                                                            ?.editData
                                                            ?.device_name
                                                        : flowItem.device_name
                                                    }
                                                  />
                                                ) : (
                                                  <OverlayTrigger
                                                    key="top"
                                                    placement="top"
                                                    overlay={
                                                      <Tooltip id="tooltip-top">
                                                        <strong>
                                                          {
                                                            flowItem?.device_name
                                                          }
                                                        </strong>
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <p
                                                      className={`${devicestyle.device_name} ${devicestyle.device_name_flow_col}`}
                                                    >
                                                      {flowItem?.device_name}
                                                    </p>
                                                  </OverlayTrigger>
                                                )}
                                              </div>
                                              <img
                                                src={
                                                  checkIsEditEnabled(flowItem)
                                                    ? ExportedImages.SAVE_ICON_BLUE
                                                    : !editMultiDeviceChild?.isEdit
                                                      ? ExportedImages.EDIT_ICON_BLUE
                                                      : null
                                                }
                                                className="pointerCurser"
                                                height={20}
                                                onClick={() => {
                                                  if (
                                                    editMultiDeviceChild?.isEdit
                                                  ) {
                                                    handleEditMultiDeviceChildItem();
                                                  } else {
                                                    setEditMultiDeviceChild({
                                                      isEdit: true,
                                                      device_id:
                                                        flowItem?.device_id,
                                                      editData: flowItem
                                                    });
                                                  }
                                                }}
                                              />
                                            </div>

                                            <div className="d-flex flex-row align-items-center">
                                              {flowItem?.device_code && (
                                                <p
                                                  className={
                                                    devicestyle.lineTextStyle
                                                  }
                                                >
                                                  {flowItem?.device_code}
                                                </p>
                                              )}
                                              {devicedata?.access_type === 0 ||
                                              devicedata?.access_type === 1 ||
                                              devicedata?.access_type ===
                                                null ? (
                                                editMultiDevice ||
                                                editflow ||
                                                editvalve ? null : (
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      gap: 10
                                                    }}
                                                  >
                                                    <p className="fw-bold h6">
                                                      {flowItem?.device_order}
                                                    </p>
                                                  </div>
                                                )
                                              ) : null}
                                            </div>
                                          </div>

                                          <div className={commonstyle.rowStyle}>
                                            <div>
                                              <p className="input_width tank-usage-custom">
                                                <span className="tank-header">
                                                  Usage Limit -{" "}
                                                </span>
                                                <div
                                                  className={
                                                    devicestyle.editFiledContainer
                                                  }
                                                >
                                                  {flowItem?.usage_limit ||
                                                  checkIsEditEnabled(
                                                    flowItem
                                                  ) ? (
                                                    checkIsEditEnabled(
                                                      flowItem
                                                    ) ? (
                                                      <input
                                                        type="text"
                                                        className={
                                                          checkIsEditEnabled(
                                                            flowItem
                                                          )
                                                            ? "location filedPickBackground"
                                                            : "devicebg"
                                                        }
                                                        disabled={
                                                          !editMultiDeviceChild.isEdit
                                                            ? true
                                                            : checkIsEditEnabled(
                                                                  flowItem
                                                                )
                                                              ? false
                                                              : true
                                                        }
                                                        onChange={(e) =>
                                                          setEditMultiDeviceChild(
                                                            (pre) => ({
                                                              ...pre,
                                                              editData: {
                                                                ...pre?.editData,
                                                                usage_limit:
                                                                  e.target.value
                                                              }
                                                            })
                                                          )
                                                        }
                                                        defaultValue={
                                                          checkIsEditEnabled(
                                                            flowItem
                                                          )
                                                            ? editMultiDeviceChild
                                                                ?.editData
                                                                ?.usage_limit
                                                            : flowItem?.usage_limit
                                                        }
                                                      />
                                                    ) : (
                                                      <span className="tank-date">
                                                        {flowItem?.usage_limit}
                                                      </span>
                                                    )
                                                  ) : null}
                                                  &nbsp;&nbsp;
                                                  {checkIsEditEnabled(
                                                    flowItem
                                                  ) ? (
                                                    <br />
                                                  ) : null}
                                                  {checkIsEditEnabled(
                                                    flowItem
                                                  ) ? (
                                                    <select
                                                      className={
                                                        checkIsEditEnabled(
                                                          flowItem
                                                        )
                                                          ? "usagelimit_width filedPickBackground"
                                                          : "devicebg"
                                                      }
                                                      disabled={
                                                        !editMultiDeviceChild?.isEdit
                                                          ? true
                                                          : checkIsEditEnabled(
                                                                flowItem
                                                              )
                                                            ? false
                                                            : true
                                                      }
                                                      onClick={(e) => {
                                                        setEditMultiDeviceChild(
                                                          (pre) => ({
                                                            ...pre,
                                                            editData: {
                                                              ...pre?.editData,
                                                              usage_limit_action:
                                                                JSON.parse(
                                                                  e.target.value
                                                                )
                                                            }
                                                          })
                                                        );
                                                      }}
                                                    >
                                                      <option
                                                        value="0"
                                                        selected={
                                                          flowItem?.usage_limit_action ===
                                                          0
                                                            ? true
                                                            : false
                                                        }
                                                      >
                                                        No action
                                                      </option>
                                                      <option
                                                        value="1"
                                                        selected={
                                                          flowItem?.usage_limit_action ===
                                                          1
                                                            ? true
                                                            : false
                                                        }
                                                      >
                                                        off Motor
                                                      </option>
                                                      <option
                                                        value="2"
                                                        selected={
                                                          flowItem?.usage_limit_action ===
                                                          2
                                                            ? true
                                                            : false
                                                        }
                                                      >
                                                        On Motor
                                                      </option>
                                                    </select>
                                                  ) : (
                                                    <span className="tank-date">
                                                      {flowItem.usage_limit_action ===
                                                      1
                                                        ? "Off Motor"
                                                        : flowItem.usage_limit_action ===
                                                            2
                                                          ? "On Motor"
                                                          : flowItem.usage_limit_action ===
                                                              0
                                                            ? "No Action"
                                                            : ""}
                                                    </span>
                                                  )}
                                                </div>
                                              </p>

                                              <p className="tank-usage-custom">
                                                <span className="tank-header">
                                                  Daily Usage -{" "}
                                                </span>
                                                <span className="tank-date">
                                                  {flowItem.today_usage}
                                                </span>
                                              </p>
                                              <p className="tank-usage-custom">
                                                <span className="tank-header">
                                                  Total usage -{" "}
                                                </span>
                                                <span className="tank-date">
                                                  {flowItem.total_usage} kL
                                                </span>
                                              </p>
                                              <p className="tank-usage-custom">
                                                <span className="tank-header">
                                                  Flow Rate -{" "}
                                                </span>
                                                <span className="tank-date">
                                                  {flowItem.flow_rate}
                                                </span>
                                              </p>
                                              <p className="tank-usage-custom">
                                                <span className="tank-header">
                                                  Battery -{" "}
                                                </span>
                                                <span className="tank-date">
                                                  {flowItem.battery}
                                                </span>
                                              </p>
                                            </div>
                                            <div>
                                              <img
                                                src={ExportedImages.Flow_Image}
                                                width={80}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </Col>
                                    );
                                  }
                                )}
                              </Row>
                            </Col>
                          ) : null}
                          {multideviceItem?.valve_data?.length > 0 ? (
                            <Col xs={24}>
                              <Row gutter={[10, 10]}>
                                <Col xs={24}>
                                  <p className={commonstyle.deviceHeader}>
                                    Valve
                                  </p>
                                </Col>
                                {multideviceItem?.valve_data?.map(
                                  (valveItem, tankIndex) => {
                                    return (
                                      <Col
                                        xs={24}
                                        sm={24}
                                        md={24}
                                        lg={12}
                                        xl={6}
                                      >
                                        <div
                                          className={commonstyle.CartItemBox}
                                        >
                                          <div
                                            className={`${commonstyle.rowStyle} d-flex flex-wrap justify-content-between align-items-start gap-3`}
                                          >
                                            {/* Left Side: Input + Icon */}
                                            <div className="d-flex align-items-center gap-2 flex-grow-1">
                                              {checkIsEditEnabled(valveItem) ? (
                                                <input
                                                  type="text"
                                                  className={`${devicestyle.device_name_input} filedPickBackground flex-grow-1`}
                                                  disabled={
                                                    !editMultiDeviceChild?.isEdit ||
                                                    !checkIsEditEnabled(
                                                      valveItem
                                                    )
                                                  }
                                                  value={
                                                    checkIsEditEnabled(
                                                      valveItem
                                                    )
                                                      ? editMultiDeviceChild
                                                          ?.editData
                                                          ?.device_name
                                                      : valveItem.device_name
                                                  }
                                                  onChange={(e) =>
                                                    setEditMultiDeviceChild(
                                                      (pre) => ({
                                                        ...pre,
                                                        editData: {
                                                          ...pre.editData,
                                                          device_name:
                                                            e.target.value
                                                        }
                                                      })
                                                    )
                                                  }
                                                />
                                              ) : (
                                                <OverlayTrigger
                                                  placement="top"
                                                  overlay={
                                                    <Tooltip id="tooltip-top">
                                                      <strong>
                                                        {valveItem?.device_name}
                                                      </strong>
                                                    </Tooltip>
                                                  }
                                                >
                                                  <p
                                                    className={`${devicestyle.device_name} ${devicestyle.device_name_valve_col}`}
                                                  >
                                                    {valveItem?.device_name}
                                                  </p>
                                                </OverlayTrigger>
                                              )}

                                              <img
                                                alt="poitercursor"
                                                src={
                                                  checkIsEditEnabled(valveItem)
                                                    ? ExportedImages.SAVE_ICON_BLUE
                                                    : !editMultiDeviceChild?.isEdit
                                                      ? ExportedImages.EDIT_ICON_BLUE
                                                      : null
                                                }
                                                className="pointerCurser"
                                                style={{ height: 20 }}
                                                onClick={() => {
                                                  if (
                                                    editMultiDeviceChild?.isEdit
                                                  ) {
                                                    handleEditMultiDeviceChildItem();
                                                  } else {
                                                    setEditMultiDeviceChild({
                                                      isEdit: true,
                                                      device_id:
                                                        valveItem?.device_id,
                                                      editData: valveItem
                                                    });
                                                  }
                                                }}
                                              />
                                            </div>

                                            {/* Right Side: Switch, Info */}
                                            <div className="d-flex flex-wrap align-items-center gap-3 justify-content-end">
                                              <div className="d-flex align-items-center gap-2">
                                                <span
                                                  className="mobile"
                                                  style={{
                                                    width: "60px"
                                                  }}
                                                >
                                                  {valveItem.operated_by}
                                                </span>
                                                {valveItem?.device_id ===
                                                buttongreyid ? (
                                                  <CommonSwitch
                                                    color="gray"
                                                    checked={
                                                      valveItem.valve_status ===
                                                      1
                                                    }
                                                    type={3}
                                                    status={
                                                      valveItem.valve_status
                                                    }
                                                    disabled={
                                                      valveItem.valve_status ===
                                                      2
                                                    }
                                                    tooltipText={
                                                      valveItem.valve_status ===
                                                      2
                                                        ? "Field Error"
                                                        : ""
                                                    }
                                                    onChange={() =>
                                                      Changebutton(
                                                        valveItem.device_id,
                                                        valveItem.valve_status ===
                                                          1
                                                          ? false
                                                          : true,
                                                        devicedata?.access_type,
                                                        buttontype.devicebuttontype
                                                      )
                                                    }
                                                  />
                                                ) : (
                                                  <CommonSwitch
                                                    checked={
                                                      valveItem.valve_status ===
                                                      1
                                                    }
                                                    type={3}
                                                    status={
                                                      valveItem.valve_status
                                                    }
                                                    disabled={
                                                      valveItem.valve_status ===
                                                      2
                                                    }
                                                    color={
                                                      valveItem.valve_status ===
                                                      2
                                                        ? "#494848"
                                                        : ""
                                                    }
                                                    tooltipText={
                                                      valveItem.valve_status ===
                                                      2
                                                        ? "Field Error"
                                                        : ""
                                                    }
                                                    onChange={() =>
                                                      Changebutton(
                                                        valveItem.device_id,
                                                        valveItem.valve_status ===
                                                          1
                                                          ? false
                                                          : true,
                                                        devicedata?.access_type,
                                                        buttontype.devicebuttontype
                                                      )
                                                    }
                                                  />
                                                )}
                                              </div>

                                              <div>
                                                {valveItem?.device_code && (
                                                  <p
                                                    className={
                                                      devicestyle.lineTextStyle
                                                    }
                                                  >
                                                    {valveItem?.device_code}
                                                  </p>
                                                )}

                                                {[0, 1, null].includes(
                                                  devicedata?.access_type
                                                ) &&
                                                  !editMultiDevice &&
                                                  !editflow &&
                                                  !editvalve && (
                                                    <p className="fw-bold h6">
                                                      {valveItem?.device_order}
                                                    </p>
                                                  )}
                                              </div>
                                            </div>
                                          </div>

                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "row",

                                              justifyContent: "space-between"
                                            }}
                                          >
                                            <div>
                                              <p className="tank-usage d-flex flex-row">
                                                <p
                                                  className="tank-header"
                                                  style={{ textWrap: "nowrap" }}
                                                >
                                                  Mode -{" "}
                                                </p>
                                                {checkIsEditEnabled(
                                                  valveItem
                                                ) ? (
                                                  <select
                                                    className={
                                                      "location filedPickBackground"
                                                    }
                                                    style={{ maxWidth: 80 }}
                                                    onClick={(event) => {
                                                      setEditMultiDeviceChild(
                                                        (pre) => ({
                                                          ...pre,
                                                          editData: {
                                                            ...pre?.editData,
                                                            valve_mode:
                                                              event?.target
                                                                ?.value
                                                          }
                                                        })
                                                      );
                                                    }}
                                                  >
                                                    {ValveModalList?.map(
                                                      (ele) => {
                                                        return (
                                                          <option
                                                            value={ele?.value}
                                                            selected={
                                                              valveItem?.valve_mode ===
                                                              ele?.value
                                                                ? true
                                                                : false
                                                            }
                                                          >
                                                            {ele?.label}
                                                          </option>
                                                        );
                                                      }
                                                    )}
                                                  </select>
                                                ) : (
                                                  <span className="tank-date">
                                                    {valveItem.valve_mode === 1
                                                      ? ""
                                                      : // "Daily"
                                                        valveItem.valve_mode ===
                                                          0
                                                        ? "Manual"
                                                        : valveItem.valve_mode ===
                                                            2
                                                          ? "Weekly"
                                                          : ""}
                                                  </span>
                                                )}
                                              </p>
                                              <p
                                                className="tank-date mergetankname NoWrapStyle"
                                                style={
                                                  {
                                                    // alignItems: "flex-start",
                                                    // display: "flex",
                                                  }
                                                }
                                              >
                                                <span className="tank-header">
                                                  Status Update -
                                                </span>
                                                &nbsp;
                                              </p>{" "}
                                              <span className="tank-date">
                                                {valveItem?.status_updated_at
                                                  ? dayjs(
                                                      valveItem?.status_updated_at
                                                    ).format(
                                                      "DD-MM-YYYY HH:mm:ss"
                                                    )
                                                  : ""}
                                              </span>
                                              {valveItem.deviceMerge?.length !==
                                                2 && (
                                                <p
                                                  className="devicemergeInputblock"
                                                  style={{
                                                    display:
                                                      !valveItem.deviceMerge
                                                        ?.length &&
                                                      usertype === 3
                                                        ? "none"
                                                        : ""
                                                  }}
                                                >
                                                  {/* {usertype !== 3
                                                    ? "Merge.."
                                                    : ""} */}

                                                  {!mergeDeviceLength(
                                                    valveItem
                                                  ) &&
                                                    mergerDevice.action &&
                                                    mergerDevice?.parent_device_id ===
                                                      valveItem.device_id && (
                                                      <div className="merge_filed_section">
                                                        <input
                                                          type="text"
                                                          className="mergeInput filedPickBackground"
                                                          value={
                                                            mergerDevice.device_code
                                                          }
                                                          maxLength={18}
                                                          onChange={(event) => {
                                                            setMergerDevice(
                                                              (pre) => ({
                                                                ...pre,
                                                                device_code:
                                                                  event.target
                                                                    .value
                                                              })
                                                            );
                                                          }}
                                                        />

                                                        {devicemergeConfirmation
                                                          ?.tankdata
                                                          ?.device_type === 5 &&
                                                          selectedId ===
                                                            valveItem?.device_id &&
                                                          mergerDevice.device_code !==
                                                            "" && (
                                                            <div>
                                                              <select
                                                                value={
                                                                  mergeSingleDeviceID
                                                                }
                                                                className={
                                                                  "location filedPickBackground merge_select"
                                                                }
                                                                onChange={(
                                                                  e
                                                                ) => {
                                                                  setMergeSingleDeviceID(
                                                                    e.target
                                                                      .value
                                                                  );
                                                                  // setMergerDevice(
                                                                  //   (pre) => ({
                                                                  //     ...pre,
                                                                  //     parent_device_id:
                                                                  //       valveItem?.device_id,
                                                                  //   })
                                                                  // );
                                                                }}
                                                                // value={
                                                                //   mergeSingleDeviceID
                                                                // }
                                                              >
                                                                <option
                                                                  value=""
                                                                  disabled
                                                                  selected
                                                                >
                                                                  Select a
                                                                  device
                                                                </option>
                                                                {devicemergeConfirmation?.tankdata?.child_device?.map(
                                                                  (
                                                                    ele,
                                                                    ind
                                                                  ) => {
                                                                    return (
                                                                      <option
                                                                        key={
                                                                          ele?.id
                                                                        }
                                                                        value={
                                                                          ele?.id
                                                                        }
                                                                      >
                                                                        {ind +
                                                                          1}
                                                                        .
                                                                        {
                                                                          ele?.device_name
                                                                        }
                                                                      </option>
                                                                    );
                                                                  }
                                                                )}
                                                              </select>
                                                            </div>
                                                          )}
                                                      </div>
                                                    )}
                                                  {!mergeDeviceLength(
                                                    valveItem
                                                  ) &&
                                                    usertype !== 3 && (
                                                      <div className="merge_icon_container">
                                                        <img
                                                          src={
                                                            mergerDevice.action &&
                                                            mergerDevice?.parent_device_id ===
                                                              valveItem.device_id
                                                              ? mergerDevice?.device_code
                                                                ? devicemergeConfirmation
                                                                    ?.tankdata
                                                                    ?.device_type ===
                                                                  5
                                                                  ? ExportedImages?.EDIT_ICON_BLUE
                                                                  : ExportedImages.SAVED_TICK_ICON
                                                                : ExportedImages.CANCEL_ICON
                                                              : ExportedImages.MERGE_LINK_ICON
                                                          }
                                                          alt="MergeIcon"
                                                          className={
                                                            mergerDevice.action &&
                                                            mergerDevice?.parent_device_id ===
                                                              valveItem.device_id
                                                              ? "SavemergeIcon"
                                                              : "MergeIcon"
                                                          }
                                                          onClick={() => {
                                                            setSelectedId(
                                                              valveItem?.device_id
                                                            );
                                                            setMergeSingleDeviceID(
                                                              null
                                                            );
                                                            if (
                                                              !mergerDevice?.device_code
                                                            ) {
                                                              setMergerDevice({
                                                                child_device_id:
                                                                  "",
                                                                child_device_code:
                                                                  "",
                                                                is_tank: false,
                                                                action: "",
                                                                parent_device_id:
                                                                  ""
                                                              });
                                                              setdevicemergeConfirmation(
                                                                {
                                                                  show: false,
                                                                  data: {},
                                                                  action: "",
                                                                  tankdata: ""
                                                                }
                                                              );
                                                            }
                                                            if (
                                                              mergerDevice.action &&
                                                              mergerDevice?.parent_device_id ===
                                                                valveItem.device_id
                                                            ) {
                                                              if (
                                                                mergerDevice.device_code >
                                                                0
                                                              ) {
                                                                setMergeSingleDeviceID(
                                                                  ""
                                                                );
                                                                HandlecheckDeviceType(
                                                                  mergerDevice.device_code,
                                                                  "device"
                                                                );
                                                              }
                                                            } else {
                                                              setdevicemergeConfirmation(
                                                                (prev) => ({
                                                                  ...prev,
                                                                  tankdata: {
                                                                    device_type:
                                                                      null
                                                                  }
                                                                })
                                                              );
                                                              setMergerDevice(
                                                                (pre) => ({
                                                                  child_device_id:
                                                                    "",
                                                                  child_device_code:
                                                                    "",
                                                                  parent_device_id:
                                                                    valveItem?.device_id,
                                                                  is_tank: false,
                                                                  action:
                                                                    mergerDevice?.parent_device_id ===
                                                                      valveItem.device_id &&
                                                                    mergerDevice.action
                                                                      ? ""
                                                                      : "merge"
                                                                })
                                                              );
                                                            }
                                                          }}
                                                        />
                                                        {devicemergeConfirmation
                                                          ?.tankdata
                                                          ?.device_type === 5 &&
                                                        selectedId ===
                                                          valveItem.device_id &&
                                                        mergerDevice.device_code !==
                                                          "" ? (
                                                          <img
                                                            alt="savedTicketIcon"
                                                            src={
                                                              ExportedImages?.SAVED_TICK_ICON
                                                            }
                                                            style={{
                                                              width: 18,
                                                              cursor: "pointer"
                                                            }}
                                                            onClick={() => {
                                                              if (
                                                                devicemergeConfirmation
                                                                  ?.tankdata
                                                                  ?.device_type ===
                                                                  5 &&
                                                                mergeSingleDeviceID
                                                              ) {
                                                                setdevicemergeConfirmation(
                                                                  (pre) => ({
                                                                    ...pre,
                                                                    show: true,
                                                                    action:
                                                                      "merge",
                                                                    data: valveItem?.device_id
                                                                  })
                                                                );
                                                              } else {
                                                                toast.error(
                                                                  "Select any device"
                                                                );
                                                              }
                                                            }}
                                                          />
                                                        ) : null}
                                                      </div>
                                                    )}
                                                </p>
                                              )}
                                            </div>
                                            <div>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center"
                                                }}
                                              >
                                                <img
                                                  src={
                                                    ExportedImages.valveImage
                                                  }
                                                  width={100}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                          {/* <div>
                                            <div>
                                              <p
                                                className="tank-date mergetankname NoWrapStyle"
                                                style={
                                                  {
                                                    // alignItems: "flex-start",
                                                    // display: "flex",
                                                  }
                                                }
                                              >
                                                <span className="tank-header">
                                                  {" "}
                                                  Setting Time -
                                                </span>
                                                &nbsp;
                                                <span className="tank-date">
                                                  {valveItem?.setting_time
                                                    ? dayjs(
                                                        valveItem?.setting_time
                                                      ).format(
                                                        "YYYY-MM-DD HH:mm:ss"
                                                      )
                                                    : ""}
                                                </span>
                                              </p>
                                            </div>
                                          </div> */}

                                          {valveItem.deviceMerge?.length
                                            ? valveItem?.deviceMerge?.map(
                                                (item) => {
                                                  return (
                                                    <div
                                                      className="mergeSettings mergeSettinglimit"
                                                      style={{
                                                        width: "100%"
                                                      }}
                                                    >
                                                      <div
                                                        className={
                                                          devicestyle.DeviceLineStyle
                                                        }
                                                      >
                                                        <div>
                                                          <span className="tank-date mergetankname">
                                                            {item?.device_name}
                                                          </span>
                                                          <span className="tank-date">
                                                            ({" "}
                                                            {item?.device_code}{" "}
                                                            )
                                                          </span>
                                                        </div>
                                                        <div className="d-flex flex-row align-items-center">
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                              gap: 4
                                                            }}
                                                          >
                                                            {usertype !== 3 &&
                                                            DeviceMergeSettingData.isEdit &&
                                                            DeviceMergeSettingData?.merge_id ===
                                                              item?.merge_id ? (
                                                              <img
                                                                src={
                                                                  ExportedImages.DELETE_ICON_RED
                                                                }
                                                                alt="deleteimg"
                                                                className="MergeIcon"
                                                                onClick={() => {
                                                                  setdevicemergeConfirmation(
                                                                    {
                                                                      action:
                                                                        "delete",
                                                                      show: true,
                                                                      merge_id:
                                                                        item.merge_id,
                                                                      tankdata:
                                                                        item
                                                                    }
                                                                  );
                                                                }}
                                                              />
                                                            ) : (
                                                              ""
                                                            )}
                                                            {(usertype !== 3 &&
                                                              DeviceMergeSettingData.isEdit &&
                                                              DeviceMergeSettingData?.merge_id ===
                                                                item?.merge_id) ||
                                                            !DeviceMergeSettingData?.isEdit ? (
                                                              <img
                                                                alt="cursor"
                                                                src={
                                                                  DeviceMergeSettingData.isEdit &&
                                                                  DeviceMergeSettingData?.merge_id ===
                                                                    item?.merge_id
                                                                    ? ExportedImages.SAVE_ICON_BLUE
                                                                    : ExportedImages.EDIT_ICON_BLUE
                                                                }
                                                                className="pointerCurser"
                                                                onClick={() => {
                                                                  if (
                                                                    DeviceMergeSettingData?.isEdit
                                                                  ) {
                                                                    handleUpdateMergeSettings(
                                                                      2,
                                                                      item?.device_type
                                                                    );
                                                                  } else {
                                                                    setDeviceMergeSettingData(
                                                                      (
                                                                        pre
                                                                      ) => ({
                                                                        ...pre,
                                                                        isEdit: true,
                                                                        merge_id:
                                                                          item?.merge_id
                                                                      })
                                                                    );
                                                                  }
                                                                }}
                                                              />
                                                            ) : (
                                                              ""
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div
                                                        className={
                                                          devicestyle.deviceStyleContainer
                                                        }
                                                      >
                                                        <p className="tank-date mergetankname  input_width">
                                                          {item?.device_type ===
                                                          1
                                                            ? "Tank"
                                                            : "Flow"}{" "}
                                                          Status- &nbsp;
                                                          <span className="tank-date">
                                                            {item?.device_type ===
                                                            1
                                                              ? item?.tank_level
                                                              : UsageLimit?.find(
                                                                  (ele) =>
                                                                    ele.id ===
                                                                    item?.usage_limit_status
                                                                ).name}
                                                          </span>
                                                        </p>
                                                      </div>
                                                      <div
                                                        className="mergeSettings"
                                                        style={{
                                                          flexDirection: "row",
                                                          flexFlow: "wrap",
                                                          width: "100%"
                                                        }}
                                                      >
                                                        {item?.device_type ===
                                                          1 && (
                                                          <p className="tank-date mergetankname  input_width NoWrapStyle">
                                                            High Limit -
                                                            {DeviceMergeSettingData.isEdit &&
                                                            DeviceMergeSettingData?.merge_id ===
                                                              item?.merge_id ? (
                                                              <>
                                                                &nbsp;
                                                                <input
                                                                  type="text"
                                                                  maxLength={8}
                                                                  style={{
                                                                    maxWidth:
                                                                      "60px"
                                                                  }}
                                                                  // onKeyPress={avoidletters}
                                                                  className={
                                                                    "location filedPickBackground"
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) => {
                                                                    if (
                                                                      Float_Validation(
                                                                        e.target
                                                                          ?.value
                                                                      ) &&
                                                                      e.target
                                                                        .value <=
                                                                        99999.99
                                                                    ) {
                                                                      setDeviceMergeSettingData(
                                                                        {
                                                                          ...DeviceMergeSettingData,
                                                                          high_limit:
                                                                            e
                                                                              .target
                                                                              .value
                                                                        }
                                                                      );
                                                                    }
                                                                  }}
                                                                  value={
                                                                    DeviceMergeSettingData?.high_limit
                                                                  }
                                                                  // onClick={() => tolimit()}
                                                                />
                                                                &nbsp;
                                                                <select
                                                                  className={
                                                                    "location filedPickBackground"
                                                                  }
                                                                  onClick={(
                                                                    e
                                                                  ) => {
                                                                    setDeviceMergeSettingData(
                                                                      {
                                                                        ...DeviceMergeSettingData,
                                                                        high_limit_action:
                                                                          JSON.parse(
                                                                            e
                                                                              .target
                                                                              .value
                                                                          )
                                                                      }
                                                                    );
                                                                  }}
                                                                >
                                                                  <option
                                                                    value="0"
                                                                    selected={
                                                                      DeviceMergeSettingData?.high_limit_action ===
                                                                      0
                                                                        ? true
                                                                        : false
                                                                    }
                                                                  >
                                                                    No Action
                                                                  </option>
                                                                  <option
                                                                    value="1"
                                                                    selected={
                                                                      DeviceMergeSettingData?.high_limit_action ===
                                                                      1
                                                                        ? true
                                                                        : false
                                                                    }
                                                                  >
                                                                    Close Valve
                                                                  </option>
                                                                  <option
                                                                    value="2"
                                                                    selected={
                                                                      DeviceMergeSettingData?.high_limit_action ===
                                                                      2
                                                                        ? true
                                                                        : false
                                                                    }
                                                                  >
                                                                    Open Valve
                                                                  </option>
                                                                </select>
                                                              </>
                                                            ) : (
                                                              <>
                                                                <span className="tank-date">
                                                                  {
                                                                    item?.high_limit
                                                                  }
                                                                </span>
                                                                &nbsp;
                                                                <span className="tank-date">
                                                                  (
                                                                  {getlimitAction(
                                                                    item.high_limit_action
                                                                  )}
                                                                  )
                                                                </span>
                                                              </>
                                                            )}
                                                          </p>
                                                        )}
                                                        {item?.device_type ===
                                                          1 && (
                                                          <p className="tank-date mergetankname  input_width NoWrapStyle">
                                                            Low Limit -
                                                            {DeviceMergeSettingData.isEdit &&
                                                            DeviceMergeSettingData?.merge_id ===
                                                              item?.merge_id ? (
                                                              <>
                                                                &nbsp;
                                                                <input
                                                                  type="text"
                                                                  maxLength={10}
                                                                  style={{
                                                                    maxWidth:
                                                                      "60px"
                                                                  }}
                                                                  // onKeyPress={avoidletters}
                                                                  className={
                                                                    "location filedPickBackground"
                                                                  }
                                                                  onChange={(
                                                                    e
                                                                  ) => {
                                                                    if (
                                                                      Float_Validation(
                                                                        e.target
                                                                          .value
                                                                      ) &&
                                                                      e.target
                                                                        .value <=
                                                                        99999.99
                                                                    ) {
                                                                      setDeviceMergeSettingData(
                                                                        {
                                                                          ...DeviceMergeSettingData,
                                                                          low_limit:
                                                                            e
                                                                              .target
                                                                              .value
                                                                        }
                                                                      );
                                                                    }
                                                                  }}
                                                                  value={
                                                                    DeviceMergeSettingData?.low_limit
                                                                  }
                                                                  // onClick={() => tolimit()}
                                                                />
                                                                &nbsp;
                                                                <select
                                                                  className={
                                                                    "location filedPickBackground"
                                                                  }
                                                                  onClick={(
                                                                    e
                                                                  ) => {
                                                                    setDeviceMergeSettingData(
                                                                      {
                                                                        ...DeviceMergeSettingData,
                                                                        low_limit_action:
                                                                          JSON.parse(
                                                                            e
                                                                              .target
                                                                              .value
                                                                          )
                                                                      }
                                                                    );
                                                                  }}
                                                                >
                                                                  <option
                                                                    value="0"
                                                                    selected={
                                                                      DeviceMergeSettingData?.low_limit_action ===
                                                                      0
                                                                        ? true
                                                                        : false
                                                                    }
                                                                  >
                                                                    No Action
                                                                  </option>
                                                                  <option
                                                                    value="1"
                                                                    selected={
                                                                      DeviceMergeSettingData?.low_limit_action ===
                                                                      1
                                                                        ? true
                                                                        : false
                                                                    }
                                                                  >
                                                                    Close Valve
                                                                  </option>
                                                                  <option
                                                                    value="2"
                                                                    selected={
                                                                      DeviceMergeSettingData?.low_limit_action ===
                                                                      2
                                                                        ? true
                                                                        : false
                                                                    }
                                                                  >
                                                                    Open Valve
                                                                  </option>
                                                                </select>
                                                              </>
                                                            ) : (
                                                              <>
                                                                <span className="tank-date">
                                                                  {
                                                                    item?.low_limit
                                                                  }
                                                                </span>
                                                                &nbsp;
                                                                <span className="tank-date">
                                                                  (
                                                                  {getlimitAction(
                                                                    item.low_limit_action
                                                                  )}
                                                                  )
                                                                </span>
                                                              </>
                                                            )}
                                                          </p>
                                                        )}
                                                        {item?.device_type ===
                                                          2 && (
                                                          <div
                                                            className="tank-date mergetankname  input_width NoWrapStyle"
                                                            style={{
                                                              width: "100%"
                                                            }}
                                                          >
                                                            <span>
                                                              Usage Limit
                                                              Action-
                                                            </span>
                                                            {DeviceMergeSettingData.isEdit &&
                                                            DeviceMergeSettingData?.merge_id ===
                                                              item?.merge_id ? (
                                                              <>
                                                                <select
                                                                  className={
                                                                    "location filedPickBackground"
                                                                  }
                                                                  onClick={(
                                                                    e
                                                                  ) => {
                                                                    setDeviceMergeSettingData(
                                                                      {
                                                                        ...DeviceMergeSettingData,
                                                                        usage_limit_action:
                                                                          JSON.parse(
                                                                            e
                                                                              .target
                                                                              .value
                                                                          )
                                                                      }
                                                                    );
                                                                  }}
                                                                >
                                                                  <option
                                                                    value="0"
                                                                    selected={
                                                                      DeviceMergeSettingData?.usage_limit_action ===
                                                                      0
                                                                        ? true
                                                                        : false
                                                                    }
                                                                  >
                                                                    No Action
                                                                  </option>
                                                                  <option
                                                                    value="1"
                                                                    selected={
                                                                      DeviceMergeSettingData?.usage_limit_action ===
                                                                      1
                                                                        ? true
                                                                        : false
                                                                    }
                                                                  >
                                                                    Close Valve
                                                                  </option>
                                                                  <option
                                                                    value="2"
                                                                    selected={
                                                                      DeviceMergeSettingData?.usage_limit_action ===
                                                                      2
                                                                        ? true
                                                                        : false
                                                                    }
                                                                  >
                                                                    Open Valve
                                                                  </option>
                                                                </select>
                                                              </>
                                                            ) : (
                                                              <>
                                                                &nbsp;
                                                                <span className="tank-date">
                                                                  {getlimitAction(
                                                                    item.usage_limit_action
                                                                  )}
                                                                </span>
                                                              </>
                                                            )}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                              )
                                            : ""}
                                        </div>
                                      </Col>
                                    );
                                  }
                                )}
                              </Row>
                            </Col>
                          ) : null}
                        </Row>
                      </div>
                    </div>
                    {(usertype === 3 || usertype === 2) && (
                      <BlurComponent
                        blurData={{
                          name: multideviceItem?.device_name || "",
                          show: multideviceItem?.amc_status < 1 ? true : false,
                          id: multideviceItem?.device_code || "",
                          amc_msg: multideviceItem?.amc_msg || "",
                          not_show_pay: multideviceItem?.not_show_pay,
                          not_show_charge: multideviceItem?.not_show_charge,
                          amc_cost: multideviceItem?.amc_cost || ""
                        }}
                      />
                    )}
                  </div>
                );
              })
            : null}
          <br />
          {controllerdata?.flow_meter?.length > 0 ||
          getMultiDeviceCount("flow")?.length > 0 ? (
            <FlowTotalUsageTime
              controllerdata={controllerdata}
              TotalUsage={TotalUsage}
              TotalUsagecount={TotalUsagecount}
              flowList={[...(flowdata || []), ...(getMultiDeviceCount("flow") || [])]}
            />
          ) : null}
          <Tabs
            defaultActiveKey={1}
            id="fill-tab-example"
            className="mb-3 tabbar tabhead"
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
                  close={() => setaddmodal(false)}
                  controllerId={state?.id}
                  handleGetServiceDetails={handleGetServiceDetails}
                />
              ) : null}

              {isEditControllerCode?.isShowModal ? (
                <ModifyControllerCode
                  show={isEditControllerCode?.isShowModal}
                  onSuccess={() => {
                    handleChangeControllerCode();
                  }}
                  onCancel={() => {
                    setIsEditControllerCode((pre) => {
                      return {
                        ...pre,
                        isShowModal: false
                      };
                    });
                  }}
                  close={() =>
                    setIsEditControllerCode({
                      isEdit: false,
                      item: { controllerCode: "", controllerID: "" },
                      editedControllerCode: "",
                      isShowModal: false
                    })
                  }
                />
              ) : null}

              {lgShow.show ? (
                <AllDetailsEditModal
                  show={lgShow.show}
                  close={() =>
                    setLgShow((prev) => {
                      return {
                        ...prev,
                        show: false
                      };
                    })
                  }
                  editData={lgShow.data}
                  handleGetServiceDetails={handleGetServiceDetails}
                />
              ) : null}
              {deletemodal.show ? (
                <DeleteConfirmationModal
                  show={deletemodal.show}
                  close={() =>
                    setdeletemodal((prev) => {
                      return {
                        ...prev,
                        show: false
                      };
                    })
                  }
                  ServiceId={deletemodal.serviceid}
                  handleGetServiceDetails={handleGetServiceDetails}
                  Deletekey={1}
                />
              ) : null}

              {valvetimedelete.show ? (
                <DeleteConfirmationModal
                  Deletekey={13}
                  show={valvetimedelete.show}
                  close={() =>
                    setvalvetimedelete((prev) => {
                      return {
                        ...prev,
                        show: false
                      };
                    })
                  }
                  valvetimeid={valvetimedelete.time}
                  valveindex={valvetimedelete.valveindex}
                />
              ) : null}
              {motortimedelete.show ? (
                <DeleteConfirmationModal
                  Deletekey={14}
                  show={motortimedelete.show}
                  close={() =>
                    setmotortimedelete((prev) => {
                      return {
                        ...prev,
                        show: false
                      };
                    })
                  }
                  motortimeid={motortimedelete.time}
                  motorindex={motortimedelete.motorindex}
                />
              ) : null}
              <Loader isLoader={loader} />
              <div
                className="all-details-container-flex"
                style={{ marginTop: "0px" }}
              >
                <h4 className={devicestyle.page_head}>History Details</h4>
                {controllerdata?.controller_code ||
                controllerdata?.tank?.length > 0 ||
                controllerdata?.flow_meter?.length > 0 ||
                controllerdata?.valve?.length > 0 ||
                controllerdata?.chlorinator?.length > 0 ||
                controllerdata?.multi?.length > 0 ? (
                  <div
                    className={`${devicestyle.all_details_div_bg} ${commonstyle.cards_border_radius}`}
                  >
                    <div className="all-details-head-div">
                      {controllerdata?.controller_code ? (
                        <>
                          <p
                            className="controller controller-style"
                            style={
                              controllerdata?.controller_code &&
                              historyview.controller === true
                                ? { color: colors.blue }
                                : { color: colors.black }
                            }
                            onClick={() => {
                              handleTabView({
                                controller: true,
                                valve: false,
                                tank: false,
                                flow: false
                              });
                            }}
                          >
                            controller
                          </p>
                        </>
                      ) : null}

                      {controllerdata?.tank?.length > 0 ||
                      getMultiDeviceCount("tank").length > 0 ? (
                        <>
                          {/* <p className="border"></p> */}

                          <p
                            className="controller valve-style"
                            style={
                              (controllerdata?.tank?.length > 0 ||
                                getMultiDeviceCount("tank").length > 0) &&
                              historyview.tank === true
                                ? { color: colors.blue }
                                : { color: colors.black }
                            }
                            onClick={() => {
                              handleTabView({
                                controller: false,
                                valve: false,
                                tank: true,
                                flow: false
                              });
                            }}
                          >
                            tank
                          </p>
                        </>
                      ) : null}

                      {controllerdata?.flow_meter?.length > 0 ||
                      getMultiDeviceCount("flow").length > 0 ? (
                        <>
                          {/* <p className="border"></p> */}

                          <p
                            className="controller valve-style"
                            style={
                              (controllerdata?.flow_meter?.length > 0 ||
                                getMultiDeviceCount("flow").length > 0) &&
                              historyview.flow === true
                                ? { color: colors.blue }
                                : { color: colors.black }
                            }
                            onClick={() => {
                              handleTabView({
                                controller: false,
                                valve: false,
                                tank: false,
                                flow: true
                              });
                            }}
                          >
                            flow meter
                          </p>
                        </>
                      ) : null}

                      {controllerdata?.valve?.length > 0 ||
                      getMultiDeviceCount("valve").length > 0 ? (
                        <>
                          {/* <p className="border"></p> */}

                          <p
                            className="controller valve-style"
                            style={
                              (controllerdata?.valve?.length > 0 ||
                                getMultiDeviceCount("valve").length > 0) &&
                              historyview.valve === true
                                ? { color: colors.blue }
                                : { color: colors.black }
                            }
                            onClick={() => {
                              handleTabView({
                                controller: false,
                                valve: true,
                                tank: false,
                                flow: false
                              });
                            }}
                          >
                            valve
                          </p>
                        </>
                      ) : null}

                      {controllerdata?.chlorinator?.length > 0 ? (
                        <p
                          className="controller valve-style"
                          style={
                            historyview.chlorinator === true
                              ? { color: colors.blue }
                              : { color: colors.black }
                          }
                          onClick={() => {
                            handleTabView({
                              controller: false,
                              valve: false,
                              tank: false,
                              flow: false,
                              chlorinator: true
                            });
                          }}
                        >
                          chlorinator
                        </p>
                      ) : null}
                    </div>

                    <Controllerhistorydetails
                      historyview={historyview}
                      avoidletters={avoidletters}
                      location={location}
                      controllerdata={controllerdata}
                    />

                    <Tankhistorydetails
                      historyview={historyview}
                      avoidletters={avoidletters}
                      location={location}
                      controllerdata={controllerdata}
                      tankList={[
                        ...(tankdata || []),
                        ...(getMultiDeviceCount("tank") || [])
                      ]}
                      // deviceIDs={[
                      //   ...getMultiDeviceCount(
                      //     "tank",
                      //     MortorSessionData || controllerdata
                      //   )?.map((ele) => ele?.device_id),
                      //   ...(MortorSessionData
                      //     ? MortorSessionData
                      //     : controllerdata
                      //   )?.level_data?.map((id) => {
                      //     return id?.device_id;
                      //   }),
                      // ]}
                    />

                    <Flowhistorydetails
                      historyview={historyview}
                      avoidletters={avoidletters}
                      location={location}
                      controllerdata={controllerdata}
                      flowList={[
                        ...(flowdata || []),
                        ...(getMultiDeviceCount("flow") || [])
                      ]}
                      // deviceIDs={[
                      //   ...getMultiDeviceCount(
                      //     "flow",
                      //     MortorSessionData || controllerdata
                      //   )?.map((ele) => ele?.device_id),
                      //   ...(MortorSessionData
                      //     ? MortorSessionData
                      //     : controllerdata
                      //   )?.flow_meter?.map((id) => {
                      //     return id?.device_id;
                      //   }),
                      // ]}
                    />

                    <Chlorinatorhistorydetails
                      historyview={historyview}
                      location={location}
                      controllerdata={controllerdata}
                      chlorinatorList={controllerdata?.chlorinator || []}
                    />

                    <Valvehistorydetails
                      historyview={historyview}
                      avoidletters={avoidletters}
                      location={location}
                      controllerdata={controllerdata}
                      valveList={[
                        ...(valvedata || []),
                        ...(getMultiDeviceCount("valve") || [])
                      ]}
                      // deviceIDs={[
                      //   ...getMultiDeviceCount(
                      //     "valve",
                      //     MortorSessionData || controllerdata
                      //   )?.map((ele) => ele?.device_id),
                      //   ...(MortorSessionData
                      //     ? MortorSessionData
                      //     : controllerdata
                      //   )?.flow_meter?.map((id) => {
                      //     return id?.device_id;
                      //   }),
                      // ]}
                    />
                  </div>
                ) : (
                  <p className="device_no_data_found mb-3">no data found</p>
                )}
                <br />
                {listuser?.length > 0 && (
                  <>
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
                  </>
                )}
                {/* // ) : null} */}
              </div>
              <div>
                <div>
                  <h4 className={devicestyle.page_head}>
                    Service Details ({servicedetail?.total})
                  </h4>
                  {/* <button
                      className="addButton"
                      onClick={() => {
                        setaddmodal(true);
                      }}
                    >
                      add service
                    </button> */}
                </div>

                <ServiceItems CurrentServiceData={currenServiceItems} />
                {servicedetail?.total > 12 ? (
                  <div className="col-12 float-start d-flex justify-content-center controller-bottom ">
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
              style={{ marginBottom: 80 }}
              eventKey={2}
              title="Settings"
              disabled={
                (usertype === 2 || usertype === 3) &&
                controllerdata?.controller_code &&
                !controllerdata.amc_status
              }
            >
              {modalstates?.Addtime ? (
                <Timesetting
                  show={modalstates?.Addtime}
                  close={() =>
                    setmodal((prev) => {
                      return {
                        ...prev,
                        Addtime: false
                      };
                    })
                  }
                  motormode={motorschedule?.motormode}
                />
              ) : null}
              {modalstates?.edittime ? (
                <EditTimesetting
                  show={modalstates?.edittime}
                  close={() =>
                    setmodal((prev) => {
                      return {
                        ...prev,
                        edittime: false
                      };
                    })
                  }
                  edittime={edittimedata}
                  index={moterindex}
                  motormode={motorschedule?.motormode}
                />
              ) : null}

              {modalstates?.valveadd ? (
                <AddValvetime
                  show={modalstates?.valveadd}
                  close={() =>
                    setmodal((prev) => {
                      return {
                        ...prev,
                        valveadd: false
                      };
                    })
                  }
                  motormode={motorschedule?.motormode}
                  valvedatas={[
                    ...devicedata?.valve,
                    ...(getMultiDeviceCount("valve") || [])
                  ]}
                />
              ) : null}

              {modalstates?.valveedit ? (
                <Valveedit
                  show={modalstates?.valveedit}
                  close={() =>
                    setmodal((prev) => {
                      return {
                        ...prev,
                        valveedit: false
                      };
                    })
                  }
                  index={valveindex}
                  valuedata={valveeditdata}
                  motormode={motorschedule?.motormode}
                />
              ) : null}
              <Loader isLoader={loader} />

              {/* <ImSpinner11 /> */}

              {/* controller setting */}

              {(controllerdata?.controller_code !== null &&
                controllerdata?.controller_code !== "") ||
              valvedata?.length > 0 ||
              getMultiDeviceCount("valve").length > 0 ? (
                <h4 className={devicestyle.page_head}>Settings</h4>
              ) : (
                <p className="chartnodata">no data found</p>
              )}

              <div className={devicestyle.total_settings}>
                {controllerdata?.controller_code !== null &&
                controllerdata?.controller_code !== "" ? (
                  <div
                    className={`${devicestyle.settings_view} ${devicestyle.all_details_div_bg} 
                  ${commonstyle.cards_border_radius} ${commonstyle.cards_padding}`}
                  >
                    <div className="setting-top-bar">
                      <div className="setting-sub-bar">
                        <button className="motorhead">Motor Schedule</button>
                        {motorSchedulePending ? (
                          <span
                            style={{
                              marginLeft: 10,
                              fontSize: 12,
                              color: "#b8860b",
                              fontWeight: 600
                            }}
                          >
                            Sent — waiting for device confirmation…
                          </span>
                        ) : null}
                        {/* LOADING IMAGE */}
                        {settingloading ? (
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
                                devicedata?.access_type,
                                type?.requesttypeFour,
                                devicedata?.controller_id
                              );
                            }}
                          />
                        )}
                        {/* END */}
                      </div>
                      {devicedata?.access_type === null ||
                      devicedata?.access_type === 1 ||
                      devicedata?.access_type === 0 ? (
                        devicedata?.controller_code ? (
                          motortime || valvetime ? null : (
                            <img
                              src={
                                motorset
                                  ? ExportedImages.SAVE_ICON_BLUE
                                  : ExportedImages.EDIT_ICON_BLUE
                              }
                              onClick={() => {
                                toeditmotor();
                                setmotorset(!motorset);
                              }}
                              className="pointerCurser"
                            />
                          )
                        ) : null
                      ) : null}
                    </div>
                    <div className="setting-top-bar">
                      <div className="setting-sub-bar">
                        <p className="tank-header">
                          Motor Mode -
                          {!motorset ? (
                            <span className="tank-date">
                              {motorschedule?.motormode == 0
                                ? "Manual"
                                : motorschedule?.motormode == 1
                                  ? "Daily OP"
                                  : motorschedule?.motormode == 2
                                    ? "Daily OC"
                                    : motorschedule?.motormode == 3
                                      ? "Cyclic OP"
                                      : motorschedule?.motormode == 4
                                        ? "Cyclic OC"
                                        : null}
                            </span>
                          ) : (
                            <select
                              className="select-field filedPickBackground"
                              disabled={!motorset}
                              onClick={(e) => {
                                setmotorsch({
                                  ...motorschedule,
                                  motormode: e.target.value
                                });
                              }}
                            >
                              <option
                                selected={
                                  motorschedule?.motormode === 0 ? true : false
                                }
                                value={0}
                              >
                                manual
                              </option>
                              <option
                                selected={
                                  motorschedule?.motormode === 1 ? true : false
                                }
                                value={1}
                              >
                                daily op
                              </option>
                              <option
                                selected={
                                  motorschedule?.motormode === 2 ? true : false
                                }
                                value={2}
                              >
                                daily oc
                              </option>
                              <option
                                selected={
                                  motorschedule?.motormode === 3 ? true : false
                                }
                                value={3}
                              >
                                cyclic op
                              </option>
                              <option
                                selected={
                                  motorschedule?.motormode === 4 ? true : false
                                }
                                value={4}
                              >
                                cyclic oc
                              </option>
                            </select>
                          )}
                        </p>
                      </div>
                      {/* <p className="tank-date">
                        {devicedata?.controller_setting?.created_at}
                      </p> */}
                    </div>
                    <div className="setting-top-bar">
                      <div className="settingmotor">
                        <p className="tank-header">Allowed Running Hours</p>
                        {!motorset ? (
                          <span className="tank-date">
                            {motorschedule?.runhrs ? motorschedule?.runhrs : ""}
                          </span>
                        ) : (
                          <CommonClockTimePicker
                            value={
                              motorschedule?.runhrs !== null
                                ? dayjs("2220-08-05 " + motorschedule?.runhrs)
                                : ""
                            }
                            ampm={false}
                            // allowEmpty
                            // showSecond={false}
                            format="HH:mm"
                            onChange={(e) => {
                              setmotorsch({
                                ...motorschedule,
                                runhrs: dayjs(e).format("HH:mm:ss")
                              });
                            }}
                            istestFieldStyle
                            // showSecond={false}
                            className="dateborder"
                          />
                          // <TimePicker
                          //   value={
                          //     motorschedule?.runhrs !== null
                          //       ? moment("2220-08-05 " + motorschedule?.runhrs)
                          //       : ""
                          //   }
                          //   allowEmpty
                          //   showSecond={false}
                          //   format="HH:mm:00"
                          //   onChange={(e) => {
                          //     setmotorsch({
                          //       ...motorschedule,
                          //       runhrs: moment(e).format("HH:mm:ss"),
                          //     });
                          //   }}
                          //   // showSecond={false}
                          //   className="dateborder"
                          // />
                        )}
                      </div>
                    </div>

                    {/* <hr></hr> */}
                    {devicedata?.access_type === null ||
                    devicedata?.access_type === 1 ||
                    devicedata?.access_type === 0 ? (
                      devicedata?.controller_code ? (
                        motortime ? (
                          <div className="edit-btns">
                            <button
                              type="button"
                              className="edit-time-btns"
                              onClick={() =>
                                setmodal({ modalstates, Addtime: true })
                              }
                            >
                              add
                            </button>
                            <button
                              type="button"
                              className="edit-time-btns"
                              onClick={() => {
                                toeditmotorsch();
                              }}
                            >
                              save
                            </button>
                            <button
                              type="button"
                              className="edit-time-btns"
                              onClick={() => {
                                if (DubMotorScheduleData?.length > 0) {
                                  dispatch(
                                    Updatemotorscheduleedit(
                                      DubMotorScheduleData
                                    )
                                  );
                                  MotorController();
                                  setmotortime(false);
                                } else {
                                  dispatch(Updatemotorscheduleedit([]));
                                  setmotortime(false);
                                }
                              }}
                            >
                              cancel
                            </button>
                          </div>
                        ) : motorset || valvetime ? null : (
                          <div className="edit-btns">
                            <img
                              src={ExportedImages.EDIT_ICON_BLUE}
                              onClick={() => setmotortime(true)}
                              className="editbtn pointerCurser"
                            />
                          </div>
                        )
                      ) : null
                    ) : null}
                    <div
                      className="settingmotor"
                      style={{ justifyContent: "flex-end" }}
                    >
                      <p className="value">check valve</p>
                      {/* 
                        {buttongreyid === 1 ? (
                          <Toggle
                            // id={index}
                            buttoncol={"grey"}
                            isChecked={
                              devicedata?.controller_setting?.check_valve === 1
                                ? true
                                : false
                            }
                            handleChange={({ status }) => {
                              ChangeCheckValveButton(
                                devicedata?.controller_id,
                                status,
                                devicedata?.access_type
                              );
                            }}
                            valvelength={valvedata?.length}
                            motormode={parseInt(motorschedule?.motormode)}
                          />
                        ) :  */}
                      {devicedata?.access_type === 0 ||
                      devicedata?.access_type === 1 ||
                      devicedata?.access_type === 2 ||
                      devicedata?.access_type === 3 ||
                      devicedata?.access_type === null ? (
                        <Toggle
                          // id={index}
                          isChecked={CheckValveButton === 1 ? true : false}
                          handleChange={({ status }) => {
                            setCheckValveButton(status ? 1 : 0);
                          }}
                          valvelength={
                            valvedata?.length ||
                            getMultiDeviceCount("valve")?.length
                          }
                          motormode={parseInt(motorschedule?.motormode)}
                          CheckvalveEditState={motortime}
                        />
                      ) : null}
                    </div>
                    {motorscheduleedit?.length > 0 ? (
                      <div className={devicestyle.settingtime}>
                        {motorscheduleedit?.map((setting, ind) => {
                          let end = (setting?.time2).split(`:`);
                          return (
                            <div key={ind}>
                              {setting?.time1 ? (
                                <div
                                  className={devicestyle.timesettings}
                                  key={ind}
                                >
                                  <div className={devicestyle.timing_width}>
                                    <div
                                      className={devicestyle.valve_time_dele}
                                    >
                                      <p className="tank-header">
                                        Timing {ind + 1}
                                      </p>
                                      {motorset ? null : motortime ? (
                                        <FaTrashAlt
                                          className="icontrash"
                                          onClick={() => {
                                            // todeletetime(
                                            //   ind,
                                            //   setting.time_setting_id
                                            // )

                                            setmotortimedelete({
                                              show: true,
                                              motorindex: ind,
                                              time: setting.time_setting_id
                                            });
                                          }}
                                        />
                                      ) : null}
                                    </div>

                                    <div className={devicestyle.settingflex}>
                                      <div className="setting-flex">
                                        <p className="valve_run_time">
                                          {motorschedule?.motormode == 0 ||
                                          motorschedule?.motormode == 1 ||
                                          motorschedule?.motormode == 2
                                            ? "Start at"
                                            : "On time"}
                                        </p>
                                        <button
                                          className={
                                            motortime
                                              ? "notification"
                                              : "time-btn"
                                          }
                                          onClick={() => {
                                            if (motortime) {
                                              setmodal({
                                                ...modalstates,
                                                edittime: true
                                              });
                                            }
                                            setmotorindex(ind);
                                            setedittimedata(setting);
                                          }}
                                        >
                                          {setting?.time1}
                                        </button>
                                      </div>
                                      <div className="setting-flex">
                                        <p className="valve_run_time">
                                          {motorschedule?.motormode == 0 ||
                                          motorschedule?.motormode == 1 ||
                                          motorschedule?.motormode == 2
                                            ? "Run for"
                                            : "Off Time"}
                                        </p>
                                        <button
                                          className={
                                            motortime
                                              ? "notification"
                                              : "time-btn"
                                          }
                                          onClick={() => {
                                            if (motortime) {
                                              setmodal({
                                                ...modalstates,
                                                edittime: true
                                              });
                                            }
                                            setmotorindex(ind);
                                            setedittimedata(setting);
                                          }}
                                        >
                                          {setting?.time2}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="chartnodata">No datas Found</p>
                    )}
                  </div>
                ) : null}

                {/* valve settings */}

                {devicedata?.valve?.length > 0 ||
                getMultiDeviceCount("valve")?.length > 0 ? (
                  <div
                    className={`${devicestyle.settings_view} ${devicestyle.all_details_div_bg}
                    ${commonstyle.cards_padding} ${commonstyle.cards_border_radius}`}
                  >
                    <div className="tank-level">
                      <p className="motorhead">Valve Schedule</p>
                      {valveSchedulePending ? (
                        <span
                          style={{
                            marginLeft: 10,
                            fontSize: 12,
                            color: "#b8860b",
                            fontWeight: 600
                          }}
                        >
                          Sent — waiting for device confirmation…
                        </span>
                      ) : null}
                      <div
                        className="edit-btns"
                        style={{ alignItems: "center" }}
                      >
                        <button
                          type="button"
                          className="settings-btn"
                          onClick={() => {
                            // loadingspinner(
                            //   devicedata?.access_type,
                            //   type.requesttypeTwo,
                            //   valve.device_id,
                            //   devicetype.valvedevicetype
                            // );
                            handleRefreshAllTimeSettings();

                            setValveTimeSettingLoader(true);
                          }}
                        >
                          {valveTimeSettingLoader ? (
                            <img
                              alt=""
                              src={ExportedImages.WHITE_SPINNER_GIF}
                              className="settingspinner"
                            />
                          ) : (
                            <ImSpinner11 />
                          )}
                          &nbsp;&nbsp;&nbsp;Settings
                        </button>

                        {devicedata?.access_type === null ||
                        devicedata?.access_type === 1 ||
                        devicedata?.access_type === 0 ? (
                          devicedata?.valve?.length > 0 ||
                          getMultiDeviceCount("valve")?.length > 0 ? (
                            valvetime ? (
                              <>
                                {isDaily && (
                                  <button
                                    type="button"
                                    className="edit-time-btns"
                                    onClick={() => {
                                      setmodal({ modalstates, valveadd: true });
                                    }}
                                  >
                                    add
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="edit-time-btns"
                                  onClick={() => {
                                    tovalveeditsave();
                                  }}
                                >
                                  save
                                </button>

                                <button
                                  type="button"
                                  className="edit-time-btns"
                                  onClick={() => {
                                    handleSetweeklySchedule(valueTimeList);

                                    if (DubValveScheduleData?.length > 0) {
                                      dispatch(
                                        Updatevalvescheduleedit(
                                          DubValveScheduleData
                                        )
                                      );
                                      MotorController("updateWeeklyTime");
                                      setvalvetime(false);
                                      setValveModeButton(
                                        devicedata?.controller_setting
                                          ?.check_valve
                                      );
                                    } else {
                                      dispatch(Updatevalvescheduleedit([]));
                                      setvalvetime(false);
                                    }
                                  }}
                                >
                                  cancel
                                </button>
                              </>
                            ) : motorset || motortime ? null : (
                              <img
                                src={ExportedImages.EDIT_ICON_BLUE}
                                onClick={() => setvalvetime(true)}
                                className="editbtn pointerCurser"
                              />
                            )
                          ) : null
                        ) : null}
                      </div>{" "}
                    </div>

                    {/* <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {ValveModeButton === "" ||
                      ValveModeButton === undefined ||
                      ValveModeButton === null ? null : (
                        <div className="valuescedule">
                          <p className="tank-header">Valve mode</p>

                          {devicedata?.access_type === 0 ||
                          devicedata?.access_type === 1 ||
                          devicedata?.access_type === 2 ||
                          devicedata?.access_type === 3 ||
                          devicedata?.access_type === null ? (
                            <Toggle
                              
                              isChecked={ValveModeButton === 1 ? true : false}
                              handleChange={({ status }) => {
                                setValveModeButton(status ? 1 : 0);
                              }}
                              ValveState={valvetime}
                            />
                          ) : null}
                        </div>
                      )}
                    </div>
                   */}
                    {/* {valvescheduleedit?.some(
                      (ele) => ele?.valve_mode !== 2
                    ) && (
                      <p
                        className="motorhead"
                        style={{ background: "#00879E" }}
                      >
                        Daily Schedule
                      </p>
                    )} */}

                    <div className={devicestyle.settingtime}>
                      {valvescheduleedit?.map((setting, ind) => {
                        let end = (setting?.time2).split(`:`);
                        if (setting?.valve_mode !== 2) {
                          return (
                            <div className={devicestyle.timesettings} key={ind}>
                              <div className={devicestyle.timing_width}>
                                <div className={devicestyle.valve_time_dele}>
                                  <p className="tank-header">
                                    {setting?.device_name}
                                  </p>

                                  {motorset ? null : valvetime ? (
                                    <FaTrashAlt
                                      className="icontrash"
                                      onClick={() =>
                                        // todeletedevicetime(
                                        //   ind,
                                        //   setting?.time_setting_id
                                        // )
                                        setvalvetimedelete({
                                          show: true,
                                          valveindex: ind,
                                          time: setting?.time_setting_id
                                        })
                                      }
                                    />
                                  ) : null}
                                </div>

                                <div className={devicestyle.settingflex}>
                                  <div className="setting-flex">
                                    <p className="valve_run_time">
                                      {motorschedule?.motormode == 0 ||
                                      motorschedule?.motormode == 1 ||
                                      motorschedule?.motormode == 2
                                        ? "Start at"
                                        : "On time"}
                                    </p>
                                    <button
                                      className={
                                        valvetime
                                          ? devicestyle.notification
                                          : "time-btn"
                                      }
                                      onClick={() => {
                                        if (valvetime) {
                                          setvalveeditdata(setting);
                                          setvalveindex(ind);
                                          setmodal({
                                            ...modalstates,
                                            valveedit: true
                                          });
                                        }
                                      }}
                                    >
                                      {setting?.time1}
                                    </button>
                                  </div>
                                  <div className="setting-flex">
                                    <p className="valve_run_time">
                                      {motorschedule?.motormode == 0 ||
                                      motorschedule?.motormode == 1 ||
                                      motorschedule?.motormode == 2
                                        ? "Run for"
                                        : "Off Time"}
                                    </p>
                                    <button
                                      className={
                                        valvetime
                                          ? devicestyle.notification
                                          : "time-btn"
                                      }
                                      onClick={() => {
                                        if (valvetime) {
                                          setvalveeditdata(setting);
                                          setvalveindex(ind);
                                          setmodal({
                                            ...modalstates,
                                            valveedit: true
                                          });
                                        }
                                      }}
                                    >
                                      {setting?.time2}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* {motorset ? null : valvetime ? (
                              <FaTrashAlt
                                className="icontrash"
                                onClick={() =>
                                  // todeletedevicetime(
                                  //   ind,
                                  //   setting?.time_setting_id
                                  // )
                                  setvalvetimedelete({
                                    show: true,
                                    valveindex: ind,
                                    time: setting?.time_setting_id,
                                  })
                                }
                              />
                            ) : null} */}
                            </div>
                          );
                        }
                      })}
                    </div>
                    {(devicedata?.valve?.length > 0 ||
                      getMultiDeviceCount("valve")?.length > 0) &&
                    devicedata?.weekly_mode ? (
                      <ValveWeeklySchedule
                        valvetime={valvetime}
                        setvalvetime={setvalvetime}
                        valueTimeList={valueTimeList}
                        MotorController={MotorController}
                        valveList={
                          [
                            ...(valvedata || []),
                            ...(getMultiDeviceCount("valve") || [])
                          ]?.filter((ele) => ele?.valve_mode === 2) || []
                        }
                        motorMode={motorschedule?.motormode}
                        weeklyTimeList={weeklyTimeList}
                        setWeeklyTimeList={setWeeklyTimeList}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                ) : null}
              </div>

              {/* Moresettings */}

              {controllerdata?.controller_code !== null &&
              controllerdata?.controller_code !== "" ? (
                <>
                  <div
                    className={`${devicestyle.more_settings_view} ${devicestyle.all_details_div_bg}
                ${commonstyle.cards_padding} ${commonstyle.cards_border_radius}`}
                    style={{ marginBottom: 15 }}
                  >
                    <div className="setting-top-bar">
                      <div className="sub-date-bar">
                        <p className="tank-header">Received At:</p>
                        <p className="tank-date">
                          {devicedata?.controller_setting?.created_at
                            ? moment(
                                devicedata?.controller_setting?.created_at
                              ).format("DD-MM-YYYY HH:mm:ss")
                            : null}
                        </p>
                      </div>
                      <div className="setting-sub-bar">
                        {/* <button className="motorhead">More Settings</button> */}
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
                                devicedata?.access_type,
                                type?.requesttypeFive,
                                devicedata?.controller_id
                              );
                            }}
                          />
                        )}
                      </div>
                      {devicedata?.access_type === null ||
                      devicedata?.access_type === 1 ||
                      devicedata?.access_type === 0 ? (
                        <img
                          alt=""
                          src={
                            editsetting
                              ? ExportedImages.SAVE_ICON_BLUE
                              : ExportedImages.EDIT_ICON_BLUE
                          }
                          onClick={() => {
                            toeditmorestting(
                              devicedata?.controller_id,
                              devicedata?.access_type
                            );
                            setedit(!editsetting);
                          }}
                          className="pointerCurser"
                        />
                      ) : null}
                    </div>
                    <div className="date-bar">
                      {/* <div className="sub-date-bar">
                      <p className="tank-header">Controller time:</p>
                      <p className="tank-date">
                      
                        {devicedata?.controller_setting?.controller_datetime}
                       
                      </p>
                    </div> */}
                    </div>
                    <div className="more-set-body timeflex">
                      <div className="setting-top-div ">
                        <div className="setting-sub-div">
                          <p className="tank-header">HV</p>
                          {editsetting ? (
                            <input
                              type="text"
                              maxLength={3}
                              onKeyPress={avoidletters}
                              className="more-edit filedPickBackground"
                              value={moresettingdata?.HV}
                              disabled={!editsetting}
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  HV:
                                    parseInt(e.target.value) <= 999
                                      ? e.target.value
                                      : ""
                                })
                              }
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.hv}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">LV</p>
                          {editsetting ? (
                            <input
                              type="text"
                              maxLength={3}
                              onKeyPress={avoidletters}
                              disabled={!editsetting}
                              className="more-edit filedPickBackground"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  LV:
                                    parseInt(e.target.value) <= 999
                                      ? e.target.value
                                      : ""
                                })
                              }
                              value={moresettingdata?.LV}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.lv}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">Dry</p>
                          {editsetting ? (
                            <input
                              type="text"
                              disabled={!editsetting}
                              maxLength={2}
                              onKeyPress={avoidletters}
                              className="more-edit filedPickBackground"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  Dry: e.target.value
                                })
                              }
                              defaultValue={moresettingdata?.Dry}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.dry_amps}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">OL</p>
                          {editsetting ? (
                            <input
                              type="text"
                              disabled={!editsetting}
                              maxLength={2}
                              onKeyPress={avoidletters}
                              className="more-edit filedPickBackground"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  OL:
                                    parseInt(e.target.value) <= 60
                                      ? e.target.value
                                      : ""
                                })
                              }
                              value={moresettingdata?.OL}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.ol_amps}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">Ph mode</p>
                          {editsetting ? (
                            <select
                              type="text"
                              disabled={!editsetting}
                              className="more-edit"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  ph: e.target.value
                                })
                              }
                            >
                              <option
                                value={0}
                                selected={
                                  devicedata?.controller_setting?.ph_mode === 0
                                    ? true
                                    : false
                                }
                              >
                                3ph
                              </option>
                              <option
                                value={1}
                                selected={
                                  devicedata?.controller_setting?.ph_mode === 1
                                    ? true
                                    : false
                                }
                              >
                                2ph
                              </option>
                            </select>
                          ) : (
                            <span className="more-setting-btn">
                              {devicedata?.controller_setting?.ph_mode === 0
                                ? "3ph"
                                : devicedata?.controller_setting?.ph_mode === 1
                                  ? "2ph"
                                  : null}
                            </span>
                          )}

                          {/* <input
                          type="text"
                          onKeyPress={avoidletters}
                        disabled={
                              !editsetting 
                            }
                          className={
                            editsetting ? "more-edit" : "more-setting-btn"
                          }
                          onChange={(e) =>
                            setmoresetting({
                              ...moresettingdata,
                              ph: e.target.value,
                            })
                          }
                          defaultValue={
                            devicedata?.controller_setting?.ph_mode
                              ? `${devicedata?.controller_setting?.ph_mode}ph`
                              : null
                          }
                        /> */}
                        </div>
                      </div>
                      <div className="setting-top-div">
                        <div className="setting-sub-div">
                          <p className="tank-header">Dry 2ph</p>
                          {editsetting ? (
                            <input
                              type="text"
                              onKeyPress={avoidletters}
                              disabled={!editsetting}
                              maxLength={2}
                              className="more-edit filedPickBackground"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  Dry2ph: e.target.value
                                })
                              }
                              defaultValue={moresettingdata?.Dry2ph}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.dry_2ph}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">Ol 2ph</p>
                          {editsetting ? (
                            <input
                              type="text"
                              maxLength={2}
                              onKeyPress={avoidletters}
                              disabled={!editsetting}
                              className="more-edit"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  Ol2ph: e.target.value
                                })
                              }
                              defaultValue={moresettingdata?.Ol2ph}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.over_load_2ph}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">Continues</p>
                          {editsetting ? (
                            <select
                              type="text"
                              disabled={!editsetting}
                              className="more-edit"
                              onClick={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  continues: parseInt(e.target.value)
                                })
                              }
                              // value={
                              //   devicedata?.controller_setting?.continuous === 0
                              //     ? "OFF"
                              //     : devicedata?.controller_setting?.continuous ===
                              //       1
                              //     ? "ON"
                              //     : null
                              // }
                            >
                              <option
                                value={0}
                                selected={
                                  devicedata?.controller_setting?.continuous ===
                                  0
                                    ? true
                                    : false
                                }
                              >
                                Off
                              </option>
                              <option
                                value={1}
                                selected={
                                  devicedata?.controller_setting?.continuous ===
                                  1
                                    ? true
                                    : false
                                }
                              >
                                on
                              </option>
                            </select>
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.continuous === 0
                                ? "OFF"
                                : devicedata?.controller_setting?.continuous ===
                                    1
                                  ? "ON"
                                  : null}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">SD</p>
                          {editsetting ? (
                            <input
                              type="text"
                              maxLength={2}
                              disabled={!editsetting}
                              onKeyPress={avoidletters}
                              className="more-edit"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  SD: e.target.value
                                })
                              }
                              defaultValue={moresettingdata?.SD}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.sd_sec}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">OFFD</p>
                          {editsetting ? (
                            <input
                              type="text"
                              maxLength={2}
                              disabled={!editsetting}
                              onKeyPress={avoidletters}
                              className="more-edit"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  Offd: e.target.value
                                })
                              }
                              defaultValue={moresettingdata?.Offd}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.offd !== null
                                ? `${devicedata?.controller_setting?.offd}s`
                                : null}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="setting-top-div">
                        <div className="setting-sub-div">
                          <p className="tank-header">Dry sense Delay</p>
                          {editsetting ? (
                            <input
                              type="text"
                              onKeyPress={avoidletters}
                              maxLength={2}
                              disabled={!editsetting}
                              className="more-edit"
                              onChange={(e) => {
                                checknum(parseInt(e.target.value));
                              }}
                              value={moresettingdata?.DSD}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting
                                ?.dry_sense_delay !== null
                                ? `${devicedata?.controller_setting?.dry_sense_delay}s`
                                : null}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">Dry reset time</p>
                          {editsetting ? (
                            <input
                              type="text"
                              disabled={!editsetting}
                              className="more-edit"
                              placeholder="00:00"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  DRT: `${e.target.value}:00`
                                })
                              }
                              defaultValue={moresettingdata?.DRT}
                            />
                          ) : (
                            // <CommonClockTimePicker
                            //   className="more-edit"
                            //   disabled={!editsetting}
                            //   // value={
                            //   //   devicedata?.controller_setting
                            //   //     ?.dry_reset_time !== null
                            //   //     ? dayjs(
                            //   //         "2220-08-05 " +
                            //   //           devicedata?.controller_setting
                            //   //             ?.dry_reset_time
                            //   //       )
                            //   //     : ""
                            //   // }
                            //   inputBoxStyles={{
                            //     background: "#ffe4e4",
                            //     color: "#000",
                            //   }}
                            //   value={
                            //     moresettingdata?.DRT
                            //       ? dayjs("2020-08-05 " + moresettingdata?.DRT)
                            //       : ""
                            //   }
                            //   istestFieldStyle
                            //   // allowEmpty
                            //   // showSecond={false}
                            //   format="HH:mm:ss"
                            //   onChange={handleValueChange}
                            //   isTimeSetting
                            // />
                            // <TimePicker
                            //   className="more-edit"
                            //   disabled={!editsetting}
                            //   defaultValue={
                            //     devicedata?.controller_setting
                            //       ?.dry_reset_time !== null
                            //       ? moment(
                            //           "2220-08-05 " +
                            //             devicedata?.controller_setting
                            //               ?.dry_reset_time
                            //         )
                            //       : ""
                            //   }
                            //   allowEmpty
                            //   showSecond={false}
                            //   format="HH:mm:00"
                            //   onChange={handleValueChange}
                            // />
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.dry_reset_time}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">LV diff</p>
                          {editsetting ? (
                            <input
                              type="text"
                              disabled={!editsetting}
                              maxLength={2}
                              onKeyPress={avoidletters}
                              className="more-edit"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  LV_diff: e.target.value
                                })
                              }
                              defaultValue={moresettingdata?.LV_diff}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.low_volt_diff}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">HV diff</p>
                          {editsetting ? (
                            <input
                              type="text"
                              disabled={!editsetting}
                              maxLength={2}
                              onKeyPress={avoidletters}
                              className="more-edit"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  HV_diff: e.target.value
                                })
                              }
                              defaultValue={moresettingdata?.HV_diff}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.high_volt_diff}
                            </p>
                          )}
                        </div>

                        <div className="setting-sub-div">
                          <p className="tank-header">Float</p>
                          {editsetting ? (
                            <select
                              type="text"
                              disabled={!editsetting}
                              className="more-edit"
                              onClick={(e) => {
                                setmoresetting({
                                  ...moresettingdata,
                                  Float: parseInt(e.target.value)
                                });
                              }}
                              // defaultValue={
                              //   parseInt(
                              //     devicedata?.controller_setting?.float
                              //   ) === 0
                              //     ? "Off"
                              //     : parseInt(
                              //         devicedata?.controller_setting?.float
                              //       ) === 1
                              //     ? "ON"
                              //     : null
                              // }
                            >
                              <option
                                value={0}
                                selected={
                                  devicedata?.controller_setting?.float === 0
                                    ? true
                                    : false
                                }
                              >
                                Off
                              </option>
                              <option
                                value={1}
                                selected={
                                  devicedata?.controller_setting?.float === 1
                                    ? true
                                    : false
                                }
                              >
                                on
                              </option>
                            </select>
                          ) : (
                            <span className="more-setting-btn">
                              {devicedata?.controller_setting?.float === 0
                                ? "Off"
                                : devicedata?.controller_setting?.float === 1
                                  ? "ON"
                                  : null}
                            </span>
                          )}
                        </div>

                        {/* kjk */}
                      </div>

                      <div className="setting-top-div">
                        <div className="setting-sub-div new-one">
                          <p className="tank-header">Voltage display</p>
                          {editsetting ? (
                            <select
                              type="text"
                              disabled={!editsetting}
                              className="more-edit"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  voldisplay: parseInt(e.target.value)
                                })
                              }
                            >
                              <option
                                value={0}
                                selected={
                                  devicedata?.controller_setting
                                    ?.volt_display === 0
                                    ? true
                                    : false
                                }
                              >
                                L to N
                              </option>
                              <option
                                value={1}
                                selected={
                                  devicedata?.controller_setting
                                    ?.volt_display === 1
                                    ? true
                                    : false
                                }
                              >
                                L to L
                              </option>
                            </select>
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.volt_display ===
                              0
                                ? "L to N"
                                : devicedata?.controller_setting
                                      ?.volt_display === 1
                                  ? "L to L"
                                  : null}
                            </p>
                          )}
                        </div>

                        <div className="setting-sub-div">
                          <p className="tank-header">Voltage</p>
                          {editsetting ? (
                            <select
                              type="text"
                              disabled={!editsetting}
                              className="more-edit"
                              onClick={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  Voltage: e.target.value
                                })
                              }
                              // defaultValue={
                              //   devicedata?.controller_setting?.voltage === 0
                              //     ? "OFF"
                              //     : devicedata?.controller_setting?.voltage === 1
                              //     ? "ON"
                              //     : null
                              // }
                            >
                              <option
                                value={0}
                                selected={
                                  devicedata?.controller_setting?.voltage === 0
                                    ? true
                                    : false
                                }
                              >
                                Off
                              </option>
                              <option
                                value={1}
                                selected={
                                  devicedata?.controller_setting?.voltage === 1
                                    ? true
                                    : false
                                }
                              >
                                on
                              </option>
                            </select>
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.voltage === 0
                                ? "OFF"
                                : devicedata?.controller_setting?.voltage === 1
                                  ? "ON"
                                  : null}
                            </p>
                          )}
                        </div>

                        <div className="setting-sub-div">
                          <p className="tank-header">Current</p>
                          {editsetting ? (
                            <select
                              type="text"
                              disabled={!editsetting}
                              className="more-edit"
                              onClick={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  current: parseInt(e.target.value)
                                })
                              }
                              // defaultValue={
                              //   devicedata?.controller_setting?.current === 0
                              //     ? "OFF"
                              //     : devicedata?.controller_setting?.current === 1
                              //     ? "ON"
                              //     : null
                              // }
                            >
                              <option
                                value={0}
                                selected={
                                  devicedata?.controller_setting?.current === 0
                                    ? true
                                    : false
                                }
                              >
                                Off
                              </option>
                              <option
                                value={1}
                                selected={
                                  devicedata?.controller_setting?.current === 1
                                    ? true
                                    : false
                                }
                              >
                                on
                              </option>
                            </select>
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.current === 0
                                ? "OFF"
                                : devicedata?.controller_setting?.current === 1
                                  ? "ON"
                                  : null}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">PF</p>
                          {editsetting ? (
                            <input
                              type="text"
                              disabled={!editsetting}
                              onKeyPress={avoidletters}
                              maxLength={2}
                              className="more-edit"
                              onChange={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  pf:
                                    parseInt(e.target.value) <= 75
                                      ? e.target.value
                                      : ""
                                })
                              }
                              value={moresettingdata?.pf}
                            />
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.pf}
                            </p>
                          )}
                        </div>
                        <div className="setting-sub-div">
                          <p className="tank-header">E-starter</p>
                          {editsetting ? (
                            <select
                              type="text"
                              disabled={!editsetting}
                              className="more-edit"
                              onClick={(e) =>
                                setmoresetting({
                                  ...moresettingdata,
                                  E_starter: parseInt(e.target.value)
                                })
                              }
                              // defaultValue={
                              //   devicedata?.controller_setting?.e_starter === 0
                              //     ? "OFF"
                              //     : devicedata?.controller_setting?.e_starter ===
                              //       1
                              //     ? "ON"
                              //     : null
                              // }
                            >
                              <option
                                value={0}
                                selected={
                                  devicedata?.controller_setting?.e_starter ===
                                  0
                                    ? true
                                    : false
                                }
                              >
                                Off
                              </option>
                              <option
                                value={1}
                                selected={
                                  devicedata?.controller_setting?.e_starter ===
                                  1
                                    ? true
                                    : false
                                }
                              >
                                on
                              </option>
                            </select>
                          ) : (
                            <p className="more-setting-btn">
                              {devicedata?.controller_setting?.e_starter === 0
                                ? "OFF"
                                : devicedata?.controller_setting?.e_starter ===
                                    1
                                  ? "ON"
                                  : null}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="setting-sub-bar">
                      <p className="tank-header">
                        Notification &nbsp;&nbsp;&nbsp;
                        {devicedata?.access_type === 0 ||
                        devicedata?.access_type === 1 ||
                        devicedata?.access_type === 2 ||
                        devicedata?.access_type === 3 ||
                        devicedata?.access_type === null ? (
                          <Toggle
                            // id={index}
                            editstate={editsetting}
                            isChecked={buttonstate === 1 ? true : false}
                            handleChange={({ status }) => {
                              setbutton(status ? 1 : 0);
                            }}
                          />
                        ) : null}
                      </p>
                    </div>
                  </div>
                  {(usertype === 1 || usertype === 2) && buttonstate === 1 && (
                    <div className={`row ${commonstyle.BoxContainer} `}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
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
                              handleUpdateNotificationSetting(notificationList);
                            }
                          }}
                          className="pointerCurser"
                        />
                      </div>

                      <p className={commonstyle.description}>
                        <span>*</span>Only the selected options trigger an alert
                        on your mobile
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
                                let UpdatedList = notificationList?.map(
                                  (ele) =>
                                    ele.id === item.id
                                      ? {
                                          ...item,
                                          access: !item.access
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
            </Tab>
            <Tab eventKey={3} title="Chart">
              {controllerdata?.controller_code ||
              tankdata?.length > 0 ||
              flowdata?.length > 0 ||
              valvedata?.length > 0 ||
              getMultiDeviceCount("all")?.length > 0 ? (
                <h4 className={`${devicestyle.page_head} colorchange`}>
                  Charts
                </h4>
              ) : (
                <p className="chartnodata">No datas Found</p>
              )}
              <div className={chartstyle.chart_bottom}>
                {eventkey == 3 ? (
                  <>
                    {controllerdata?.controller_code ? (
                      <ControllerWaterfallChart
                        controllerchart={{
                          id: state?.id,
                          con_name: controllerdata?.controller_name
                        }}
                      />
                    ) : null}
                    {tankdata?.length > 0 ||
                    getMultiDeviceCount("tank")?.length > 0 ? (
                      <TankLineChart
                        tankchart={state?.id}
                        flowList={[
                          ...(tankdata || []),
                          ...(getMultiDeviceCount("tank", null, true) || [])
                        ]}
                      />
                    ) : null}
                    {flowdata?.length > 0 ||
                    getMultiDeviceCount("flow")?.length > 0 ? (
                      <FlowBarChart
                        flowchart={state?.id}
                        flowList={[
                          ...(flowdata || []),
                          ...(getMultiDeviceCount("flow", null, true) || [])
                        ]}
                      />
                    ) : null}
                    {valvedata?.length > 0 ||
                    getMultiDeviceCount("valve")?.length > 0 ? (
                      <ValveWaterfallChart
                        valvechart={state?.id}
                        flowList={[
                          ...(valvedata || []),
                          ...(getMultiDeviceCount("valve", null, true) || [])
                        ]}
                      />
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
