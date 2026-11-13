import "../ViewController.modules.css";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowLeft
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Adminlistdevice,
  EditDevice,
  devicerefreshapi,
  lastReceivedDataBatch,
  listcontrollerapi,
  buttonapi
} from "../../../Service/ApiService";
import Loader from "../../Loader";
import ReactPaginate from "react-paginate";
import devicestyle from "../ViewController/motorcontroller.module.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ImSpinner11 } from "react-icons/im";
import { MdLocationOn } from "react-icons/md";
import Toggle from "../../ToggleButton";
import moment from "moment";
import { useNavigate } from "react-router";
import { JSONtoformdata } from "../../../Utilities/Methods";
import Filterdevice from "../../../Modalcomponents/FilterDevice";
import productionstyle from "../Productionunit/production.module.css";
import { ExportedImages } from "../../../Utilities/ImageExport";
import { useSelector } from "react-redux";
import CommonSwitch from "../../CommonComponents/CommonSwitch";
import CommonTabs from "../../CommonComponents/CommonTabs";
import MotorControllerCard from "../MotorControllerCard";
import { getCookie } from "../../../Utilities/Cookie";

export default function Controllerdevice() {
  let abortcontroller = undefined;
  const navigate = useNavigate();
  const [loader, setloader] = useState(false);
  const [list, setlist] = useState({});
  let controllertype = parseInt(localStorage.getItem("contollertype"));
  const [filterShow, setFilterShow] = useState(false);
  const { DeviceFilter } = useSelector((state) => state);

  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;

  // MotorControllerCard's own spinner/toggle state — separate from the
  // loaderId-based state below (used by Tank/Flow/Valve/Multi), since the
  // shared card keys its spinner off a row index instead of an id.
  const [motorCardLoading, setMotorCardLoading] = useState(false);
  const [motorLoadingIndex, setMotorLoadingIndex] = useState();
  const [motorButtonGreyId, setMotorButtonGreyId] = useState("");

  const [editDevice, setEditDevice] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const [isloading, setloading] = useState(false);
  const [loaderId, setLoaderId] = useState("");

  const [isSettingLoading, setIsSettingLoading] = useState(false);
  const [settingLoaderId, setSettingLoaderId] = useState("");

  const [LocationId, setLocationId] = useState("");
  const [isLocation, setIsLocation] = useState(false);

  const [ButtonId, setButtonId] = useState(false);

  const [Values, setValues] = useState({
    device_code: "",
    device_name: "",
    controller_id: "",
    device_type: controllertype === 1 ? 1 : "",
    order_by: "",
    order: ""
  });
  const FilterRef = useRef(null);
  FilterRef.current = Values;

  const [tankinputdata, settankinputdata] = useState({
    device_name: "",
    tank_height: "",
    low_limit: "",
    high_limit: "",
    latitude: "",
    longitude: "",
    low_limit_action: "",
    high_limit_action: "",
    status: 1
  });

  const [flowinputdata, setflowinputdata] = useState({
    device_name: "",
    usage_limit: "",
    usage_limit_action: "",
    latitude: "",
    longitude: "",
    daily_update: "",
    status: 1
  });

  const [valveinputdata, setvalveinputdata] = useState({
    device_name: "",
    latitude: "",
    longitude: "",
    status: 1
  });

  const [lightinputdata, setlightinputdata] = useState({
    device_name: "",
    dim: "",
    time1: "",
    time2: "",
    latitude: "",
    longitude: "",
    status: 1
  });

  const { items, page, size, total } = list;
  const itemsRef = useRef();
  itemsRef.current = items;

  // Motor cards come from Controller (list_controller), not Device
  // (Adminlistdevice) — motor is a controller_type, not a device_type,
  // so it needs its own list/state rather than living in `list`/`items`.
  const [motorList, setMotorList] = useState({});
  const { items: motorItems, page: motorPage, total: motorTotal } = motorList;
  const motorItemsRef = useRef();
  motorItemsRef.current = motorItems;

  const ListMotor = (motorPageNo = 1, filterData, silent = false) => {
    if (!silent) setloader(true);
    // include_untested=1: this grid (unlike the customer-facing Motor
    // Controllers list) needs to show controllers that haven't been
    // marked Tested Ok yet too, same as the Tank/Flow/Valve/Multi tabs
    // already do via list_device's status!=-1.
    // FIXED: the Filter modal's fields (device_name/controller_id/
    // device_code) were never forwarded here at all — the filter's
    // "Apply" button always called ListController (the Tank/Flow/Valve
    // device_list API) regardless of which tab was active, so applying
    // a filter on the Motor tab searched the wrong table entirely and
    // came back "no data found" even when a matching motor existed.
    // list_controller accepts these under different field names than
    // list_device does (controller_name/controller_code here vs
    // device_name/controller_id there).
    const filters = filterData || {};
    listcontrollerapi(
      JSONtoformdata({
        controller_type: 1,
        include_untested: 1,
        // JSONtoformdata only skips "" — an unset filterData field is
        // undefined, not "", and would otherwise get sent through as
        // the literal string "undefined" (matching nothing server-side).
        controller_name: filters.device_name || "",
        controller_code: filters.controller_id || "",
        device_code: filters.device_code || ""
      }),
      motorPageNo
    )
      .then(({ data }) => {
        const items = data?.items || [];
        const codes = items
          .filter((ele) => ele?.status !== 1 && ele?.controller_code)
          .map((ele) => ele.controller_code);

        if (!codes.length) {
          setMotorList(data);
          return;
        }

        // FIXED: setting the raw list here, then merging live-preview
        // values into it a beat later (the old two-step flow) meant
        // every 15s refresh visibly flashed unapproved motors to their
        // real (empty, pre-approval) DB values for a moment before the
        // preview overlay caught up — looked like the whole card
        // erased and redrew. Merging first means the screen only ever
        // sees the final, already-correct values.
        lastReceivedDataBatch(codes)
          .then(({ data: resp }) => {
            const previews = resp?.previews || {};
            const mergedItems = items.map((ele) => {
              const preview = ele?.controller_code && previews[ele.controller_code];
              return preview && ele?.status !== 1 ? { ...ele, ...preview } : ele;
            });
            setMotorList({ ...data, items: mergedItems });
          })
          .catch(() => setMotorList(data));
      })
      .catch(() => {
        if (!silent) toast("Something went wrong!!", { type: "error" });
      })
      .finally(() => {
        if (!silent) setloader(false);
      });
  };

  // Same idea as fetchBatchPreview below, but for motor controllers —
  // separate because they live in motorList/controller_code, not
  // list/device_code.
  const fetchMotorBatchPreview = (itemsOverride) => {
    const sourceItems = itemsOverride || motorItemsRef.current || [];
    const codes = sourceItems
      .filter((ele) => ele?.status !== 1 && ele?.controller_code)
      .map((ele) => ele.controller_code);
    if (!codes.length) return;

    lastReceivedDataBatch(codes)
      .then(({ data: resp }) => {
        const previews = resp?.previews;
        if (!previews || !Object.keys(previews).length) return;

        setMotorList((prevList) => {
          if (!prevList?.items) return prevList;
          const mergedItems = prevList.items.map((ele) => {
            const preview = ele?.controller_code && previews[ele.controller_code];
            if (!preview || ele?.status === 1) return ele;
            return { ...ele, ...preview };
          });
          return { ...prevList, items: mergedItems };
        });
      })
      .catch(() => {});
  };

  const [pageSize, setpageSize] = useState(10);
  const [pageind, setPageInd] = useState(0);

  // Live preview for unapproved cards — same idea as the production-tester
  // screen's per-device "last received data" (ProductionControllerDetails.js),
  // but batched: this screen shows a whole PAGE of cards at once (up to 12
  // here), so one call covering every code on screen replaces what would
  // otherwise be one HTTP request per card, per poll. Only fills fields
  // that are still empty/placeholder AND only on cards that aren't
  // Tested Ok yet — real approved data is never touched, matching the
  // exact same safety rule the tester screen uses.
  const fetchBatchPreview = (itemsOverride) => {
    // itemsOverride lets ListController's own .then() pass the just-
    // fetched page straight in — itemsRef.current wouldn't be updated
    // yet at that point (setlist() is async; the ref only catches up on
    // the next render), so relying on it there would fetch previews for
    // the PREVIOUS page instead of the one that just loaded.
    const sourceItems = itemsOverride || itemsRef.current || [];
    const codes = sourceItems
      .filter((ele) => ele?.status !== 1 && ele?.device_code)
      .map((ele) => ele.device_code);
    if (!codes.length) return;

    lastReceivedDataBatch(codes)
      .then(({ data: resp }) => {
        const previews = resp?.previews;
        if (!previews || !Object.keys(previews).length) return;

        setlist((prevList) => {
          if (!prevList?.items) return prevList;
          const mergedItems = prevList.items.map((ele) => {
            const preview = ele?.device_code && previews[ele.device_code];
            if (!preview || ele?.status === 1) return ele;
            return { ...ele, ...preview };
          });
          return { ...prevList, items: mergedItems };
        });
      })
      .catch(() => {
        // A failed batch check just leaves cards showing whatever they
        // already had — never treat this as "no data" the way a single
        // missing field would (same reasoning as the tester screen's
        // FETCH_ERROR handling).
      });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBatchPreview();
      fetchMotorBatchPreview();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const ResetForm = () => {
    // ListController(1, pageSize, value, true);
    // setPageInd(0);
    setValues({
      device_code: "",
      device_name: "",
      controller_id: "",
      device_type: Values?.device_type || 1,
      order_by: "",
      order: ""
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    let FinalFilters =
      controllertype === 1
        ? {
            ...DeviceFilter?.values,
            device_type: DeviceFilter?.values?.device_type || 1
          }
        : DeviceFilter?.values;

    // FIXED: this always re-fetched the device list (Tank/Flow/Valve/
    // Multi) on mount, even when coming back to the Motor tab (device_
    // type 6) — the tab bar itself would show Motor as active (it reads
    // Values.device_type), but motorItems was never populated, so it
    // rendered "no data found" until the user switched tabs manually.
    if (FinalFilters?.device_type === 6) {
      setValues((pre) => ({ ...pre, ...FinalFilters }));
      ListMotor(DeviceFilter?.page || 1);
    } else {
      ListController(
        DeviceFilter?.page || 1,
        12,
        FinalFilters || FilterRef.current
      );
      setValues((pre) => (DeviceFilter?.values ? FinalFilters : pre));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // silent=true — this background refresh was calling setloader(true),
      // which shows the full-screen <Loader> overlay every 2 minutes and
      // briefly hides the whole grid (tank image included) behind it even
      // though only the percentage/fill level actually needed to update.
      ListController(list?.page || 1, list?.size || 12, undefined, false, true);
    }, 60000);
    return () => clearInterval(interval);
  }, [list?.page, list?.size]);

  // Motor had no equivalent of the above — approved (status=1) motors
  // never refreshed on their own; only the 15s preview poll ran, and
  // that only covers status!=1 (Waiting for Test) motors. Same 15s
  // cadence as that preview poll, so any motor's DB row (already kept
  // current by the MQTT listener as messages arrive) shows up on
  // screen quickly regardless of approval status.
  useEffect(() => {
    const interval = setInterval(() => {
      // silent=true — this poll runs in the background regardless of
      // which tab (Tank/Flow/Valve/Multi/Motor) is actually being
      // viewed, since they all live in this one mounted component. It
      // was calling setloader(true), which shows the shared <Loader>
      // overlay for every tab, not just Motor — e.g. flashing on top of
      // the Tank tab every 15s even though the user was never looking
      // at Motor cards at all.
      ListMotor(motorPage || 1, undefined, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [motorPage]);

  const ListController = (
    page = 1,
    size = 12,
    filterData,
    isreset = false,
    silent = false
  ) => {
    if (!silent) setloader(true);

    let finalObj = {
      controller_type: controllertype
    };

    const WithValues = !isreset
      ? Object.assign(
          finalObj,
          filterData ? filterData : { ...FilterRef.current }
        )
      : finalObj;

    Adminlistdevice(JSONtoformdata(WithValues), page, size)
      .then(({ data }) => {
        setlist(data);
        fetchBatchPreview(data?.items);
        if (!silent) {
          setFilterShow(false);
          if (!isreset && filterData) {
            setValues(filterData);
          }
        }
      })
      .catch((err) => {
        if (silent) return;
        // toast("something went wrong", { type: "error" });
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      })
      .finally(() => {
        if (!silent) setloader(false);
      });
  };

  const loadingspinner = (id, type, devicetype) => {
    ///loader
    //tank=1 , flow=2 ,valve=3 , light=4, multi=13
    if (type == 1 || type == 2 || type == 3 || type == 4 || type == 13) {
      setloading(true);
      setTimeout(() => {
        setloading(false);
      }, 3000);
      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", type == 13 ? devicetype : type);
      formData.append("request_type", 1);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            ListController();
          }, 5000);
        })
        .catch((err) => {});
    }
    ///loader end

    //settingloader
    //tank=5 , flow=6 ,valve=7 , light=8 ,multi=14
    else if (
      type === 5 ||
      type === 6 ||
      type === 7 ||
      type === 8 ||
      type === 14
    ) {
      setIsSettingLoading(true);
      setTimeout(() => {
        setIsSettingLoading(false);
      }, 3000);
      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", devicetype);
      formData.append("request_type", 2);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            ListController();
          }, 5000);
        })
        .catch((err) => {});
    }
    //settingloader end

    ///location
    //tank=9 , flow=10 ,valve=11 , light=12
    else if (
      type === 9 ||
      type === 10 ||
      type === 11 ||
      type === 12 ||
      type === 15
    ) {
      setIsLocation(true);
      setTimeout(() => {
        setIsLocation(false);
      }, 3000);
      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", devicetype);
      formData.append("request_type", 2);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            ListController();
          }, 5000);
        })
        .catch((err) => {});
    }
    //location end
  };

  // Motor refresh — motor lives in Controller, not Device, so it needs
  // controller_publish/refresh_data (buttonapi) instead of
  // device_publish/refresh_data (devicerefreshapi) that the other tabs use.
  // Same as Motorcontrolleron.js's own loadingspinner/Changebutton — kept
  // here rather than passed in from there, since this page's refresh
  // target is ListMotor (this tab's own paginated fetch), not that page's
  // setrefresh.
  const motorLoadingSpinner = (id, accesstype, devicetype) => {
    setMotorCardLoading(true);
    setTimeout(() => {
      setMotorCardLoading(false);
    }, 3000);
    setTimeout(() => {
      ListMotor(motorPage || 1);
    }, 5000);

    let formData = new FormData();
    if (devicetype) {
      formData.append("device_id", id);
      formData.append("device_type", devicetype);
      formData.append("request_type", 1);
      devicerefreshapi(formData)
        .then(({ data }) => {})
        .catch((err) => {});
    } else {
      formData.append("controller_id", id);
      formData.append("controller_type", 1);
      formData.append("request_type", 1);
      buttonapi(formData)
        .then(({ data }) => {})
        .catch((err) => {});
    }
  };

  const motorChangebutton = (id, togglestatus, accesstype, buttontype) => {
    if (motorButtonGreyId === id) return;
    if (accesstype === 3) return;

    setMotorButtonGreyId(id);

    let formData = new FormData();
    if (buttontype === 1) {
      formData.append("device_id", id);
      formData.append("device_type", 3);
    } else {
      formData.append("controller_id", id);
      formData.append("controller_type", 1);
    }
    formData.append("request_type", togglestatus ? 3 : 4);

    const apiCall = buttontype === 1 ? devicerefreshapi(formData) : buttonapi(formData);

    apiCall
      .then(() => {
        ListMotor(motorPage || 1);
        setTimeout(() => {
          setMotorButtonGreyId("");
        }, 5000);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.detail || "Unable to send command");
        setMotorButtonGreyId("");
      });
  };

  const Changebutton = (id, status, type) => {
    if (abortcontroller) {
      abortcontroller.abort("error cancelled");
    }

    abortcontroller = new AbortController();
    if (type === 3 || type === 4) {
      setButtonId(id);

      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", type);
      formData.append("request_type", status ? 3 : 4);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {
            ListController();
            setButtonId("");
          }, 5000);
        })
        .catch((err) => {});
    }
  };

  const UpdateDevie = (id, type) => {
    if (editDevice) {
      setloader(true);

      const Jsonvalues =
        type === 1
          ? tankinputdata
          : type === 2
          ? flowinputdata
          : type === 3
          ? valveinputdata
          : type === 4
          ? lightinputdata
          : null;

      EditDevice(id, Jsonvalues)
        .then((res) => {
          toast.success(res?.data);
          ListController();
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
    }
  };

  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };

  const latlong = (letters) => {
    var ch = String.fromCharCode(letters.which);

    if (!/[0-9.]/.test(ch)) {
      letters.preventDefault();
    }
  };

  const pageCount = Math.ceil(total / 12);
  const motorPageCount = Math.ceil(motorTotal / 12);
  const handlePageClick = (event) => {
    if (Values.device_type === 6) {
      ListMotor(JSON.parse(event.selected) + 1);
    } else {
      ListController(JSON.parse(event.selected) + 1);
    }
  };

  const stoppropagation = (touch) => {
    touch.stopPropagation();
  };

  const toView = (id) => {
    navigate("/dashboard/viewdevice", {
      state: {
        items: items,
        id: id,
        DeviceFilter: {
          page,
          values: Values
        }
      }
    });
  };

  // Motor cards use the exact same "View Device" page as Tank/Flow/Valve/
  // Multi — just flagged isController so ViewAdminDevice.js knows to fetch
  // by controller_id (view_controller) instead of device_id (view_device).
  const toViewMotor = (id) => {
    navigate("/dashboard/viewdevice", {
      state: {
        id: id,
        isController: true,
        DeviceFilter: {
          page: motorPage || 1,
          values: Values
        }
      }
    });
  };

  const Dataitems = [
    {
      key: 1,
      label: "Tank",
      children: ""
    },
    {
      key: 2,
      label: "Flow",
      children: ""
    },
    {
      key: 3,
      label: "Valve",
      children: ""
    },
    {
      key: 5,
      label: "Multi",
      children: ""
    },
    {
      key: 6,
      label: "Motor",
      children: ""
    }
  ];

  // FilterDevice.js's "Apply" button just calls GetList(1, 12, Values)
  // — this used to always be ListController, wrong table whenever the
  // Motor tab was active (see the FIXED note inside ListMotor above).
  const GetFilteredList = (page, size, filterData) => {
    if (filterData?.device_type === 6) {
      ListMotor(page, filterData);
    } else {
      ListController(page, size, filterData);
    }
  };

  return (
    <>
      <Loader isLoader={loader} />

      {filterShow && (
        <Filterdevice
          show={filterShow}
          close={() => {
            setFilterShow(false);
          }}
          setValues={setValues}
          Values={Values}
          GetList={GetFilteredList}
          Reset={ResetForm}
        />
      )}
      <div
        className={
          controllertype === 1 ? "motorbackground_images" : "background-images"
        }
      >
        <div className="router-pages">
          <div className={commonstyle.controller_head}>
            <div className="pre-page">
              <FaArrowLeft
                className="arrow total_head"
                onClick={() => navigate("/dashboard")}
              />

              <p className={`controller-name total_head`}>
                Device ({Values.device_type === 6 ? motorTotal || 0 : total})
              </p>
            </div>
            {Number(controllertype || "0") === 1 && (
              <div style={{ display: "flex", justifyItems: "center" }}>
                <CommonTabs
                  items={Dataitems}
                  onChange={(data) => {
                    setValues((pre) => ({ ...pre, device_type: data }));
                    if (data === 6) {
                      ListMotor(1);
                    } else {
                      let finalFilters = { ...Values, device_type: data };
                      ListController(1, 12, finalFilters);
                    }
                  }}
                  TablColors={{
                    itemColor: "#fff",
                    itemActiveColor: "#00ffff"
                  }}
                  activeKey={Values.device_type}
                />
              </div>
            )}
            <div className={commonstyle.cnt_buttons}>
              <img
                alt="FilterIcon"
                src={ExportedImages.FILTER_ICON}
                className={`${commonstyle.filter_icon} 
                ${commonstyle.outer_card_btn}`}
                onClick={() => {
                  setFilterShow(true);
                }}
              />

              <>
                {/* <button
                type="button"
                className={`${commonstyle.add_controller_btn} 
                    ${commonstyle.outer_card_btn}`}
                onClick={() => navigate("/dashboard/adddevice")}
              >
                Add Device
              </button> */}
              </>

              {/* <Link
                to="/dashboard/deletecontroller"
                state={{ ...location.state, pevpath: location?.pathname }}
              >
                {usertype === 3 ? null : (
                  <>
                    <FaTrashAlt className="icontrash" />
                  </>
                )}

                <br />
              </Link> */}
              <button
                type="button"
                className={`${commonstyle.delete_controller_btn} 
                    ${commonstyle.outer_card_btn}`}
                onClick={() =>
                  navigate("/dashboard/actions", {
                    state: {
                      DeviceFilter: {
                        page,
                        values: Values
                      }
                    }
                  })
                }
              >
                Delete
              </button>
            </div>
          </div>
          <div className="controller-bottom ">
            <div className="view-page">
              {Values.device_type === 6 ? (
                motorItems?.length > 0 ? (
                  <div
                    className={`${devicestyle.total_device} ${devicestyle.motor_list_grid}`}
                  >
                    {motorItems.map((ele, index) => (
                      <MotorControllerCard
                        key={index}
                        motoron={ele}
                        index={index}
                        isloading={motorCardLoading}
                        motorindex={motorLoadingIndex}
                        setindex={setMotorLoadingIndex}
                        loadingspinner={motorLoadingSpinner}
                        Changebutton={motorChangebutton}
                        buttongreyid={motorButtonGreyId}
                        usertype={usertype}
                        openNotification={() => {}}
                        valvebuttontype={1}
                        onCardClick={() => toViewMotor(ele.controller_id)}
                        showDeviceMeta
                      />
                    ))}
                  </div>
                ) : (
                  <p className="view-msg">no data found</p>
                )
              ) : items?.length > 0 ? (
                <div className={devicestyle.total_device}>
                  {items.map((ele, index) => {
                    return (
                      <>
                        {ele?.device_type === 1 && controllertype === 1 ? (
                          <div
                            className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                    ${commonstyle.cards_padding} new-details tank-bgcolor`}
                            key={index}
                            onClick={() => toView(ele.device_id)}
                          >
                            <div className={devicestyle.tank_level}>
                              <div className="motor-level">
                                <div className="inputWidth" style={{ minWidth: 0 }}>
                                  {editDevice && deviceId === ele.device_id ? (
                                    <input
                                      autoFocus
                                      key={tankinputdata.device_name}
                                      type="text"
                                      className={devicestyle.device_name_input}
                                      onClick={(e) => {
                                        settankinputdata((pre) => ({
                                          ...pre,
                                          device_name: e.target.value
                                        }));
                                      }}
                                      value={tankinputdata.device_name}
                                    />
                                  ) : (
                                    <OverlayTrigger
                                      key="top"
                                      placement="top"
                                      overlay={
                                        <Tooltip id="tooltip-top">
                                          <strong>{ele?.device_name}</strong>
                                        </Tooltip>
                                      }
                                    >
                                      <p
                                        className={`${devicestyle.device_name} ${devicestyle.device_name_tank_col}`}
                                      >
                                        {ele?.device_name}
                                      </p>
                                    </OverlayTrigger>
                                  )}
                                </div>

                                {ele?.tower ? (
                                  <>
                                    <img
                                      src={
                                        ele?.tower >= 20 && ele?.tower <= 39
                                          ? ExportedImages.TOWER_ICON1
                                          : ele?.tower >= 40 && ele?.tower <= 59
                                          ? ExportedImages.TOWER_ICON2
                                          : ele?.tower >= 60 && ele?.tower <= 79
                                          ? ExportedImages.TOWER_ICON3
                                          : ele?.tower >= 80 && ele?.tower <= 99
                                          ? ExportedImages.TOWER_ICON4
                                          : ele?.tower === 100
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
                                      {ele?.tower}%
                                    </p>{" "}
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
                                {ele?.device_time ? (
                                  <p className="tank-date">
                                    {ele?.device_time}
                                  </p>
                                ) : null}
                                {/* <img
                                src={
                                  editDevice && deviceId == ele.device_id
                                    ? save
                                    : !editDevice
                                    ? edit
                                    : null
                                }
                                onClick={(e) => {
                                  setEditDevice(!editDevice);
                                  setDeviceId(ele.device_id);
                                  UpdateDevie(ele.device_id, ele.device_type);
                                  settankinputdata({
                                    ...tankinputdata,
                                    device_name: ele.device_name,
                                    tank_height: ele.tank_height,
                                    high_limit: ele.high_limit,
                                    low_limit: ele.low_limit,
                                    latitude: ele.latitude,
                                    longitude: ele.longitude,
                                    high_limit_action: ele.high_limit_action,
                                    low_limit_action: ele.low_limit_action,
                                  });
                                }}
                              /> */}
                              </div>
                            </div>

                            <div className="tank-level-data">
                              <p className={commonstyle.margin_zero}>
                                <span className="tank-header">ID - </span>
                                <span className="tank-date">
                                  {" "}
                                  {ele.device_code}{" "}
                                </span>
                              </p>

                              {ele.device_id === loaderId && isloading ? (
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
                                  onClick={(e) => {
                                    stoppropagation(e);

                                    loadingspinner(
                                      ele.device_id,
                                      ele.device_type ///1 tank
                                    );
                                    setLoaderId(ele.device_id);
                                  }}
                                />
                              )}

                              <div className="btnWidth">
                                <button
                                  type="button"
                                  className="settings-btn"
                                  onClick={(e) => {
                                    stoppropagation(e);

                                    loadingspinner(
                                      ele.device_id,
                                      5,
                                      ele.device_type
                                    ); //setting loader tank
                                    setSettingLoaderId(ele.device_id);
                                  }}
                                >
                                  {settingLoaderId === ele.device_id &&
                                  isSettingLoading ? (
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

                            <div className="sub-details">
                              <div className="sub-details w60">
                                <div className="w-40 detailsflex">
                                  <p className="input_width">
                                    <span
                                      className="tank-header"
                                      // id={ele?.indication === 1 ? "limitblink" : null}
                                    >
                                      High Limit -{" "}
                                    </span>
                                    {ele.device_id === deviceId &&
                                    editDevice ? (
                                      <input
                                        autoFocus
                                        key={tankinputdata?.high_limit}
                                        type="text"
                                        maxLength={10}
                                        onKeyPress={avoidletters}
                                        className={
                                          editDevice &&
                                          ele.device_id === deviceId
                                            ? "location"
                                            : "devicebg tank-date"
                                        }
                                        onChange={(e) => {
                                          settankinputdata({
                                            ...tankinputdata,
                                            high_limit: e.target.value
                                          });
                                        }}
                                        value={tankinputdata?.high_limit}
                                      />
                                    ) : (
                                      <span className="tank-date">
                                        {ele?.high_limit}
                                      </span>
                                    )}
                                    &nbsp;&nbsp;
                                    {ele.device_id === deviceId &&
                                    editDevice ? (
                                      <select
                                        className={
                                          ele.device_id === deviceId &&
                                          editDevice
                                            ? "location"
                                            : "devicebg"
                                        }
                                        onClick={(e) => {
                                          settankinputdata({
                                            ...tankinputdata,
                                            high_limit_action: JSON.parse(
                                              e.target.value
                                            )
                                          });
                                        }}
                                      >
                                        <option
                                          value="0"
                                          selected={
                                            ele?.high_limit_action === 0
                                              ? true
                                              : false
                                          }
                                        >
                                          No Action
                                        </option>
                                        <option
                                          value="1"
                                          selected={
                                            ele?.high_limit_action === 1
                                              ? true
                                              : false
                                          }
                                        >
                                          Off Motor
                                        </option>
                                        <option
                                          value="2"
                                          selected={
                                            ele?.high_limit_action === 2
                                              ? true
                                              : false
                                          }
                                        >
                                          On Motor
                                        </option>
                                      </select>
                                    ) : (
                                      <span className="tank-date">
                                        {ele?.high_limit_action === 0
                                          ? "No action"
                                          : ele?.high_limit_action === 1
                                          ? "Off Motor"
                                          : ele?.high_limit_action === 2
                                          ? "On Motor"
                                          : null}
                                      </span>
                                    )}
                                  </p>
                                  <p className=" input_width">
                                    <span
                                      className={
                                        ele.device_id === deviceId && editDevice
                                          ? "on_edit"
                                          : "tank-header"
                                      }
                                      // id={ele?.indication === 2 ? "limitblink" : null}
                                    >
                                      Low Limit -
                                    </span>
                                    {ele.device_id === deviceId &&
                                    editDevice ? (
                                      <input
                                        type="text"
                                        maxLength={10}
                                        onKeyPress={avoidletters}
                                        className={
                                          editDevice &&
                                          ele.device_id === deviceId
                                            ? "location"
                                            : "devicebg"
                                        }
                                        onChange={(e) => {
                                          settankinputdata({
                                            ...tankinputdata,
                                            low_limit: e.target.value
                                          });
                                        }}
                                        value={tankinputdata?.low_limit}
                                      />
                                    ) : (
                                      <span className="tank-date">
                                        {ele?.low_limit}
                                      </span>
                                    )}
                                    &nbsp;&nbsp;
                                    {ele.device_id === deviceId &&
                                    editDevice ? (
                                      <select
                                        className={
                                          ele.device_id === deviceId &&
                                          editDevice
                                            ? "location"
                                            : "devicebg"
                                        }
                                        onClick={(e) => {
                                          settankinputdata({
                                            ...tankinputdata,
                                            low_limit_action: JSON.parse(
                                              e.target.value
                                            )
                                          });
                                        }}
                                      >
                                        <option
                                          value="0"
                                          selected={
                                            ele?.low_limit_action === 0
                                              ? true
                                              : false
                                          }
                                        >
                                          No Action
                                        </option>
                                        <option
                                          value="1"
                                          selected={
                                            ele?.low_limit_action === 1
                                              ? true
                                              : false
                                          }
                                        >
                                          Off Motor
                                        </option>
                                        <option
                                          value="2"
                                          selected={
                                            ele?.low_limit_action === 2
                                              ? true
                                              : false
                                          }
                                        >
                                          On Motor
                                        </option>
                                      </select>
                                    ) : (
                                      <span className="tank-date">
                                        {ele?.low_limit_action === 0
                                          ? "No action"
                                          : ele?.low_limit_action === 1
                                          ? "Off Motor"
                                          : ele?.low_limit_action === 2
                                          ? "On Motor"
                                          : null}
                                      </span>
                                    )}
                                  </p>

                                  <p>
                                    <span className="tank-header">
                                      Tank Height -{" "}
                                    </span>
                                    {editDevice &&
                                    deviceId === ele.device_id ? (
                                      <input
                                        type="text"
                                        maxLength={10}
                                        onKeyPress={(e) => avoidletters(e)}
                                        className={
                                          editDevice &&
                                          deviceId === ele.device_id
                                            ? "location"
                                            : "devicebg"
                                        }
                                        onChange={(e) => {
                                          settankinputdata({
                                            ...tankinputdata,
                                            tank_height: e.target.value
                                          });
                                        }}
                                        value={tankinputdata?.tank_height}
                                      />
                                    ) : (
                                      <span className="tank-date">
                                        {ele?.tank_height}
                                      </span>
                                    )}
                                    <span className="tank-date"> ft</span>
                                  </p>

                                  <p>
                                    <span className="tank-header">
                                      Location
                                    </span>
                                    &nbsp;
                                    {LocationId === ele.device_id &&
                                    isLocation ? (
                                      <MdLocationOn className={"locateapi"} />
                                    ) : (
                                      <MdLocationOn
                                        className="locate"
                                        onClick={(e) => {
                                          stoppropagation(e);
                                          setLocationId(ele.device_id);
                                          loadingspinner(
                                            ele.device_id,
                                            9,
                                            ele.device_type
                                          ); //location tank
                                        }}
                                      />
                                    )}
                                    {deviceId === ele.device_id &&
                                    editDevice ? (
                                      <span className="d-inline-table">
                                        <div className="latlan">
                                          Lat-
                                          <input
                                            type="text"
                                            onKeyPress={latlong}
                                            maxLength={10}
                                            className={
                                              editDevice &&
                                              ele.device_id === deviceId
                                                ? "location"
                                                : "devicebg"
                                            }
                                            onChange={(e) => {
                                              settankinputdata({
                                                ...tankinputdata,
                                                latitude: e.target.value
                                              });
                                            }}
                                            value={tankinputdata?.latitude}
                                          />
                                          'N
                                        </div>
                                        <div className="latlan">
                                          Long-
                                          <input
                                            type="text"
                                            onKeyPress={latlong}
                                            maxLength={10}
                                            className={
                                              editDevice &&
                                              ele.device_id === deviceId
                                                ? "location"
                                                : "devicebg"
                                            }
                                            onChange={(e) => {
                                              settankinputdata({
                                                ...tankinputdata,
                                                longitude: e.target.value
                                              });
                                            }}
                                            value={tankinputdata?.longitude}
                                          />
                                          'E
                                        </div>
                                      </span>
                                    ) : (
                                      <p className="tank-header">
                                        Lat-
                                        <span className="tank-date">
                                          {ele.latitude === ""
                                            ? null
                                            : `${ele?.latitude} 'N`}
                                        </span>
                                        <br />
                                        Long-
                                        <span className="tank-date">
                                          {ele.longitude === ""
                                            ? null
                                            : `${ele?.longitude} 'E`}
                                        </span>
                                      </p>
                                    )}
                                  </p>

                                  <p>
                                    <span className="tank-header">
                                      Water Quality
                                    </span>
                                    <span className="tank-date">
                                      - {ele?.source === 1 ? "TDS" : "EB"}
                                    </span>
                                  </p>
                                  {ele?.source === 1 ? (
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
                                          - {ele?.battery}
                                        </span>
                                      </p>

                                      <p>
                                        <span className="tank-header">PH</span>
                                        <span className="tank-date">
                                          - {ele?.solar_panel}
                                        </span>
                                      </p>
                                    </div>
                                  ) : null}

                                  <p>
                                    <span className="tank-header">
                                      Hardware Version -{" "}
                                    </span>
                                    <span className="tank-date">
                                      {ele?.hardware_version}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="tank-header">
                                      Software Version -{" "}
                                    </span>
                                    <span className="tank-date">
                                      {ele?.software_version}
                                    </span>
                                  </p>
                                  {ele?.status != null ? (
                                    <p>
                                      <span className="tank-header">
                                        status&nbsp;:&nbsp;
                                      </span>
                                      <span
                                        className={
                                          ele?.status === -1
                                            ? productionstyle.production_status_deleted
                                            : ele?.status === 0
                                            ? productionstyle.production_status_inactive
                                            : ele?.status === 1
                                            ? productionstyle.production_status_on
                                            : ele?.status === 2
                                            ? productionstyle.production_status_waiting
                                            : ele?.status === 3
                                            ? productionstyle.production_status_off
                                            : null
                                        }
                                      >
                                        {ele?.status === -1
                                          ? "Deleted"
                                          : ele?.status === 0
                                          ? "In Active"
                                          : ele?.status === 1
                                          ? "Tested Ok"
                                          : ele?.status === 2
                                          ? "Waiting for Test"
                                          : ele?.status === 3
                                          ? "Fault"
                                          : null}
                                      </span>
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              <div className="detailstank">
                                {ele?.tank_level !== null ? (
                                  <>
                                    <p
                                      className="waterper"
                                      style={{
                                        top: "27%",
                                        right: 0,
                                        fontSize: 20
                                      }}
                                    >
                                      {ele?.tank_level !== null
                                        ? `${Number(ele?.tank_level)}%`
                                        : null}
                                    </p>
                                    {ele?.tank_level >= 1 &&
                                    ele?.tank_level <= 10 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_10_GIF}
                                      />
                                    ) : ele?.tank_level > 10 &&
                                      ele?.tank_level <= 20 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_20_GIF}
                                      />
                                    ) : ele?.tank_level > 20 &&
                                      ele?.tank_level <= 30 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_30_GIF}
                                      />
                                    ) : ele?.tank_level > 30 &&
                                      ele?.tank_level <= 40 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_40_GIF}
                                      />
                                    ) : ele?.tank_level > 40 &&
                                      ele?.tank_level <= 60 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_50_GIF}
                                      />
                                    ) : ele?.tank_level > 60 &&
                                      ele?.tank_level <= 70 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_60_GIF}
                                      />
                                    ) : ele?.tank_level > 70 &&
                                      ele?.tank_level <= 80 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_70_GIF}
                                      />
                                    ) : ele?.tank_level > 80 &&
                                      ele?.tank_level <= 90 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_80_GIF}
                                      />
                                    ) : ele?.tank_level > 90 &&
                                      ele?.tank_level <= 95 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_90_GIF}
                                      />
                                    ) : ele?.tank_level > 95 &&
                                      ele?.tank_level <= 100 ? (
                                      <img
                                        src={ExportedImages.WATER_TANK_100_GIF}
                                      />
                                    ) : (
                                      <img
                                        src={ExportedImages.EMPTY_WATER_TANK}
                                      />
                                    )}
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : ele?.device_type === 2 && controllertype === 1 ? (
                          <div
                            className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                    ${commonstyle.cards_padding} new-details flow-bgcolor`}
                            key={index}
                            onClick={() => toView(ele.device_id)}
                          >
                            <div className={devicestyle.tank_level}>
                              <div className="motor-level">
                                <div className="inputWidth" style={{ minWidth: 0 }}>
                                  {editDevice && deviceId === ele.device_id ? (
                                    <input
                                      type="text"
                                      maxLength={50}
                                      className={devicestyle.device_name_input}
                                      onChange={(e) => {
                                        setflowinputdata({
                                          ...flowinputdata,
                                          device_name: e.target.value
                                        });
                                      }}
                                      value={flowinputdata.device_name}
                                    />
                                  ) : (
                                    <OverlayTrigger
                                      key="top"
                                      placement="top"
                                      overlay={
                                        <Tooltip id="tooltip-top">
                                          <strong>{ele.device_name}</strong>
                                        </Tooltip>
                                      }
                                    >
                                      <p
                                        className={`${devicestyle.device_name} 
                              ${devicestyle.device_name_flow_col}`}
                                      >
                                        {ele.device_name}
                                      </p>
                                    </OverlayTrigger>
                                  )}
                                </div>

                                {ele?.tower ? (
                                  <>
                                    <img
                                      src={
                                        ele?.tower >= 20 && ele?.tower <= 39
                                          ? ExportedImages.TOWER_ICON1
                                          : ele?.tower >= 40 && ele?.tower <= 59
                                          ? ExportedImages.TOWER_ICON2
                                          : ele?.tower >= 60 && ele?.tower <= 79
                                          ? ExportedImages.TOWER_ICON3
                                          : ele?.tower >= 80 && ele?.tower <= 99
                                          ? ExportedImages.TOWER_ICON4
                                          : ele?.tower === 100
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
                                      {ele?.tower}%
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
                                {ele?.device_time ? (
                                  <p className="tank-date">
                                    {ele?.device_time}
                                  </p>
                                ) : null}
                                {/* <img
                                src={
                                  editDevice && deviceId == ele.device_id
                                    ? save
                                    : !editDevice
                                    ? edit
                                    : null
                                }
                                onClick={(e) => {
                                  setEditDevice(!editDevice);
                                  setDeviceId(ele.device_id);
                                  UpdateDevie(ele.device_id, ele.device_type);

                                  setflowinputdata({
                                    ...flowinputdata,
                                    device_name: ele.device_name,
                                    usage_limit: ele.usage_limit,
                                    usage_limit_action: ele.usage_limit_action,
                                    latitude: ele.latitude,
                                    longitude: ele.longitude,
                                    daily_update: ele.daily_update,
                                  });
                                }}
                              /> */}
                              </div>
                            </div>

                            <div className="tank-level-data">
                              <p className="tank-usage">
                                <span className="tank-header">ID - </span>
                                <span className="tank-date">
                                  {ele.device_code}
                                </span>
                              </p>

                              {ele.device_id === loaderId && isloading ? (
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
                                  onClick={(e) => {
                                    stoppropagation(e);

                                    loadingspinner(
                                      ele.device_id,
                                      ele.device_type //2 flow loader
                                    );
                                    setLoaderId(ele.device_id);
                                  }}
                                />
                              )}

                              <p className="tank-usage">
                                <span className="tank-header">
                                  UsageLimit -{" "}
                                </span>
                                {editDevice && ele.device_id === deviceId ? (
                                  <input
                                    type="text"
                                    className={
                                      editDevice && ele.device_id === deviceId
                                        ? "location"
                                        : "devicebg"
                                    }
                                    onChange={(e) => {
                                      setflowinputdata({
                                        ...flowinputdata,
                                        usage_limit: e.target.value
                                      });
                                    }}
                                    value={flowinputdata?.usage_limit}
                                  />
                                ) : (
                                  <span className="tank-date">
                                    {ele?.usage_limit}
                                  </span>
                                )}
                                &nbsp;&nbsp;
                                {editDevice && ele.device_id === deviceId ? (
                                  <br />
                                ) : null}
                                {editDevice && ele.device_id === deviceId ? (
                                  <select
                                    className={
                                      editDevice && ele.device_id === deviceId
                                        ? "usagelimit_width"
                                        : "devicebg"
                                    }
                                    onClick={(e) => {
                                      setflowinputdata({
                                        ...flowinputdata,
                                        usage_limit_action: JSON.parse(
                                          e.target.value
                                        )
                                      });
                                    }}
                                  >
                                    <option
                                      value="0"
                                      selected={
                                        ele?.usage_limit_action === 0
                                          ? true
                                          : false
                                      }
                                    >
                                      No action
                                    </option>
                                    <option
                                      value="1"
                                      selected={
                                        ele?.usage_limit_action === 1
                                          ? true
                                          : false
                                      }
                                    >
                                      off Motor
                                    </option>
                                  </select>
                                ) : (
                                  <span className="tank-date">
                                    {ele.usage_limit_action === 1
                                      ? "Off Motor"
                                      : ele.usage_limit_action === 0
                                      ? "No Action"
                                      : ""}
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="sub-details mt-2">
                              <div className="flex-data">
                                <p className="tank-usage">
                                  <span className="tank-header">
                                    Total usage -{" "}
                                  </span>
                                  <span className="tank-date">
                                    {ele.total_usage}
                                  </span>{" "}
                                </p>
                                <p className="tank-usage">
                                  <span className="tank-header">
                                    Daily Usage -{" "}
                                  </span>
                                  <span className="tank-date">
                                    {ele.today_usage}{(ele.today_usage ?? "") !== "" ? " kL" : ""}
                                  </span>{" "}
                                </p>
                                <p className="tank-usage new-index">
                                  <span className="tank-header">Location </span>
                                  {LocationId === ele.device_id &&
                                  isLocation ? (
                                    <MdLocationOn className={"locateapi"} />
                                  ) : (
                                    <MdLocationOn
                                      className="locate"
                                      onClick={(e) => {
                                        stoppropagation(e);

                                        setLocationId(ele.device_id);
                                        loadingspinner(
                                          ele.device_id,
                                          10,
                                          ele.device_type
                                        ); ///flow location
                                      }}
                                    />
                                  )}
                                  &nbsp;
                                  {deviceId === ele.device_id && editDevice ? (
                                    <span className="d-inline-table">
                                      <div className="latlan">
                                        Lat-
                                        <input
                                          type="text"
                                          onKeyPress={latlong}
                                          maxLength={10}
                                          className={
                                            editDevice &&
                                            ele.device_id === deviceId
                                              ? "location"
                                              : "devicebg"
                                          }
                                          onChange={(e) => {
                                            setflowinputdata({
                                              ...flowinputdata,
                                              latitude: e.target.value
                                            });
                                          }}
                                          value={flowinputdata?.latitude}
                                        />
                                        'N
                                      </div>
                                      <div className="latlan">
                                        Long-
                                        <input
                                          type="text"
                                          onKeyPress={latlong}
                                          maxLength={10}
                                          className={
                                            editDevice &&
                                            ele.device_id === deviceId
                                              ? "location"
                                              : "devicebg"
                                          }
                                          onChange={(e) => {
                                            setflowinputdata({
                                              ...flowinputdata,
                                              longitude: e.target.value
                                            });
                                          }}
                                          value={flowinputdata?.longitude}
                                        />
                                        'E
                                      </div>
                                    </span>
                                  ) : (
                                    <p className="tank-header">
                                      Lat-
                                      <span className="tank-date">
                                        {ele.latitude === ""
                                          ? null
                                          : `${ele?.latitude} 'N`}
                                      </span>
                                      <br />
                                      Long-
                                      <span className="tank-date">
                                        {ele.longitude === ""
                                          ? null
                                          : `${ele?.longitude} 'E`}
                                      </span>
                                    </p>
                                  )}
                                </p>
                                <p className="tank-usage">
                                  <span className="tank-header">Source - </span>
                                  <span className="tank-date">
                                    {" "}
                                    {ele?.source === 1 ? "Battery" : "EB"}
                                  </span>
                                </p>

                                {ele?.source === 1 ? (
                                  <p className="tank-usage">
                                    <span className="tank-header">
                                      Battery -{" "}
                                    </span>
                                    <span className="tank-date">
                                      {" "}
                                      {ele.battery}{" "}
                                    </span>
                                  </p>
                                ) : null}
                                {ele?.source === 1 ? (
                                  <p className="tank-usage">
                                    <span className="tank-header">
                                      Solar Panel -{" "}
                                    </span>
                                    <span className="tank-date">
                                      {ele.solar_panel}
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
                                    {ele.flow_rate}
                                  </span>
                                </p>

                                <p className="tank-usage">
                                  <span className="tank-header">
                                    Daily Update -{" "}
                                  </span>
                                  {ele.device_id === deviceId && editDevice ? (
                                    <input
                                      type="text"
                                      maxLength={4}
                                      onKeyPress={avoidletters}
                                      className={
                                        ele.device_id === deviceId && editDevice
                                          ? "location"
                                          : "devicebg"
                                      }
                                      value={flowinputdata.daily_update}
                                      onChange={(e) => {
                                        setflowinputdata({
                                          ...flowinputdata,
                                          daily_update: e.target.value
                                        });
                                      }}
                                    />
                                  ) : (
                                    <span className="tank-date">
                                      {ele.daily_update == null
                                        ? null
                                        : ele.daily_update}
                                    </span>
                                  )}
                                </p>
                                <p className="tank-usage">
                                  <span className="tank-header">
                                    Hardware Version -{" "}
                                  </span>
                                  <span className="tank-date">
                                    {" "}
                                    {ele?.hardware_version}
                                  </span>
                                </p>

                                <p className="tank-usage">
                                  <span className="tank-header">
                                    Software Version -{" "}
                                  </span>
                                  <span className="tank-date">
                                    {" "}
                                    {ele?.software_version}
                                  </span>
                                </p>

                                <div className="d-flex justify-content-end">
                                  <button
                                    type="button"
                                    className="settings-btn mb-2"
                                    onClick={(e) => {
                                      stoppropagation(e);

                                      loadingspinner(
                                        ele.device_id,
                                        6,
                                        ele.device_type
                                      ); //flow settings loader
                                      setSettingLoaderId(ele.device_id);
                                    }}
                                  >
                                    {settingLoaderId === ele.device_id &&
                                    isSettingLoading ? (
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
                                    {" "}
                                    {ele.lt_per_pulse}
                                  </span>
                                </p>

                                {ele?.status != null ? (
                                  <p>
                                    <span className="tank-header">
                                      status&nbsp;:&nbsp;
                                    </span>
                                    <span
                                      className={
                                        ele?.status === -1
                                          ? productionstyle.production_status_deleted
                                          : ele?.status === 0
                                          ? productionstyle.production_status_inactive
                                          : ele?.status === 1
                                          ? productionstyle.production_status_on
                                          : ele?.status === 2
                                          ? productionstyle.production_status_waiting
                                          : ele?.status === 3
                                          ? productionstyle.production_status_off
                                          : null
                                      }
                                    >
                                      {ele?.status === -1
                                        ? "Deleted"
                                        : ele?.status === 0
                                        ? "In Active"
                                        : ele?.status === 1
                                        ? "Tested Ok"
                                        : ele?.status === 2
                                        ? "Waiting for Test"
                                        : ele?.status === 3
                                        ? "Fault"
                                        : null}
                                    </span>
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            {/* <div className="sub-details mb-2"></div> */}
                          </div>
                        ) : ele?.device_type === 3 && controllertype === 1 ? (
                          <div
                            className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                    ${commonstyle.cards_padding} new-details value-bgcolor`}
                            key={index}
                            onClick={() => toView(ele.device_id)}
                          >
                            <div className={devicestyle.tank_level}>
                              <div className="motor-level">
                                <div className="inputWidth" style={{ minWidth: 0 }}>
                                  {editDevice && deviceId === ele.device_id ? (
                                    <input
                                      type="text"
                                      maxLength={50}
                                      className={devicestyle.device_name_input}
                                      onChange={(e) => {
                                        setvalveinputdata({
                                          ...valveinputdata,
                                          device_name: e.target.value
                                        });
                                      }}
                                      value={valveinputdata.device_name}
                                    />
                                  ) : (
                                    <OverlayTrigger
                                      key="top"
                                      placement="top"
                                      overlay={
                                        <Tooltip id="tooltip-top">
                                          <strong>{ele.device_name}</strong>
                                        </Tooltip>
                                      }
                                    >
                                      <p
                                        className={`${devicestyle.device_name} ${devicestyle.device_name_valve_col}`}
                                      >
                                        {ele.device_name}
                                      </p>
                                    </OverlayTrigger>
                                  )}
                                </div>

                                {ele?.tower ? (
                                  <>
                                    {" "}
                                    <img
                                      src={
                                        ele?.tower >= 20 && ele?.tower <= 39
                                          ? ExportedImages.TOWER_ICON1
                                          : ele?.tower >= 40 && ele?.tower <= 59
                                          ? ExportedImages.TOWER_ICON2
                                          : ele?.tower >= 60 && ele?.tower <= 79
                                          ? ExportedImages.TOWER_ICON3
                                          : ele?.tower >= 80 && ele?.tower <= 99
                                          ? ExportedImages.TOWER_ICON4
                                          : ele?.tower === 100
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
                                      {ele?.tower}%
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
                                {ele?.device_time ? (
                                  <p className="tank-date">
                                    {ele?.device_time}
                                  </p>
                                ) : null}
                                {/* <img
                                src={
                                  editDevice && deviceId == ele.device_id
                                    ? save
                                    : !editDevice
                                    ? edit
                                    : null
                                }
                                onClick={(e) => {
                                  setEditDevice(!editDevice);
                                  setDeviceId(ele.device_id);
                                  UpdateDevie(ele.device_id, ele.device_type);

                                  setvalveinputdata({
                                    ...valveinputdata,
                                    device_name: ele.device_name,
                                    latitude: ele.latitude,
                                    longitude: ele.longitude,
                                  });
                                }}
                              /> */}
                              </div>
                            </div>

                            <div className="tank-level-data">
                              <p className="tank-usage">
                                <span className="tank-header">ID - </span>
                                <span className="tank-date">
                                  {ele.device_code}
                                </span>
                              </p>

                              {ele.device_id === loaderId && isloading ? (
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
                                  className="tanpkinner"
                                  onClick={(e) => {
                                    stoppropagation(e);

                                    loadingspinner(
                                      ele.device_id,
                                      ele.device_type ///3 valve loader
                                    );
                                    setLoaderId(ele.device_id);
                                  }}
                                />
                              )}
                              <div className="valvebuttonflex">
                                <p className="tank-header">{ele.operated_by}</p>

                                {ele.device_id === ButtonId ? (
                                  <CommonSwitch
                                    color={"grey"}
                                    type={3}
                                    checked={
                                      ele.valve_status === 1 ? true : false
                                    }
                                    onChange={({ status }) => {
                                      Changebutton(ele.device_id, status, 3);
                                    }}
                                  />
                                ) : (
                                  <CommonSwitch
                                    type={3}
                                    checked={
                                      ele.valve_status === 1 ? true : false
                                    }
                                    onChange={({ status }) => {
                                      Changebutton(ele.device_id, status, 3);
                                    }}
                                  />
                                )}
                              </div>
                            </div>

                            <div className="sub-details">
                              <div className="tank-width">
                                <p className="tank-usage">
                                  <span className="tank-header">Mode - </span>
                                  <span className="tank-date">
                                    {ele.valve_mode === 1
                                      ? "Daily"
                                      : ele.valve_mode === 2
                                      ? "Weekly"
                                      : ele.valve_mode === 0
                                      ? "Manual"
                                      : ""}
                                  </span>{" "}
                                </p>
                              </div>
                              <div>
                                {/* <img
                                  src={ExportedImages.VALVE_IMG}
                                  className="valveimg"
                                /> */}
                                <img
                                  src={ExportedImages.valveImage}
                                  className="valveimg"
                                />
                              </div>

                              <div className="tank-width">
                                <button
                                  type="button"
                                  className="settings-btn"
                                  onClick={(e) => {
                                    stoppropagation(e);

                                    loadingspinner(
                                      ele.device_id,
                                      7,
                                      ele.device_type
                                    ); //setting loader valve
                                    setSettingLoaderId(ele.device_id);
                                  }}
                                >
                                  {settingLoaderId === ele.device_id &&
                                  isSettingLoading ? (
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
                            <p className="tank-usage">
                              <span className="tank-header">Location</span>
                              &nbsp;
                              {LocationId === ele.device_id && isLocation ? (
                                <MdLocationOn className={"locateapi"} />
                              ) : (
                                <MdLocationOn
                                  className="locate"
                                  onClick={(e) => {
                                    stoppropagation(e);

                                    setLocationId(ele.device_id);
                                    loadingspinner(
                                      ele.device_id,
                                      11,
                                      ele.device_type
                                    ); //valve location
                                  }}
                                />
                              )}
                              {deviceId === ele.device_id && editDevice ? (
                                <span className="d-inline-table">
                                  <div className="latlan">
                                    Lat-
                                    <input
                                      type="text"
                                      onKeyPress={latlong}
                                      maxLength={10}
                                      className={
                                        editDevice && ele.device_id === deviceId
                                          ? "location"
                                          : "devicebg"
                                      }
                                      onChange={(e) => {
                                        setvalveinputdata({
                                          ...valveinputdata,
                                          latitude: e.target.value
                                        });
                                      }}
                                      value={valveinputdata?.latitude}
                                    />
                                    'N
                                  </div>
                                  <div className="latlan">
                                    Long-
                                    <input
                                      type="text"
                                      onKeyPress={latlong}
                                      maxLength={10}
                                      className={
                                        editDevice && ele.device_id === deviceId
                                          ? "location"
                                          : "devicebg"
                                      }
                                      onChange={(e) => {
                                        setvalveinputdata({
                                          ...valveinputdata,
                                          longitude: e.target.value
                                        });
                                      }}
                                      value={valveinputdata?.longitude}
                                    />
                                    'E
                                  </div>
                                </span>
                              ) : (
                                <p className="tank-header">
                                  Lat-
                                  <span className="tank-date">
                                    {ele.latitude === ""
                                      ? null
                                      : `${ele?.latitude} 'N`}
                                  </span>
                                  <br />
                                  Long-
                                  <span className="tank-date">
                                    {ele.longitude === ""
                                      ? null
                                      : `${ele?.longitude} 'E`}
                                  </span>
                                </p>
                              )}
                            </p>

                            <p className="tank-usage">
                              {" "}
                              <span className="tank-header">Source-</span>
                              &nbsp;
                              <span className="tank-date">
                                {ele?.source === 1 ? "Battery" : "EB"}
                              </span>
                            </p>

                            {ele?.source === 1 ? (
                              <p className="tank-usage">
                                {" "}
                                <span className="tank-header">Battery-</span>
                                &nbsp;
                                <span className="tank-date">
                                  {ele?.battery}
                                </span>
                              </p>
                            ) : null}
                            {ele?.source === 1 ? (
                              <p className="tank-usage">
                                {" "}
                                <span className="tank-header">
                                  Solar panel-
                                </span>
                                &nbsp;
                                <span className="tank-date">
                                  {ele?.solar_panel}
                                </span>
                              </p>
                            ) : null}
                            <p className="tank-usage">
                              {" "}
                              <span className="tank-header">
                                Software Version-
                              </span>
                              &nbsp;
                              <span className="tank-date">
                                {ele?.software_version}
                              </span>
                            </p>
                            <p className="tank-usage">
                              {" "}
                              <span className="tank-header">
                                Hardware Version-
                              </span>
                              &nbsp;
                              <span className="tank-date">
                                {ele?.hardware_version}
                              </span>
                            </p>
                            {ele?.status != null ? (
                              <p>
                                <span className="tank-header">
                                  status&nbsp;:&nbsp;
                                </span>
                                <span
                                  className={
                                    ele?.status === -1
                                      ? productionstyle.production_status_deleted
                                      : ele?.status === 0
                                      ? productionstyle.production_status_inactive
                                      : ele?.status === 1
                                      ? productionstyle.production_status_on
                                      : ele?.status === 2
                                      ? productionstyle.production_status_waiting
                                      : ele?.status === 3
                                      ? productionstyle.production_status_off
                                      : null
                                  }
                                >
                                  {ele?.status === -1
                                    ? "Deleted"
                                    : ele?.status === 0
                                    ? "In Active"
                                    : ele?.status === 1
                                    ? "Tested Ok"
                                    : ele?.status === 2
                                    ? "Waiting for Test"
                                    : ele?.status === 3
                                    ? "Fault"
                                    : null}
                                </span>
                              </p>
                            ) : null}
                          </div>
                        ) : ele?.device_type === 4 && controllertype === 2 ? (
                          <div
                            className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                      ${commonstyle.cards_padding}  new-details tank-bgcolor ${devicestyle.margin_zero}`}
                            key={index}
                            onClick={() => toView(ele.device_id)}
                          >
                            <div className="setting-top-bar">
                              <div className="setting-sub-bar">
                                {ele.device_id === deviceId && editDevice ? (
                                  <input
                                    autoFocus
                                    key={tankinputdata.device_name}
                                    type="text"
                                    className={devicestyle.device_name_input}
                                    onChange={(e) => {
                                      setlightinputdata((pre) => ({
                                        ...pre,
                                        device_name: e.target.value
                                      }));
                                    }}
                                    value={lightinputdata.device_name}
                                  />
                                ) : (
                                  <OverlayTrigger
                                    key="top"
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip-top">
                                        <strong>{ele.device_name}</strong>
                                      </Tooltip>
                                    }
                                  >
                                    <p
                                      className={`${devicestyle.device_name} ${devicestyle.device_name_light_col}`}
                                    >
                                      {ele.device_name}
                                    </p>
                                  </OverlayTrigger>
                                )}

                                {ele?.tower ? (
                                  <>
                                    <img
                                      src={
                                        ele?.tower >= 20 && ele?.tower <= 39
                                          ? ExportedImages.TOWER_ICON1
                                          : ele?.tower >= 40 && ele?.tower <= 59
                                          ? ExportedImages.TOWER_ICON2
                                          : ele?.tower >= 60 && ele?.tower <= 79
                                          ? ExportedImages.TOWER_ICON3
                                          : ele?.tower >= 80 && ele?.tower <= 99
                                          ? ExportedImages.TOWER_ICON4
                                          : ele?.tower === 100
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
                                      {ele?.tower}%
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

                              <div
                                className={devicestyle.light_device_edit_off}
                              >
                                {ele.device_id === ButtonId ? (
                                  <Toggle
                                    buttoncol={"grey"}
                                    id={index}
                                    isChecked={
                                      ele.light_status === 1 ? true : false
                                    }
                                    handleChange={({ status }) => {
                                      Changebutton(ele.device_id, status, 4);
                                    }}
                                  />
                                ) : (
                                  <Toggle
                                    id={index}
                                    isChecked={
                                      ele.light_status === 1 ? true : false
                                    }
                                    handleChange={({ status }) => {
                                      Changebutton(ele.device_id, status, 4);
                                    }}
                                  />
                                )}

                                <div className={devicestyle.edit_date}>
                                  {/* {ele?.device_time ? (
                                  <p className="tank-date">
                                    {ele?.device_time}
                                  </p>
                                ) : null} */}
                                  {/* <img
                                  src={
                                    editDevice && deviceId == ele.device_id
                                      ? save
                                      : !editDevice
                                      ? edit
                                      : null
                                  }
                                  onClick={(e) => {
                                    setEditDevice(!editDevice);
                                    setDeviceId(ele.device_id);
                                    UpdateDevie(ele.device_id, ele.device_type);

                                    setlightinputdata({
                                      ...lightinputdata,
                                      device_name: ele.device_name,
                                      dim: ele.dim_level,
                                      time1: ele.time1,
                                      time2: ele.time2,
                                      latitude: ele.latitude,
                                      longitude: ele.longitude,
                                    });
                                  }}
                                /> */}
                                </div>
                              </div>
                            </div>

                            <div className="setting-top-bar setting-height">
                              <p className="tank-usage d-grid pb-2">
                                <span className="tank-header">
                                  Last Update -{" "}
                                </span>
                                <span className="tank-date">
                                  {ele?.device_time != null
                                    ? ele?.device_time.includes("T")
                                      ? moment(ele?.device_time).format(
                                          "DD-MM-YYYY HH:mm:ss"
                                        )
                                      : ele?.device_time
                                    : null}
                                </span>
                              </p>
                              <p>
                                {ele.device_id === loaderId && isloading ? (
                                  <img
                                    src={ExportedImages.GREEN_SPINNER_GIF}
                                    alt="tower"
                                    className="valvespinner light_spinner"
                                    style={{ height: "23px" }}
                                  />
                                ) : (
                                  <img
                                    src={ExportedImages.SPINNER_ICON}
                                    alt="rotating-arrow"
                                    className="tanpkinner light_spinner"
                                    onClick={(e) => {
                                      stoppropagation(e);

                                      loadingspinner(
                                        ele.device_id,
                                        ele.device_type ///4 light loader
                                      );
                                      setLoaderId(ele.device_id);
                                    }}
                                  />
                                )}
                              </p>
                              <p className="tank-usage d-grid">
                                <span className="tank-header">
                                  Status Update -{" "}
                                </span>
                                <span className="tank-date">
                                  {ele?.on_off_time != null
                                    ? moment(ele?.on_off_time).format(
                                        "DD-MM-YYYY HH:mm:ss"
                                      )
                                    : null}
                                </span>
                              </p>
                            </div>

                            <div className="setting-top-bar">
                              <p className="tank-usage mb-0">
                                <span className="tank-header">ID - </span>
                                <span className="tank-date">
                                  {ele?.device_code}
                                </span>
                              </p>
                              <p className="tank-usage">
                                <span className="tank-header">volts - </span>
                                <span className="tank-date">
                                  <span>{ele?.volts}</span>
                                </span>
                              </p>
                            </div>

                            <div className="setting-top-bar">
                              <p className="tank-usage">
                                <span className="tank-header">Dim - </span>
                                {ele.device_id === deviceId && editDevice ? (
                                  <input
                                    type="text"
                                    className={
                                      ele.device_id === deviceId && editDevice
                                        ? "location"
                                        : "devicebg"
                                    }
                                    onChange={(e) => {
                                      setlightinputdata({
                                        ...lightinputdata,
                                        dim: e.target.value
                                      });
                                    }}
                                    value={lightinputdata.dim}
                                  />
                                ) : (
                                  <span className="tank-date">
                                    {ele.dim_level}%
                                  </span>
                                )}
                              </p>
                              <p className="tank-usage">
                                <span className="tank-header">Amps - </span>
                                <span className="tank-date">{ele?.amps}</span>
                              </p>
                            </div>

                            <div className="setting-top-bar">
                              <p className="tank-usage">
                                <span className="tank-header">
                                  burning hour -{" "}
                                </span>
                                <span className="tank-date">
                                  <span>{ele?.burning_hrs}</span>
                                </span>
                              </p>
                              <p className="tank-usage">
                                <span className="tank-header">PF - </span>
                                <span className="tank-date">
                                  <span>{ele?.pf}</span>
                                </span>
                              </p>
                            </div>

                            <div className="setting-top-bar">
                              <p className="tank-usage mb-0">
                                <span className="tank-header">Location</span>
                                &nbsp;
                                {LocationId === ele.device_id && isLocation ? (
                                  <MdLocationOn className={"locateapi"} />
                                ) : (
                                  <MdLocationOn
                                    className="locate"
                                    onClick={(e) => {
                                      stoppropagation(e);

                                      setLocationId(ele.device_id);
                                      loadingspinner(
                                        ele.device_id,
                                        12,
                                        ele.device_type
                                      ); //light location
                                    }}
                                  />
                                )}
                              </p>

                              {/* <p className="tank-usage">
                              <span className="tank-header">on time - </span>
                              <span className="tank-date">
                                {deviceId === ele.device_id && editDevice ? (
                                  <TimePicker
                                    className={
                                      deviceId === ele.device_id && editDevice
                                        ? "light_device_ontime"
                                        : "devicebg devicebgwidth"
                                    }
                                    defaultValue={
                                      lightinputdata?.on_time != null
                                        ? moment(
                                            "2220-08-05 " +
                                              lightinputdata?.on_time
                                          )
                                        : ""
                                    }
                                    allowEmpty
                                    showSecond={false}
                                    format="HH:mm:00"
                                    onChange={(e) => {
                                      setlightinputdata({
                                        ...lightinputdata,
                                        time1: moment(e).format("HH:mm:00"),
                                      });
                                    }}
                                  />
                                ) : (
                                  <span>{ele?.on_time}</span>
                                )}
                              </span>
                            </p> */}
                            </div>
                            <div className="setting-top-bar">
                              <p>
                                <span className="tank-header"></span>
                                {deviceId === ele.device_id && editDevice ? (
                                  <span>
                                    Lat&nbsp;
                                    <input
                                      onKeyPress={latlong}
                                      type="text"
                                      className={
                                        deviceId === ele.device_id && editDevice
                                          ? "location"
                                          : "non-edit"
                                      }
                                      onChange={(e) => {
                                        setlightinputdata({
                                          ...lightinputdata,
                                          latitude: e.target.value
                                        });
                                      }}
                                      value={lightinputdata?.latitude}
                                    />
                                    {"'"}N
                                  </span>
                                ) : (
                                  <p className="tank-header">
                                    Lat-
                                    <span className="tank-date">
                                      {ele?.latitude != null ||
                                      ele?.latitude != ""
                                        ? ele?.latitude
                                        : null}
                                      'N
                                    </span>
                                  </p>
                                )}
                              </p>
                              {/* <p className="tank-usage">
                              <span className="tank-header">off time - </span>
                              <span className="tank-date">
                                {deviceId === ele.device_id && editDevice ? (
                                  <TimePicker
                                    className={
                                      deviceId === ele.device_id && editDevice
                                        ? "light_device_ontime"
                                        : "devicebg devicebgwidth"
                                    }
                                    defaultValue={
                                      ele?.off_time != null
                                        ? moment("2220-08-05 " + ele?.off_time)
                                        : ""
                                    }
                                    allowEmpty
                                    showSecond={false}
                                    format="HH:mm:00"
                                    onChange={(e) => {
                                      setlightinputdata({
                                        ...lightinputdata,
                                        offtime: moment(e).format("HH:mm:00"),
                                      });
                                    }}
                                  />
                                ) : (
                                  <span>{ele?.off_time}</span>
                                )}
                              </span>
                            </p> */}
                              {ele?.status != null ? (
                                <p>
                                  <span className="tank-header">
                                    status&nbsp;:&nbsp;
                                  </span>
                                  <span
                                    className={
                                      ele?.status === -1
                                        ? productionstyle.production_status_deleted
                                        : ele?.status === 0
                                        ? productionstyle.production_status_inactive
                                        : ele?.status === 1
                                        ? productionstyle.production_status_on
                                        : ele?.status === 2
                                        ? productionstyle.production_status_waiting
                                        : ele?.status === 3
                                        ? productionstyle.production_status_off
                                        : null
                                    }
                                  >
                                    {ele?.status === -1
                                      ? "Deleted"
                                      : ele?.status === 0
                                      ? "In Active"
                                      : ele?.status === 1
                                      ? "Tested Ok"
                                      : ele?.status === 2
                                      ? "Waiting for Test"
                                      : ele?.status === 3
                                      ? "Fault"
                                      : null}
                                  </span>
                                </p>
                              ) : null}
                            </div>

                            <div className="setting-top-bar">
                              {deviceId === ele.device_id && editDevice ? (
                                <>
                                  <span>
                                    Long&nbsp;
                                    <input
                                      onKeyPress={latlong}
                                      type="text"
                                      className={
                                        deviceId === ele.device_id && editDevice
                                          ? "location"
                                          : "non-edit"
                                      }
                                      onChange={(e) => {
                                        setlightinputdata({
                                          ...lightinputdata,
                                          longitude: e.target.value
                                        });
                                      }}
                                      value={lightinputdata?.longitude}
                                    />
                                    {"'"}E
                                  </span>
                                </>
                              ) : (
                                <p className="tank-header">
                                  &nbsp;Long-
                                  <span className="tank-date">
                                    {ele.longitude != null ||
                                    ele.longitude != ""
                                      ? ele?.longitude
                                      : null}
                                    'E
                                  </span>
                                </p>
                              )}
                              <button
                                type="button"
                                className="settings-btn "
                                onClick={(e) => {
                                  stoppropagation(e);

                                  loadingspinner(
                                    ele.device_id,
                                    8,
                                    ele.device_type
                                  ); //light settings loader
                                  setSettingLoaderId(ele.device_id);
                                }}
                              >
                                {settingLoaderId === ele.device_id &&
                                isSettingLoading ? (
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
                            {/* <div className="setting-top-bar">
                            {ele?.status != null ? (
                              <p>
                                <span className="tank-header">
                                  status&nbsp;:&nbsp;
                                </span>
                                <span
                                  className={
                                    ele?.status === -1
                                      ? productionstyle.production_status_deleted
                                      : ele?.status === 0
                                      ? productionstyle.production_status_inactive
                                      : ele?.status === 1
                                      ? productionstyle.production_status_on
                                      : ele?.status === 2
                                      ? productionstyle.production_status_waiting
                                      : ele?.status === 3
                                      ? productionstyle.production_status_off
                                      : null
                                  }
                                >
                                  {ele?.status === -1
                                    ? "Deleted"
                                    : ele?.status === 0
                                    ? "In Active"
                                    : ele?.status === 1
                                    ? "Tested Ok"
                                    : ele?.status === 2
                                    ? "Waiting for Test"
                                    : ele?.status === 3
                                    ? "Fault"
                                    : null}
                                </span>
                              </p>
                            ) : null}
                          </div> */}
                          </div>
                        ) : ele?.device_type === 5 && controllertype === 1 ? (
                          <div
                            className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                ${commonstyle.cards_padding} new-details tank-bgcolor`}
                            key={index}
                            onClick={() => toView(ele.device_id)}
                          >
                            <div className={devicestyle.tank_level}>
                              <div className="motor-level">
                                <div className="inputWidth" style={{ minWidth: 0 }}>
                                  {editDevice && deviceId === ele.device_id ? (
                                    <input
                                      autoFocus
                                      key={tankinputdata.device_name}
                                      type="text"
                                      className={devicestyle.device_name_input}
                                      onClick={(e) => {
                                        settankinputdata((pre) => ({
                                          ...pre,
                                          device_name: e.target.value
                                        }));
                                      }}
                                      value={tankinputdata.device_name}
                                    />
                                  ) : (
                                    <OverlayTrigger
                                      key="top"
                                      placement="top"
                                      overlay={
                                        <Tooltip id="tooltip-top">
                                          <strong>{ele?.device_name}</strong>
                                        </Tooltip>
                                      }
                                    >
                                      <p
                                        className={`${devicestyle.device_name} ${devicestyle.device_name_tank_col}`}
                                      >
                                        {ele?.device_name}
                                      </p>
                                    </OverlayTrigger>
                                  )}
                                </div>

                                {ele?.tower ? (
                                  <>
                                    <img
                                      src={
                                        ele?.tower >= 20 && ele?.tower <= 39
                                          ? ExportedImages.TOWER_ICON1
                                          : ele?.tower >= 40 && ele?.tower <= 59
                                          ? ExportedImages.TOWER_ICON2
                                          : ele?.tower >= 60 && ele?.tower <= 79
                                          ? ExportedImages.TOWER_ICON3
                                          : ele?.tower >= 80 && ele?.tower <= 99
                                          ? ExportedImages.TOWER_ICON4
                                          : ele?.tower === 100
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
                                      {ele?.tower}%
                                    </p>{" "}
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
                                {ele?.device_time ? (
                                  <p className="tank-date">
                                    {ele?.device_time}
                                  </p>
                                ) : null}
                                {/* <img
                            src={
                              editDevice && deviceId == ele.device_id
                                ? save
                                : !editDevice
                                ? edit
                                : null
                            }
                            onClick={(e) => {
                              setEditDevice(!editDevice);
                              setDeviceId(ele.device_id);
                              UpdateDevie(ele.device_id, ele.device_type);
                              settankinputdata({
                                ...tankinputdata,
                                device_name: ele.device_name,
                                tank_height: ele.tank_height,
                                high_limit: ele.high_limit,
                                low_limit: ele.low_limit,
                                latitude: ele.latitude,
                                longitude: ele.longitude,
                                high_limit_action: ele.high_limit_action,
                                low_limit_action: ele.low_limit_action,
                              });
                            }}
                          /> */}
                              </div>
                            </div>

                            <div className="tank-level-data">
                              <p className={commonstyle.margin_zero}>
                                <span className="tank-header">ID - </span>
                                <span className="tank-date">
                                  {" "}
                                  {ele.device_code}{" "}
                                </span>
                              </p>

                              {ele.device_id === loaderId && isloading ? (
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
                                  onClick={(e) => {
                                    stoppropagation(e);

                                    loadingspinner(
                                      ele.device_id,
                                      13,
                                      ele.device_type ///1 tank
                                    );
                                    setLoaderId(ele.device_id);
                                  }}
                                />
                              )}

                              <div className="btnWidth">
                                <button
                                  type="button"
                                  className="settings-btn"
                                  onClick={(e) => {
                                    stoppropagation(e);

                                    loadingspinner(
                                      ele.device_id,
                                      14,
                                      ele.device_type
                                    ); //setting loader tank
                                    setSettingLoaderId(ele.device_id);
                                  }}
                                >
                                  {settingLoaderId === ele.device_id &&
                                  isSettingLoading ? (
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

                            <div className="sub-details">
                              <div className="sub-details w60">
                                <div className="w-40 detailsflex">
                                  <p>
                                    <span className="tank-header">
                                      Location
                                    </span>
                                    &nbsp;
                                    {LocationId === ele.device_id &&
                                    isLocation ? (
                                      <MdLocationOn className={"locateapi"} />
                                    ) : (
                                      <MdLocationOn
                                        className="locate"
                                        onClick={(e) => {
                                          stoppropagation(e);
                                          setLocationId(ele.device_id);
                                          loadingspinner(
                                            ele.device_id,
                                            15,
                                            ele.device_type
                                          ); //location tank
                                        }}
                                      />
                                    )}
                                    {deviceId === ele.device_id &&
                                    editDevice ? (
                                      <span className="d-inline-table">
                                        <div className="latlan">
                                          Lat-
                                          <input
                                            type="text"
                                            onKeyPress={latlong}
                                            maxLength={10}
                                            className={
                                              editDevice &&
                                              ele.device_id === deviceId
                                                ? "location"
                                                : "devicebg"
                                            }
                                            onChange={(e) => {
                                              settankinputdata({
                                                ...tankinputdata,
                                                latitude: e.target.value
                                              });
                                            }}
                                            value={tankinputdata?.latitude}
                                          />
                                          'N
                                        </div>
                                        <div className="latlan">
                                          Long-
                                          <input
                                            type="text"
                                            onKeyPress={latlong}
                                            maxLength={10}
                                            className={
                                              editDevice &&
                                              ele.device_id === deviceId
                                                ? "location"
                                                : "devicebg"
                                            }
                                            onChange={(e) => {
                                              settankinputdata({
                                                ...tankinputdata,
                                                longitude: e.target.value
                                              });
                                            }}
                                            value={tankinputdata?.longitude}
                                          />
                                          'E
                                        </div>
                                      </span>
                                    ) : (
                                      <p className="tank-header">
                                        Lat-
                                        <span className="tank-date">
                                          {ele.latitude === ""
                                            ? null
                                            : `${ele?.latitude} 'N`}
                                        </span>
                                        <br />
                                        Long-
                                        <span className="tank-date">
                                          {ele.longitude === ""
                                            ? null
                                            : `${ele?.longitude} 'E`}
                                        </span>
                                      </p>
                                    )}
                                  </p>
                                  {ele?.status != null ? (
                                    <p>
                                      <span className="tank-header">
                                        status&nbsp;:&nbsp;
                                      </span>
                                      <span
                                        className={
                                          ele?.status === -1
                                            ? productionstyle.production_status_deleted
                                            : ele?.status === 0
                                            ? productionstyle.production_status_inactive
                                            : ele?.status === 1
                                            ? productionstyle.production_status_on
                                            : ele?.status === 2
                                            ? productionstyle.production_status_waiting
                                            : ele?.status === 3
                                            ? productionstyle.production_status_off
                                            : null
                                        }
                                      >
                                        {ele?.status === -1
                                          ? "Deleted"
                                          : ele?.status === 0
                                          ? "In Active"
                                          : ele?.status === 1
                                          ? "Tested Ok"
                                          : ele?.status === 2
                                          ? "Waiting for Test"
                                          : ele?.status === 3
                                          ? "Fault"
                                          : null}
                                      </span>
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              <div>
                                <p>
                                  <span className="tank-header">
                                    Water Quality
                                  </span>
                                  <span className="tank-date">
                                    - {ele?.source === 1 ? "TDS" : "EB"}
                                  </span>
                                </p>
                                {ele?.source === 1 ? (
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
                                        - {ele?.battery}
                                      </span>
                                    </p>

                                    <p>
                                      <span className="tank-header">PH</span>
                                      <span className="tank-date">
                                        - {ele?.solar_panel}
                                      </span>
                                    </p>
                                  </div>
                                ) : null}
                                <p>
                                  <span className="tank-header">
                                    Hardware Version -{" "}
                                  </span>
                                  <span className="tank-date">
                                    {ele?.hardware_version}
                                  </span>
                                </p>
                                <p>
                                  <span className="tank-header">
                                    Software Version -{" "}
                                  </span>
                                  <span className="tank-date">
                                    {ele?.software_version}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </>
                    );
                  })}
                </div>
              ) : (
                <p className="view-msg">no data found</p>
              )}
            </div>
            {(Values.device_type === 6 ? motorTotal : total) > 12 ? (
              <div className="col-12 float-start d-flex justify-content-center paginator">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<FaAngleDoubleRight />}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={5}
                  pageCount={Values.device_type === 6 ? motorPageCount : pageCount}
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
                  forcePage={(Values.device_type === 6 ? motorPage : page) - 1}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
