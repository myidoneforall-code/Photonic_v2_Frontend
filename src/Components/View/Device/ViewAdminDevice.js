import "../ViewController.modules.css";
import { FaArrowLeft } from "react-icons/fa";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import classes from "../../View/Device/MotorDevice.module.css";
import {
  EditDevice,
  ViewadminDevice,
  devicerefreshapi,
  lastReceivedDataBatch,
  motordata,
  buttonapi,
} from "../../../Service/ApiService";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../Loader";
import { useLocation, useNavigate } from "react-router";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { ImSpinner11 } from "react-icons/im";
import { MdLocationOn } from "react-icons/md";
import Toggle from "../../ToggleButton";
import devicestyle from "../ViewController/motorcontroller.module.css";
import moment from "moment";
import productionstyle from "../Productionunit/production.module.css";
import { ExportedImages } from "../../../Utilities/ImageExport";
import { useDispatch } from "react-redux";
import { UpdateDeviceFilter } from "../../Store/Config/Configuration";
import CommonSwitch from "../../CommonComponents/CommonSwitch";
import { Checkbox, Col, Row } from "antd";
import dayjs from "dayjs";

export default function Viewadmindevice() {
  let abortcontroller = undefined;
  const navigate = useNavigate();
  const [viewData, setViewData] = useState({});
  const [loader, setloader] = useState(false);
  const location = useLocation();
  const { state } = location;
  let dispatch = useDispatch();

  let controllertype = parseInt(localStorage.getItem("contollertype"));

  const [editDevice, setEditDevice] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const [isloading, setloading] = useState(false);
  const [loaderId, setLoaderId] = useState("");

  const [isSettingLoading, setIsSettingLoading] = useState(false);
  const [settingLoaderId, setSettingLoaderId] = useState("");

  const [LocationId, setLocationId] = useState("");
  const [isLocation, setIsLocation] = useState(false);

  const [ButtonId, setButtonId] = useState(false);

  // Motor cards (ControllerDevice.js's Motor tab) open this same View
  // Device page, but a motor is a Controller row (view_controller), not
  // a Device row (view_device) — this flag (set on the nav state by
  // ControllerDevice.js's toViewMotor) picks which API/branch to use.
  const isMotorView = state?.isController === true;

  const [tankinputdata, settankinputdata] = useState({
    device_name: "",
    tank_height: "",
    low_limit: "",
    high_limit: "",
    latitude: "",
    longitude: "",
    low_limit_action: "",
    high_limit_action: "",
    status: 1,
  });

  const [flowinputdata, setflowinputdata] = useState({
    device_name: "",
    usage_limit: "",
    usage_limit_action: "",
    latitude: "",
    longitude: "",
    daily_update: "",
    status: 1,
  });

  const [valveinputdata, setvalveinputdata] = useState({
    device_name: "",
    latitude: "",
    longitude: "",
    status: 1,
  });

  const [lightinputdata, setlightinputdata] = useState({
    device_name: "",
    dim: "",
    time1: "",
    time2: "",
    latitude: "",
    longitude: "",
    status: 1,
  });

  const ViewDevice = () => {
    setloader(true);
    const request = isMotorView
      ? motordata(state?.id)
      : ViewadminDevice(state?.id);
    request
      .then(({ data }) => {
        setViewData(data);
        // Same live-preview overlay ControllerDevice.js's grid already
        // applies to unapproved cards — without it this page shows the
        // real (empty) DB row for a "Waiting for Test" device/controller
        // while the grid it was opened from shows live MQTT preview
        // values, so the two disagree (e.g. grid: 73%, here: 0%).
        const previewCode = isMotorView ? data?.controller_code : data?.device_code;
        if (data?.status !== 1 && previewCode) {
          lastReceivedDataBatch([previewCode])
            .then(({ data: resp }) => {
              const preview = resp?.previews?.[previewCode];
              if (preview) {
                setViewData((prev) => ({ ...prev, ...preview }));
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        // toast("something went wrong", { type: "error" });
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

  // Refresh spinner for the motor branch — mirrors motorLoadingSpinner
  // in ControllerDevice.js, just scoped to this single controller
  // instead of a whole page of cards. FIXED: this only ever sent the
  // MQTT refresh command — it never pulled the resulting reading back
  // onto the page, so the click looked like it did nothing.
  const motorRefresh = (controllerId) => {
    setloading(true);
    setTimeout(() => setloading(false), 3000);
    let formData = new FormData();
    formData.append("controller_id", controllerId);
    formData.append("controller_type", 1);
    formData.append("request_type", 1);
    buttonapi(formData)
      .then(() => {
        setTimeout(() => ViewDevice(), 5000);
      })
      .catch(() => {});
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
            // ListController();
            setButtonId("");
          }, 5000);
        })
        .catch((err) => {});
    }
  };

  const loadingspinner = (id, type, devicetype) => {
    ///loader
    //tank=1 , flow=2 ,valve=3 , light=4, multi=9
    if (type == 1 || type == 2 || type == 3 || type == 4 || type == 9) {
      setloading(true);
      setTimeout(() => {
        setloading(false);
      }, 3000);
      let formData = new FormData();
      formData.append("device_id", id);
      formData.append("device_type", type === 9 ? 5 : type);
      formData.append("request_type", 1);
      devicerefreshapi(formData, abortcontroller)
        .then(({ data }) => {
          setTimeout(() => {}, 5000);
        })
        .catch((err) => {});
    }
    ///loader end

    //settingloader
    //tank=5 , flow=6 ,valve=7 , light=8 , multi=10
    else if (
      type === 5 ||
      type === 6 ||
      type === 7 ||
      type === 8 ||
      type === 10
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
          setTimeout(() => {}, 5000);
        })
        .catch((err) => {});
    }
    //settingloader end

    ///location
    //tank=9 , flow=10 ,valve=11 , light=12
    else if (type === 9 || type === 10 || (type === 11) | (type === 12)) {
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
          setTimeout(() => {}, 5000);
        })
        .catch((err) => {});
    }
    //location end
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
  useEffect(() => {
    ViewDevice();
  }, []);

  // Was fetch-once-on-mount only — the page never updated again on its
  // own after that, no matter how much time passed or how many new
  // readings came in. 15s — the DB row is already kept current by the
  // MQTT listener as messages arrive, so the page just needs to poll
  // it, same cadence as the device grid's own live-preview poll.
  useEffect(() => {
    const interval = setInterval(() => {
      ViewDevice();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state?.DeviceFilter) {
      dispatch(UpdateDeviceFilter(state?.DeviceFilter));
    }
  }, [state]);

  return (
    <>
      <Loader isLoader={loader} />

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
                onClick={() => navigate("/dashboard/controllerdevice")}
              />

              <p className={`controller-name total_head`}>View Device</p>
            </div>
          </div>
          <div className="view-page">
            <div
              className={devicestyle.total_device}
              style={{
                display: viewData?.device_type === 5 ? "block" : "grid",
              }}
            >
              {isMotorView ? (
                <div
                  className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
      ${commonstyle.cards_padding} new-details tank-bgcolor`}
                >
                  <div className="viewtop-div">
                    <div className="editflex">
                      <div>
                        {viewData?.controller_name ? (
                          <OverlayTrigger
                            key="top"
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">
                                <strong>{viewData?.controller_name}</strong>
                              </Tooltip>
                            }
                          >
                            <p className={devicestyle.motor_name}>
                              {viewData?.controller_name}
                            </p>
                          </OverlayTrigger>
                        ) : (
                          <p className={devicestyle.motor_name}>
                            {viewData?.controller_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {viewData?.controller_code ? (
                      <div className="motor-btn">
                        {viewData.controller_id === loaderId && isloading ? (
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
                              motorRefresh(viewData.controller_id);
                              setLoaderId(viewData.controller_id);
                            }}
                          />
                        )}
                        {viewData?.tower ? (
                          <>
                            <img
                              src={
                                viewData?.tower >= 20 && viewData?.tower <= 39
                                  ? ExportedImages.TOWER_ICON1
                                  : viewData?.tower >= 40 &&
                                    viewData?.tower <= 59
                                  ? ExportedImages.TOWER_ICON2
                                  : viewData?.tower >= 60 &&
                                    viewData?.tower <= 79
                                  ? ExportedImages.TOWER_ICON3
                                  : viewData?.tower >= 80 &&
                                    viewData?.tower <= 99
                                  ? ExportedImages.TOWER_ICON4
                                  : viewData?.tower === 100
                                  ? ExportedImages.TOWER_ICON5
                                  : ExportedImages.EMPTY_TOWER_ICON
                              }
                              alt="tower"
                              style={{ width: "30px" }}
                            />
                            <p className="controller_tower_percentage">
                              {viewData?.tower}%
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
                      {viewData?.operated_by ? (
                        <button type="button" className="mobile">
                          {viewData?.operated_by}
                        </button>
                      ) : null}
                      {viewData?.controller_code ? (
                        <p className="tank-header">
                          Status -{" "}
                          <span className="tank-date">
                            {viewData?.controller_status === 1 ? "ON" : "OFF"}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {viewData?.controller_code ? (
                    <div className="date-update">
                      <div className="update-text">
                        <p className="tank-header">last update</p>
                        <p className="tank-date">
                          {viewData?.controller_datetime}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {viewData?.controller_code ? (
                    <p className="line motorLine One"></p>
                  ) : null}

                  {viewData?.controller_code ? (
                    <div className="sub-details">
                      {viewData?.r != null ? (
                        <div className="data-update">
                          <div className="motor-detail-sub-div bg-color-one">
                            <p className="volt-text-1">
                              <span>R</span>
                              {Number(viewData?.r)} V
                            </p>
                            <p className="volt-text-2">
                              <span>A</span>
                              {Number(viewData?.rl1)} A
                            </p>
                            <p className="tankpf">
                              PF {Number(viewData?.rpf1)}
                            </p>
                          </div>
                          {viewData?.y != null ? (
                            <>
                              <div className="motor-detail-sub-div  bg-color-two">
                                <p className="volt-text-1">
                                  <span>Y</span> {Number(viewData?.y)} V
                                </p>
                                <p className="volt-text-2">
                                  <span>A</span>
                                  {Number(viewData?.yl2)} A
                                </p>
                                <p className="tankpf">
                                  PF {Number(viewData?.ypf2)}
                                </p>
                              </div>
                              <div className="motor-detail-sub-div  bg-color-three">
                                <p className="volt-text-1">
                                  <span>B</span> {Number(viewData?.b)} V
                                </p>
                                <p className="volt-text-2">
                                  <span>A</span>
                                  {Number(viewData?.bl3)} A
                                </p>
                                <p className="tankpf">
                                  PF {Number(viewData?.bpf3)}
                                </p>
                              </div>
                            </>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="detailsflex">
                        <p
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span className="tank-header">ID - </span>
                          <span className="tank-date">
                            {viewData?.controller_code}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">Power Usage - </span>
                          <span className="tank-date">
                            {viewData?.kilo_watt_hr}
                          </span>
                        </p>
                      </div>

                      <div className="detailsflex">
                        <div>
                          <p>
                            <span className="tank-header">Live Load - </span>
                            <span className="tank-date">
                              {viewData?.kilo_watt}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="tank-header">Ran Time - </span>
                            <span className="tank-date">
                              {viewData?.pump_running_hrs >= 100
                                ? `${Math.floor(
                                    viewData.pump_running_hrs / 100
                                  )}:${String(
                                    viewData.pump_running_hrs % 100
                                  ).padStart(2, "0")}`
                                : viewData?.pump_running_hrs}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="tank-header">Total hours - </span>
                            <span className="tank-date">
                              {viewData?.total_hrs
                                ? viewData?.total_hrs.split(":")[0]
                                : ""}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="detailsflex">
                        <div>
                          <p>
                            <span className="tank-header">Tank Status - </span>
                            <span className="tank-date">
                              {viewData?.tank_level != null
                                ? `${Number(viewData?.tank_level)}%`
                                : null}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="tank-header">Flow Status - </span>
                            <span
                              className={
                                viewData?.controller_setting
                                  ?.usage_limit_status === 1
                                  ? "tank-date close-btn"
                                  : "tank-date oped_btn"
                              }
                            >
                              {viewData?.controller_setting
                                ?.usage_limit_status === 1
                                ? "Reached"
                                : "Not Reached"}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="tank-header">
                              Valve Status -{" "}
                            </span>
                            <span>
                              <button
                                type="button"
                                className={
                                  viewData?.controller_setting
                                    ?.valve_status === 1
                                    ? "oped_btn"
                                    : "close-btn"
                                }
                              >
                                {viewData?.controller_setting
                                  ?.valve_status === 1
                                  ? "Opened"
                                  : "Closed"}
                              </button>
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="tank-header">Kvar - </span>
                            <span className="tank-date">
                              {viewData?.kvar}bar
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="tank-header">
                              Formula Value -{" "}
                            </span>
                            <span className="tank-date">
                              {viewData?.formula_value}KL
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="tank-header">Cap</span>
                            <span className="tank-date">
                              -{viewData?.cap}KL
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : viewData?.device_type === 1 ? (
                <div
                  className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
      ${commonstyle.cards_padding} new-details tank-bgcolor`}
                >
                  <div className={devicestyle.tank_level}>
                    <div className="motor-level">
                      <div className="inputWidth">
                        {editDevice && deviceId === viewData.device_id ? (
                          <input
                            autoFocus
                            key={tankinputdata.device_name}
                            type="text"
                            className={devicestyle.device_name_input}
                            onChange={(e) => {
                              settankinputdata((pre) => ({
                                ...pre,
                                device_name: e.target.value,
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
                                <strong>{viewData?.device_name}</strong>
                              </Tooltip>
                            }
                          >
                            <p
                              className={`${devicestyle.device_name} ${devicestyle.device_name_tank_col}`}
                            >
                              {viewData?.device_name}
                            </p>
                          </OverlayTrigger>
                        )}
                      </div>

                      {viewData?.tower ? (
                        <>
                          <img
                            src={
                              viewData?.tower >= 20 && viewData?.tower <= 39
                                ? ExportedImages.TOWER_ICON1
                                : viewData?.tower >= 40 && viewData?.tower <= 59
                                ? ExportedImages.TOWER_ICON2
                                : viewData?.tower >= 60 && viewData?.tower <= 79
                                ? ExportedImages.TOWER_ICON3
                                : viewData?.tower >= 80 && viewData?.tower <= 99
                                ? ExportedImages.TOWER_ICON4
                                : viewData?.tower === 100
                                ? ExportedImages.TOWER_ICON5
                                : ExportedImages.EMPTY_TOWER_ICON
                            }
                            alt="tower"
                            style={{ width: "30px" }}
                          />
                          <p className={devicestyle.devicetowerpercentage}>
                            {viewData?.tower}%
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
                      {viewData?.device_time ? (
                        <p className="tank-date">{viewData?.device_time}</p>
                      ) : null}
                      {/* <img
                      src={
                        editDevice && deviceId == viewData.device_id
                          ? save
                          : !editDevice
                          ? edit
                          : null
                      }
                      onClick={(e) => {
                        setEditDevice(!editDevice);
                        setDeviceId(viewData.device_id);
                        UpdateDevie(viewData.device_id, viewData.device_type);
                        settankinputdata({
                          ...tankinputdata,
                          device_name: viewData.device_name,
                          tank_height: viewData.tank_height,
                          high_limit: viewData.high_limit,
                          low_limit: viewData.low_limit,
                          latitude: viewData.latitude,
                          longitude: viewData.longitude,
                          high_limit_action: viewData.high_limit_action,
                          low_limit_action: viewData.low_limit_action,
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
                        {viewData.device_code}{" "}
                      </span>
                    </p>

                    {viewData.device_id === loaderId && isloading ? (
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
                          loadingspinner(
                            viewData.device_id,
                            viewData.device_type ///1 tank
                          );
                          setLoaderId(viewData.device_id);
                        }}
                      />
                    )}

                    <div className="btnWidth">
                      <button
                        type="button"
                        className="settings-btn"
                        onClick={(e) => {
                          loadingspinner(
                            viewData.device_id,
                            5,
                            viewData.device_type
                          ); //setting loader tank
                          setSettingLoaderId(viewData.device_id);
                        }}
                      >
                        {settingLoaderId === viewData.device_id &&
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
                            // id={viewData?.indication === 1 ? "limitblink" : null}
                          >
                            High Limit -{" "}
                          </span>
                          {viewData.device_id === deviceId && editDevice ? (
                            <input
                              autoFocus
                              key={tankinputdata?.high_limit}
                              type="text"
                              maxLength={10}
                              onKeyPress={avoidletters}
                              className={
                                editDevice && viewData.device_id === deviceId
                                  ? "location"
                                  : "devicebg tank-date"
                              }
                              onChange={(e) => {
                                settankinputdata({
                                  ...tankinputdata,
                                  high_limit: e.target.value,
                                });
                              }}
                              value={tankinputdata?.high_limit}
                            />
                          ) : (
                            <span className="tank-date">
                              {viewData?.high_limit}
                            </span>
                          )}
                          &nbsp;&nbsp;
                          {viewData.device_id === deviceId && editDevice ? (
                            <select
                              className={
                                viewData.device_id === deviceId && editDevice
                                  ? "location"
                                  : "devicebg"
                              }
                              onClick={(e) => {
                                settankinputdata({
                                  ...tankinputdata,
                                  high_limit_action: JSON.parse(e.target.value),
                                });
                              }}
                            >
                              <option
                                value="0"
                                selected={
                                  viewData?.high_limit_action === 0
                                    ? true
                                    : false
                                }
                              >
                                No Action
                              </option>
                              <option
                                value="1"
                                selected={
                                  viewData?.high_limit_action === 1
                                    ? true
                                    : false
                                }
                              >
                                Off Motor
                              </option>
                              <option
                                value="2"
                                selected={
                                  viewData?.high_limit_action === 2
                                    ? true
                                    : false
                                }
                              >
                                On Motor
                              </option>
                            </select>
                          ) : (
                            <span className="tank-date">
                              {viewData?.high_limit_action === 0
                                ? "No action"
                                : viewData?.high_limit_action === 1
                                ? "Off Motor"
                                : viewData?.high_limit_action === 2
                                ? "On Motor"
                                : null}
                            </span>
                          )}
                        </p>
                        <p className=" input_width">
                          <span
                            className={
                              viewData.device_id === deviceId && editDevice
                                ? "on_edit"
                                : "tank-header"
                            }
                            // id={viewData?.indication === 2 ? "limitblink" : null}
                          >
                            Low Limit -
                          </span>
                          {viewData.device_id === deviceId && editDevice ? (
                            <input
                              type="text"
                              maxLength={10}
                              onKeyPress={avoidletters}
                              className={
                                editDevice && viewData.device_id === deviceId
                                  ? "location"
                                  : "devicebg"
                              }
                              onChange={(e) => {
                                settankinputdata({
                                  ...tankinputdata,
                                  low_limit: e.target.value,
                                });
                              }}
                              value={tankinputdata?.low_limit}
                            />
                          ) : (
                            <span className="tank-date">
                              {viewData?.low_limit}
                            </span>
                          )}
                          &nbsp;&nbsp;
                          {viewData.device_id === deviceId && editDevice ? (
                            <select
                              className={
                                viewData.device_id === deviceId && editDevice
                                  ? "location"
                                  : "devicebg"
                              }
                              onClick={(e) => {
                                settankinputdata({
                                  ...tankinputdata,
                                  low_limit_action: JSON.parse(e.target.value),
                                });
                              }}
                            >
                              <option
                                value="0"
                                selected={
                                  viewData?.low_limit_action === 0
                                    ? true
                                    : false
                                }
                              >
                                No Action
                              </option>
                              <option
                                value="1"
                                selected={
                                  viewData?.low_limit_action === 1
                                    ? true
                                    : false
                                }
                              >
                                Off Motor
                              </option>
                              <option
                                value="2"
                                selected={
                                  viewData?.low_limit_action === 2
                                    ? true
                                    : false
                                }
                              >
                                On Motor
                              </option>
                            </select>
                          ) : (
                            <span className="tank-date">
                              {viewData?.low_limit_action === 0
                                ? "No action"
                                : viewData?.low_limit_action === 1
                                ? "Off Motor"
                                : viewData?.low_limit_action === 2
                                ? "On Motor"
                                : null}
                            </span>
                          )}
                        </p>

                        <p>
                          <span className="tank-header">Tank Height - </span>
                          {editDevice && deviceId === viewData.device_id ? (
                            <input
                              type="text"
                              maxLength={10}
                              onKeyPress={(e) => avoidletters(e)}
                              className={
                                editDevice && deviceId === viewData.device_id
                                  ? "location"
                                  : "devicebg"
                              }
                              onChange={(e) => {
                                settankinputdata({
                                  ...tankinputdata,
                                  tank_height: e.target.value,
                                });
                              }}
                              value={tankinputdata?.tank_height}
                            />
                          ) : (
                            <span className="tank-date">
                              {viewData?.tank_height}
                            </span>
                          )}
                          <span className="tank-date"> ft</span>
                        </p>

                        <p>
                          <span className="tank-header">Location</span>
                          &nbsp;
                          {LocationId === viewData.device_id && isLocation ? (
                            <MdLocationOn className={"locateapi"} />
                          ) : (
                            <MdLocationOn
                              className="locate"
                              onClick={(e) => {
                                setLocationId(viewData.device_id);
                                loadingspinner(
                                  viewData.device_id,
                                  9,
                                  viewData.device_type
                                ); //location tank
                              }}
                            />
                          )}
                          {deviceId === viewData.device_id && editDevice ? (
                            <span className="d-inline-table">
                              <div className="latlan">
                                Lat-
                                <input
                                  type="text"
                                  onKeyPress={latlong}
                                  maxLength={10}
                                  className={
                                    editDevice &&
                                    viewData.device_id === deviceId
                                      ? "location"
                                      : "devicebg"
                                  }
                                  onChange={(e) => {
                                    settankinputdata({
                                      ...tankinputdata,
                                      latitude: e.target.value,
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
                                    viewData.device_id === deviceId
                                      ? "location"
                                      : "devicebg"
                                  }
                                  onChange={(e) => {
                                    settankinputdata({
                                      ...tankinputdata,
                                      longitude: e.target.value,
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
                                {viewData.latitude === ""
                                  ? null
                                  : `${viewData?.latitude} 'N`}
                              </span>
                              <br />
                              Long-
                              <span className="tank-date">
                                {viewData.longitude === ""
                                  ? null
                                  : `${viewData?.longitude} 'E`}
                              </span>
                            </p>
                          )}
                        </p>

                        <p>
                          <span className="tank-header">Water Quality</span>
                          <span className="tank-date">
                            - {viewData?.source === 1 ? "TDS" : "EB"}
                          </span>
                        </p>
                        {viewData?.source === 1 ? (
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                            }}
                          >
                            <p>
                              <span className="tank-header">TDS</span>
                              <span className="tank-date">
                                - {viewData?.battery}
                              </span>
                            </p>
                            <p>
                              <span className="tank-header">PH</span>
                              <span className="tank-date">
                                - {viewData?.solar_panel}
                              </span>
                            </p>
                          </div>
                        ) : null}

                        <p>
                          <span className="tank-header">
                            Hardware Version -{" "}
                          </span>
                          <span className="tank-date">
                            {viewData?.hardware_version}
                          </span>
                        </p>
                        <p>
                          <span className="tank-header">
                            Software Version -{" "}
                          </span>
                          <span className="tank-date">
                            {viewData?.software_version}
                          </span>
                        </p>
                        {viewData?.status != null ? (
                          <p>
                            <span className="tank-header">
                              status&nbsp;:&nbsp;
                            </span>
                            <span
                              className={
                                viewData?.status === -1
                                  ? productionstyle.production_status_deleted
                                  : viewData?.status === 0
                                  ? productionstyle.production_status_inactive
                                  : viewData?.status === 1
                                  ? productionstyle.production_status_on
                                  : viewData?.status === 2
                                  ? productionstyle.production_status_waiting
                                  : viewData?.status === 3
                                  ? productionstyle.production_status_off
                                  : null
                              }
                            >
                              {viewData?.status === -1
                                ? "Deleted"
                                : viewData?.status === 0
                                ? "In Active"
                                : viewData?.status === 1
                                ? "Tested Ok"
                                : viewData?.status === 2
                                ? "Waiting for Test"
                                : viewData?.status === 3
                                ? "Fault"
                                : null}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="detailstank">
                      {viewData?.tank_level !== null ? (
                        <>
                          <p
                            className="waterper  Persentage_size"
                            style={{ top: 95 }}
                          >
                            {viewData?.tank_level !== null
                              ? `${Number(viewData?.tank_level)}%`
                              : null}
                          </p>
                          {viewData?.tank_level >= 1 &&
                          viewData?.tank_level <= 10 ? (
                            <img src={ExportedImages.WATER_TANK_10_GIF} />
                          ) : viewData?.tank_level > 10 &&
                            viewData?.tank_level <= 20 ? (
                            <img src={ExportedImages.WATER_TANK_20_GIF} />
                          ) : viewData?.tank_level > 20 &&
                            viewData?.tank_level <= 30 ? (
                            <img src={ExportedImages.WATER_TANK_30_GIF} />
                          ) : viewData?.tank_level > 30 &&
                            viewData?.tank_level <= 40 ? (
                            <img src={ExportedImages.WATER_TANK_40_GIF} />
                          ) : viewData?.tank_level > 40 &&
                            viewData?.tank_level <= 60 ? (
                            <img src={ExportedImages.WATER_TANK_50_GIF} />
                          ) : viewData?.tank_level > 60 &&
                            viewData?.tank_level <= 70 ? (
                            <img src={ExportedImages.WATER_TANK_60_GIF} />
                          ) : viewData?.tank_level > 70 &&
                            viewData?.tank_level <= 80 ? (
                            <img src={ExportedImages.WATER_TANK_70_GIF} />
                          ) : viewData?.tank_level > 80 &&
                            viewData?.tank_level <= 90 ? (
                            <img src={ExportedImages.WATER_TANK_80_GIF} />
                          ) : viewData?.tank_level > 90 &&
                            viewData?.tank_level <= 95 ? (
                            <img src={ExportedImages.WATER_TANK_90_GIF} />
                          ) : viewData?.tank_level > 95 &&
                            viewData?.tank_level <= 100 ? (
                            <img src={ExportedImages.WATER_TANK_100_GIF} />
                          ) : (
                            <img src={ExportedImages.EMPTY_WATER_TANK} />
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : viewData?.device_type === 2 ? (
                <div
                  className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                    ${commonstyle.cards_padding} new-details flow-bgcolor`}
                >
                  <div className={devicestyle.tank_level}>
                    <div className="motor-level">
                      <div className="inputWidth">
                        {editDevice && deviceId === viewData.device_id ? (
                          <input
                            type="text"
                            maxLength={50}
                            className={devicestyle.device_name_input}
                            onChange={(e) => {
                              setflowinputdata({
                                ...flowinputdata,
                                device_name: e.target.value,
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
                                <strong>{viewData.device_name}</strong>
                              </Tooltip>
                            }
                          >
                            <p
                              className={`${devicestyle.device_name} 
                              ${devicestyle.device_name_flow_col}`}
                            >
                              {viewData.device_name}
                            </p>
                          </OverlayTrigger>
                        )}
                      </div>

                      {viewData?.tower ? (
                        <>
                          <img
                            src={
                              viewData?.tower >= 20 && viewData?.tower <= 39
                                ? ExportedImages.TOWER_ICON1
                                : viewData?.tower >= 40 && viewData?.tower <= 59
                                ? ExportedImages.TOWER_ICON2
                                : viewData?.tower >= 60 && viewData?.tower <= 79
                                ? ExportedImages.TOWER_ICON3
                                : viewData?.tower >= 80 && viewData?.tower <= 99
                                ? ExportedImages.TOWER_ICON4
                                : viewData?.tower === 100
                                ? ExportedImages.TOWER_ICON5
                                : ExportedImages.EMPTY_TOWER_ICON
                            }
                            alt="tower"
                            style={{ width: "30px" }}
                          />
                          <p className={devicestyle.devicetowerpercentage}>
                            {viewData?.tower}%
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
                      {viewData?.device_time ? (
                        <p className="tank-date">{viewData?.device_time}</p>
                      ) : null}
                      {/* <img
                      src={
                        editDevice && deviceId == viewData.device_id
                          ? save
                          : !editDevice
                          ? edit
                          : null
                      }
                      onClick={(e) => {
                        setEditDevice(!editDevice);
                        setDeviceId(viewData.device_id);
                        UpdateDevie(viewData.device_id, viewData.device_type);

                        setflowinputdata({
                          ...flowinputdata,
                          device_name: viewData.device_name,
                          usage_limit: viewData.usage_limit,
                          usage_limit_action: viewData.usage_limit_action,
                          latitude: viewData.latitude,
                          longitude: viewData.longitude,
                          daily_update: viewData.daily_update,
                        });
                      }}
                    /> */}
                    </div>
                  </div>

                  <div className="tank-level-data">
                    <p className="tank-usage">
                      <span className="tank-header">ID - </span>
                      <span className="tank-date">{viewData.device_code}</span>
                    </p>

                    {viewData.device_id === loaderId && isloading ? (
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
                          loadingspinner(
                            viewData.device_id,
                            viewData.device_type //2 flow loader
                          );
                          setLoaderId(viewData.device_id);
                        }}
                      />
                    )}

                    <p className="tank-usage">
                      <span className="tank-header">UsageLimit - </span>
                      {editDevice && viewData.device_id === deviceId ? (
                        <input
                          type="text"
                          className={
                            editDevice && viewData.device_id === deviceId
                              ? "location"
                              : "devicebg"
                          }
                          onChange={(e) => {
                            setflowinputdata({
                              ...flowinputdata,
                              usage_limit: e.target.value,
                            });
                          }}
                          value={flowinputdata?.usage_limit}
                        />
                      ) : (
                        <span className="tank-date">
                          {viewData?.usage_limit}
                        </span>
                      )}
                      &nbsp;&nbsp;
                      {editDevice && viewData.device_id === deviceId ? (
                        <br />
                      ) : null}
                      {editDevice && viewData.device_id === deviceId ? (
                        <select
                          className={
                            editDevice && viewData.device_id === deviceId
                              ? "usagelimit_width"
                              : "devicebg"
                          }
                          onClick={(e) => {
                            setflowinputdata({
                              ...flowinputdata,
                              usage_limit_action: JSON.parse(e.target.value),
                            });
                          }}
                        >
                          <option
                            value="0"
                            selected={
                              viewData?.usage_limit_action === 0 ? true : false
                            }
                          >
                            No action
                          </option>
                          <option
                            value="1"
                            selected={
                              viewData?.usage_limit_action === 1 ? true : false
                            }
                          >
                            off Motor
                          </option>
                        </select>
                      ) : (
                        <span className="tank-date">
                          {viewData.usage_limit_action === 1
                            ? "Off Motor"
                            : viewData.usage_limit_action === 0
                            ? "No Action"
                            : ""}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="sub-details mt-2">
                    <div className="flex-data">
                      <p className="tank-usage">
                        <span className="tank-header">Total usage - </span>
                        <span className="tank-date">
                          {viewData.total_usage}
                        </span>{" "}
                      </p>
                      <p className="tank-usage">
                        <span className="tank-header">Daily Usage - </span>
                        <span className="tank-date">
                          {viewData.today_usage}{(viewData.today_usage ?? "") !== "" ? " KL" : ""}
                        </span>{" "}
                      </p>
                      <p className="tank-usage new-index">
                        <span className="tank-header">Location </span>
                        {LocationId === viewData.device_id && isLocation ? (
                          <MdLocationOn className={"locateapi"} />
                        ) : (
                          <MdLocationOn
                            className="locate"
                            onClick={(e) => {
                              setLocationId(viewData.device_id);
                              loadingspinner(
                                viewData.device_id,
                                10,
                                viewData.device_type
                              ); ///flow location
                            }}
                          />
                        )}
                        &nbsp;
                        {deviceId === viewData.device_id && editDevice ? (
                          <span className="d-inline-table">
                            <div className="latlan">
                              Lat-
                              <input
                                type="text"
                                onKeyPress={latlong}
                                maxLength={10}
                                className={
                                  editDevice && viewData.device_id === deviceId
                                    ? "location"
                                    : "devicebg"
                                }
                                onChange={(e) => {
                                  setflowinputdata({
                                    ...flowinputdata,
                                    latitude: e.target.value,
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
                                  editDevice && viewData.device_id === deviceId
                                    ? "location"
                                    : "devicebg"
                                }
                                onChange={(e) => {
                                  setflowinputdata({
                                    ...flowinputdata,
                                    longitude: e.target.value,
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
                              {viewData.latitude === ""
                                ? null
                                : `${viewData?.latitude} 'N`}
                            </span>
                            <br />
                            Long-
                            <span className="tank-date">
                              {viewData.longitude === ""
                                ? null
                                : `${viewData?.longitude} 'E`}
                            </span>
                          </p>
                        )}
                      </p>
                      <p className="tank-usage">
                        <span className="tank-header">Source - </span>
                        <span className="tank-date">
                          {" "}
                          {viewData?.source === 1 ? "Battery" : "EB"}
                        </span>
                      </p>

                      {viewData?.source === 1 ? (
                        <p className="tank-usage">
                          <span className="tank-header">Battery - </span>
                          <span className="tank-date">
                            {" "}
                            {viewData.battery}{" "}
                          </span>
                        </p>
                      ) : null}
                      {viewData?.source === 1 ? (
                        <p className="tank-usage">
                          <span className="tank-header">Solar Panel - </span>
                          <span className="tank-date">
                            {viewData.solar_panel}
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
                        <span className="tank-header">Flow Rate - </span>
                        <span className="tank-date"> {viewData.flow_rate}</span>
                      </p>

                      <p className="tank-usage">
                        <span className="tank-header">Daily Update - </span>
                        {viewData.device_id === deviceId && editDevice ? (
                          <input
                            type="text"
                            maxLength={4}
                            onKeyPress={avoidletters}
                            className={
                              viewData.device_id === deviceId && editDevice
                                ? "location"
                                : "devicebg"
                            }
                            value={flowinputdata.daily_update}
                            onChange={(e) => {
                              setflowinputdata({
                                ...flowinputdata,
                                daily_update: e.target.value,
                              });
                            }}
                          />
                        ) : (
                          <span className="tank-date">
                            {viewData.daily_update == null
                              ? null
                              : viewData.daily_update}
                          </span>
                        )}
                      </p>
                      <p className="tank-usage">
                        <span className="tank-header">Hardware Version - </span>
                        <span className="tank-date">
                          {" "}
                          {viewData?.hardware_version}
                        </span>
                      </p>

                      <p className="tank-usage">
                        <span className="tank-header">Software Version - </span>
                        <span className="tank-date">
                          {" "}
                          {viewData?.software_version}
                        </span>
                      </p>

                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="settings-btn mb-2"
                          onClick={(e) => {
                            loadingspinner(
                              viewData.device_id,
                              6,
                              viewData.device_type
                            ); //flow settings loader
                            setSettingLoaderId(viewData.device_id);
                          }}
                        >
                          {settingLoaderId === viewData.device_id &&
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
                        <span className="tank-header">Liter/Pulse - </span>
                        <span className="tank-date">
                          {" "}
                          {viewData.lt_per_pulse}
                        </span>
                      </p>
                      {viewData?.status != null ? (
                        <p>
                          <span className="tank-header">
                            status&nbsp;:&nbsp;
                          </span>
                          <span
                            className={
                              viewData?.status === -1
                                ? productionstyle.production_status_deleted
                                : viewData?.status === 0
                                ? productionstyle.production_status_inactive
                                : viewData?.status === 1
                                ? productionstyle.production_status_on
                                : viewData?.status === 2
                                ? productionstyle.production_status_waiting
                                : viewData?.status === 3
                                ? productionstyle.production_status_off
                                : null
                            }
                          >
                            {viewData?.status === -1
                              ? "Deleted"
                              : viewData?.status === 0
                              ? "In Active"
                              : viewData?.status === 1
                              ? "Tested Ok"
                              : viewData?.status === 2
                              ? "Waiting for Test"
                              : viewData?.status === 3
                              ? "Fault"
                              : null}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {/* <div className="sub-details mb-2"></div> */}
                </div>
              ) : viewData?.device_type === 3 ? (
                <div
                  className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
        ${commonstyle.cards_padding} new-details value-bgcolor`}
                >
                  <div className={devicestyle.tank_level}>
                    <div className="motor-level">
                      <div className="inputWidth">
                        {editDevice && deviceId === viewData.device_id ? (
                          <input
                            type="text"
                            maxLength={50}
                            className={devicestyle.device_name_input}
                            onChange={(e) => {
                              setvalveinputdata({
                                ...valveinputdata,
                                device_name: e.target.value,
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
                                <strong>{viewData.device_name}</strong>
                              </Tooltip>
                            }
                          >
                            <p
                              className={`${devicestyle.device_name} ${devicestyle.device_name_valve_col}`}
                            >
                              {viewData.device_name}
                            </p>
                          </OverlayTrigger>
                        )}
                      </div>

                      {viewData?.tower ? (
                        <>
                          {" "}
                          <img
                            src={
                              viewData?.tower >= 20 && viewData?.tower <= 39
                                ? ExportedImages.TOWER_ICON1
                                : viewData?.tower >= 40 && viewData?.tower <= 59
                                ? ExportedImages.TOWER_ICON2
                                : viewData?.tower >= 60 && viewData?.tower <= 79
                                ? ExportedImages.TOWER_ICON3
                                : viewData?.tower >= 80 && viewData?.tower <= 99
                                ? ExportedImages.TOWER_ICON4
                                : viewData?.tower === 100
                                ? ExportedImages.TOWER_ICON5
                                : ExportedImages.EMPTY_TOWER_ICON
                            }
                            alt="tower"
                            style={{ width: "30px" }}
                          />
                          <p className={devicestyle.devicetowerpercentage}>
                            {viewData?.tower}%
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
                      {viewData?.device_time ? (
                        <p className="tank-date">{viewData?.device_time}</p>
                      ) : null}
                      {/* <img
                      src={
                        editDevice && deviceId == viewData.device_id
                          ? save
                          : !editDevice
                          ? edit
                          : null
                      }
                      onClick={(e) => {
                        setEditDevice(!editDevice);
                        setDeviceId(viewData.device_id);
                        UpdateDevie(viewData.device_id, viewData.device_type);

                        setvalveinputdata({
                          ...valveinputdata,
                          device_name: viewData.device_name,
                          latitude: viewData.latitude,
                          longitude: viewData.longitude,
                        });
                      }}
                    /> */}
                    </div>
                  </div>

                  <div className="tank-level-data">
                    <p className="tank-usage">
                      <span className="tank-header">ID - </span>
                      <span className="tank-date">{viewData.device_code}</span>
                    </p>

                    {viewData.device_id === loaderId && isloading ? (
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
                          loadingspinner(
                            viewData.device_id,
                            viewData.device_type ///3 valve loader
                          );
                          setLoaderId(viewData.device_id);
                        }}
                      />
                    )}
                    <div className="valvebuttonflex">
                      <p className="tank-header">{viewData.operated_by}</p>

                      {viewData.device_id === ButtonId ? (
                        <CommonSwitch
                          color={"grey"}
                          checked={viewData.valve_status === 1 ? true : false}
                          onChange={({ status }) => {
                            Changebutton(viewData.device_id, status, 3);
                          }}
                          type={3}
                        />
                      ) : (
                        <CommonSwitch
                          type={3}
                          checked={viewData.valve_status === 1 ? true : false}
                          onChange={({ status }) => {
                            Changebutton(viewData.device_id, status, 3);
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
                          {viewData.valve_mode === 1
                            ? "Daily"
                            : viewData.valve_mode === 2
                            ? "Weekly"
                            : "Manual"}
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
                          loadingspinner(
                            viewData.device_id,
                            7,
                            viewData.device_type
                          ); //setting loader valve
                          setSettingLoaderId(viewData.device_id);
                        }}
                      >
                        {settingLoaderId === viewData.device_id &&
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
                    {LocationId === viewData.device_id && isLocation ? (
                      <MdLocationOn className={"locateapi"} />
                    ) : (
                      <MdLocationOn
                        className="locate"
                        onClick={(e) => {
                          setLocationId(viewData.device_id);
                          loadingspinner(
                            viewData.device_id,
                            11,
                            viewData.device_type
                          ); //valve location
                        }}
                      />
                    )}
                    {deviceId === viewData.device_id && editDevice ? (
                      <span className="d-inline-table">
                        <div className="latlan">
                          Lat-
                          <input
                            type="text"
                            onKeyPress={latlong}
                            maxLength={10}
                            className={
                              editDevice && viewData.device_id === deviceId
                                ? "location"
                                : "devicebg"
                            }
                            onChange={(e) => {
                              setvalveinputdata({
                                ...valveinputdata,
                                latitude: e.target.value,
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
                              editDevice && viewData.device_id === deviceId
                                ? "location"
                                : "devicebg"
                            }
                            onChange={(e) => {
                              setvalveinputdata({
                                ...valveinputdata,
                                longitude: e.target.value,
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
                          {viewData.latitude === ""
                            ? null
                            : `${viewData?.latitude} 'N`}
                        </span>
                        <br />
                        Long-
                        <span className="tank-date">
                          {viewData.longitude === ""
                            ? null
                            : `${viewData?.longitude} 'E`}
                        </span>
                      </p>
                    )}
                  </p>

                  <p className="tank-usage">
                    {" "}
                    <span className="tank-header">Source-</span>
                    &nbsp;
                    <span className="tank-date">
                      {viewData?.source === 1 ? "Battery" : "EB"}
                    </span>
                  </p>

                  {viewData?.source === 1 ? (
                    <p className="tank-usage">
                      {" "}
                      <span className="tank-header">Battery-</span>
                      &nbsp;
                      <span className="tank-date">{viewData?.battery}</span>
                    </p>
                  ) : null}
                  {viewData?.source === 1 ? (
                    <p className="tank-usage">
                      {" "}
                      <span className="tank-header">Solar panel-</span>
                      &nbsp;
                      <span className="tank-date">{viewData?.solar_panel}</span>
                    </p>
                  ) : null}
                  <p className="tank-usage">
                    {" "}
                    <span className="tank-header">Software Version-</span>
                    &nbsp;
                    <span className="tank-date">
                      {viewData?.software_version}
                    </span>
                  </p>
                  <p className="tank-usage">
                    {" "}
                    <span className="tank-header">Hardware Version-</span>
                    &nbsp;
                    <span className="tank-date">
                      {viewData?.hardware_version}
                    </span>
                  </p>
                  {viewData?.status != null ? (
                    <p>
                      <span className="tank-header">status&nbsp;:&nbsp;</span>
                      <span
                        className={
                          viewData?.status === -1
                            ? productionstyle.production_status_deleted
                            : viewData?.status === 0
                            ? productionstyle.production_status_inactive
                            : viewData?.status === 1
                            ? productionstyle.production_status_on
                            : viewData?.status === 2
                            ? productionstyle.production_status_waiting
                            : viewData?.status === 3
                            ? productionstyle.production_status_off
                            : null
                        }
                      >
                        {viewData?.status === -1
                          ? "Deleted"
                          : viewData?.status === 0
                          ? "In Active"
                          : viewData?.status === 1
                          ? "Tested Ok"
                          : viewData?.status === 2
                          ? "Waiting for Test"
                          : viewData?.status === 3
                          ? "Fault"
                          : null}
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : viewData?.device_type === 4 ? (
                <div
                  className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                      ${commonstyle.cards_padding}  new-details tank-bgcolor ${devicestyle.margin_zero}`}
                >
                  <div className="setting-top-bar">
                    <div className="setting-sub-bar">
                      {viewData.device_id === deviceId && editDevice ? (
                        <input
                          autoFocus
                          key={tankinputdata.device_name}
                          type="text"
                          className={devicestyle.device_name_input}
                          onChange={(e) => {
                            setlightinputdata((pre) => ({
                              ...pre,
                              device_name: e.target.value,
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
                              <strong>{viewData.device_name}</strong>
                            </Tooltip>
                          }
                        >
                          <p
                            className={`${devicestyle.device_name} ${devicestyle.device_name_light_col}`}
                          >
                            {viewData.device_name}
                          </p>
                        </OverlayTrigger>
                      )}

                      {viewData?.tower ? (
                        <>
                          <img
                            src={
                              viewData?.tower >= 20 && viewData?.tower <= 39
                                ? ExportedImages.TOWER_ICON1
                                : viewData?.tower >= 40 && viewData?.tower <= 59
                                ? ExportedImages.TOWER_ICON2
                                : viewData?.tower >= 60 && viewData?.tower <= 79
                                ? ExportedImages.TOWER_ICON3
                                : viewData?.tower >= 80 && viewData?.tower <= 99
                                ? ExportedImages.TOWER_ICON4
                                : viewData?.tower === 100
                                ? ExportedImages.TOWER_ICON5
                                : ExportedImages.EMPTY_TOWER_ICON
                            }
                            alt="tower"
                            style={{ width: "30px" }}
                            className="lightTower"
                          />
                          <span
                            className={devicestyle.devicetowerpercentagelight}
                          >
                            {viewData?.tower}%
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
                      {viewData.device_id === ButtonId ? (
                        <Toggle
                          buttoncol={"grey"}
                          // id={index}
                          isChecked={viewData.light_status === 1 ? true : false}
                          handleChange={({ status }) => {
                            Changebutton(viewData.device_id, status, 4);
                          }}
                        />
                      ) : (
                        <Toggle
                          // id={index}
                          isChecked={viewData.light_status === 1 ? true : false}
                          handleChange={({ status }) => {
                            Changebutton(viewData.device_id, status, 4);
                          }}
                        />
                      )}

                      <div className={devicestyle.edit_date}>
                        {/* {viewData?.device_time ? (
                        <p className="tank-date">{viewData?.device_time}</p>
                      ) : null} */}
                        {/* <img
                        src={
                          editDevice && deviceId == viewData.device_id
                            ? save
                            : !editDevice
                            ? edit
                            : null
                        }
                        onClick={(e) => {
                          setEditDevice(!editDevice);
                          setDeviceId(viewData.device_id);
                          UpdateDevie(viewData.device_id, viewData.device_type);

                          setlightinputdata({
                            ...lightinputdata,
                            device_name: viewData.device_name,
                            dim: viewData.dim_level,
                            time1: viewData.time1,
                            time2: viewData.time2,
                            latitude: viewData.latitude,
                            longitude: viewData.longitude,
                          });
                        }}
                      /> */}
                      </div>
                    </div>
                  </div>

                  <div className="setting-top-bar setting-height">
                    <p className="tank-usage d-grid pb-2">
                      <span className="tank-header">Last Update - </span>
                      <span className="tank-date">
                        {viewData?.device_time != null
                          ? viewData?.device_time.includes("T")
                            ? moment(viewData?.device_time).format(
                                "DD-MM-YYYY HH:mm:ss"
                              )
                            : viewData?.device_time
                          : null}
                      </span>
                    </p>
                    <p>
                      {viewData.device_id === loaderId && isloading ? (
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
                            loadingspinner(
                              viewData.device_id,
                              viewData.device_type ///4 light loader
                            );
                            setLoaderId(viewData.device_id);
                          }}
                        />
                      )}
                    </p>
                    <p className="tank-usage d-grid">
                      <span className="tank-header">Status Update - </span>
                      <span className="tank-date">
                        {viewData?.on_off_time != null
                          ? viewData?.on_off_time.includes("T")
                            ? moment(viewData?.on_off_time).format(
                                "DD-MM-YYYY HH:mm:ss"
                              )
                            : viewData?.on_off_time
                          : null}
                      </span>
                    </p>
                  </div>

                  <div className="setting-top-bar">
                    <p className="tank-usage mb-0">
                      <span className="tank-header">ID - </span>
                      <span className="tank-date">{viewData?.device_code}</span>
                    </p>
                    <p className="tank-usage">
                      <span className="tank-header">volts - </span>
                      <span className="tank-date">
                        <span>{viewData?.volts}</span>
                      </span>
                    </p>
                  </div>

                  <div className="setting-top-bar">
                    <p className="tank-usage">
                      <span className="tank-header">Dim - </span>
                      {viewData.device_id === deviceId && editDevice ? (
                        <input
                          type="text"
                          className={
                            viewData.device_id === deviceId && editDevice
                              ? "location"
                              : "devicebg"
                          }
                          onChange={(e) => {
                            setlightinputdata({
                              ...lightinputdata,
                              dim: e.target.value,
                            });
                          }}
                          value={lightinputdata.dim}
                        />
                      ) : (
                        <span className="tank-date">{viewData.dim_level}%</span>
                      )}
                    </p>
                    <p className="tank-usage">
                      <span className="tank-header">Amps - </span>
                      <span className="tank-date">{viewData?.amps}</span>
                    </p>
                  </div>

                  <div className="setting-top-bar">
                    <p className="tank-usage">
                      <span className="tank-header">burning hour - </span>
                      <span className="tank-date">
                        <span>{viewData?.burning_hrs}</span>
                      </span>
                    </p>
                    <p className="tank-usage">
                      <span className="tank-header">PF - </span>
                      <span className="tank-date">
                        <span>{viewData?.pf}</span>
                      </span>
                    </p>
                  </div>

                  <div className="setting-top-bar">
                    <p className="tank-usage mb-0">
                      <span className="tank-header">Location</span>
                      &nbsp;
                      {LocationId === viewData.device_id && isLocation ? (
                        <MdLocationOn className={"locateapi"} />
                      ) : (
                        <MdLocationOn
                          className="locate"
                          onClick={(e) => {
                            setLocationId(viewData.device_id);
                            loadingspinner(
                              viewData.device_id,
                              12,
                              viewData.device_type
                            ); //light location
                          }}
                        />
                      )}
                    </p>

                    {/* <p className="tank-usage">
                    <span className="tank-header">on time - </span>
                    <span className="tank-date">
                      {deviceId === viewData.device_id && editDevice ? (
                        <TimePicker
                          className={
                            deviceId === viewData.device_id && editDevice
                              ? "light_device_ontime"
                              : "devicebg devicebgwidth"
                          }
                          defaultValue={
                            lightinputdata?.on_time != null
                              ? moment("2220-08-05 " + lightinputdata?.on_time)
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
                        <span>{viewData?.on_time}</span>
                      )}
                    </span>
                  </p> */}
                  </div>
                  <div className="setting-top-bar">
                    <p>
                      <span className="tank-header"></span>
                      {deviceId === viewData.device_id && editDevice ? (
                        <span>
                          Lat&nbsp;
                          <input
                            onKeyPress={latlong}
                            type="text"
                            className={
                              deviceId === viewData.device_id && editDevice
                                ? "location"
                                : "non-edit"
                            }
                            onChange={(e) => {
                              setlightinputdata({
                                ...lightinputdata,
                                latitude: e.target.value,
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
                            {viewData?.latitude != null ||
                            viewData?.latitude != ""
                              ? viewData?.latitude
                              : null}
                            'N
                          </span>
                        </p>
                      )}
                    </p>
                    {/* <p className="tank-usage">
                    <span className="tank-header">off time - </span>
                    <span className="tank-date">
                      {deviceId === viewData.device_id && editDevice ? (
                        <TimePicker
                          className={
                            deviceId === viewData.device_id && editDevice
                              ? "light_device_ontime"
                              : "devicebg devicebgwidth"
                          }
                          defaultValue={
                            viewData?.off_time != null
                              ? moment("2220-08-05 " + viewData?.off_time)
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
                        <span>{viewData?.off_time}</span>
                      )}
                    </span>
                  </p> */}
                    {viewData?.status != null ? (
                      <p>
                        <span className="tank-header">status&nbsp;:&nbsp;</span>
                        <span
                          className={
                            viewData?.status === -1
                              ? productionstyle.production_status_deleted
                              : viewData?.status === 0
                              ? productionstyle.production_status_inactive
                              : viewData?.status === 1
                              ? productionstyle.production_status_on
                              : viewData?.status === 2
                              ? productionstyle.production_status_waiting
                              : viewData?.status === 3
                              ? productionstyle.production_status_off
                              : null
                          }
                        >
                          {viewData?.status === -1
                            ? "Deleted"
                            : viewData?.status === 0
                            ? "In Active"
                            : viewData?.status === 1
                            ? "Tested Ok"
                            : viewData?.status === 2
                            ? "Waiting for Test"
                            : viewData?.status === 3
                            ? "Fault"
                            : null}
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <div className="setting-top-bar">
                    {deviceId === viewData.device_id && editDevice ? (
                      <>
                        <span>
                          Long&nbsp;
                          <input
                            onKeyPress={latlong}
                            type="text"
                            className={
                              deviceId === viewData.device_id && editDevice
                                ? "location"
                                : "non-edit"
                            }
                            onChange={(e) => {
                              setlightinputdata({
                                ...lightinputdata,
                                longitude: e.target.value,
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
                          {viewData.longitude != null ||
                          viewData.longitude != ""
                            ? viewData?.longitude
                            : null}
                          'E
                        </span>
                      </p>
                    )}
                    <button
                      type="button"
                      className="settings-btn "
                      onClick={(e) => {
                        loadingspinner(
                          viewData.device_id,
                          8,
                          viewData.device_type
                        ); //light settings loader
                        setSettingLoaderId(viewData.device_id);
                      }}
                    >
                      {settingLoaderId === viewData.device_id &&
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
                  {viewData?.status != null ? (
                    <p>
                      <span className="tank-header">status&nbsp;:&nbsp;</span>
                      <span
                        className={
                          viewData?.status === -1
                            ? productionstyle.production_status_deleted
                            : viewData?.status === 0
                            ? productionstyle.production_status_inactive
                            : viewData?.status === 1
                            ? productionstyle.production_status_on
                            : viewData?.status === 2
                            ? productionstyle.production_status_waiting
                            : viewData?.status === 3
                            ? productionstyle.production_status_off
                            : null
                        }
                      >
                        {viewData?.status === -1
                          ? "Deleted"
                          : viewData?.status === 0
                          ? "In Active"
                          : viewData?.status === 1
                          ? "Tested Ok"
                          : viewData?.status === 2
                          ? "Waiting for Test"
                          : viewData?.status === 3
                          ? "Fault"
                          : null}
                      </span>
                    </p>
                  ) : null}
                </div> */}
                </div>
              ) : viewData?.device_type === 5 ? (
                <div
                  className={`${devicestyle.device_details_view} ${commonstyle.cards_border_radius}
                  ${commonstyle.cards_padding} new-details tank-bgcolor mt-2 mw-100 w-100 d-block`}
                >
                  <div className={devicestyle.tank_level}>
                    <div className="motor-level">
                      <div className="inputWidth">
                        <OverlayTrigger
                          key="top"
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top">
                              <strong>{viewData?.device_name}</strong>
                            </Tooltip>
                          }
                        >
                          <p
                            className={`${devicestyle.device_name} `}
                            style={{ background: "#FF9D23" }}
                          >
                            {viewData?.device_name}
                          </p>
                        </OverlayTrigger>
                      </div>

                      {viewData?.tower ? (
                        <>
                          <img
                            src={
                              viewData?.tower >= 20 && viewData?.tower <= 39
                                ? ExportedImages.TOWER_ICON1
                                : viewData?.tower >= 40 && viewData?.tower <= 59
                                ? ExportedImages.TOWER_ICON2
                                : viewData?.tower >= 60 && viewData?.tower <= 79
                                ? ExportedImages.TOWER_ICON3
                                : viewData?.tower >= 80 && viewData?.tower <= 99
                                ? ExportedImages.TOWER_ICON4
                                : viewData?.tower === 100
                                ? ExportedImages.TOWER_ICON5
                                : ExportedImages.EMPTY_TOWER_ICON
                            }
                            alt="tower"
                            style={{ width: "30px" }}
                          />
                          <p className={devicestyle.devicetowerpercentage}>
                            {viewData?.tower}%
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
                      {viewData?.device_time ? (
                        <p className="tank-date">{viewData?.device_time}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="tank-level-data">
                    <p className={commonstyle.margin_zero}>
                      <span className="tank-header">ID - </span>
                      <span className="tank-date">{viewData.device_code}</span>
                    </p>
                    {/* LOADING IMAGE */}
                    {viewData.device_id === loaderId && isloading ? (
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
                          loadingspinner(
                            viewData.device_id,
                            9,
                            viewData.device_type
                          );
                          setLoaderId(viewData.device_id);
                        }}
                      />
                    )}
                    {/* END */}

                    <div className="btnWidth">
                      <button
                        type="button"
                        className="settings-btn"
                        onClick={(e) => {
                          loadingspinner(
                            viewData.device_id,
                            10,
                            viewData.device_type
                          ); //setting loader tank
                          setSettingLoaderId(viewData.device_id);
                        }}
                      >
                        {settingLoaderId === viewData.device_id &&
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

                  <div className="sub-details w-100">
                    <div className="detailsflex">
                      <div className="d-flex flex-row">
                        <p className="tank-header">Location</p>
                        {LocationId === viewData.device_id && isLocation ? (
                          <MdLocationOn
                            className={
                              // controllerdata?.access_type === 3
                              //   ? "locate"
                              //   :
                              "locateapi"
                            }
                          />
                        ) : (
                          <MdLocationOn
                            className="locate"
                            onClick={() => {
                              setLocationId(viewData.device_id);
                              loadingspinner(
                                viewData.device_id,
                                12,
                                viewData.device_type
                              );
                            }}
                          />
                        )}
                        <div className="tank-usage">
                          <Checkbox
                            checked={viewData?.is_fixed}
                            disabled={true}
                          />
                          &nbsp;
                          <span className="tank-header">is Fixed</span>
                        </div>
                      </div>
                      <div className="tank-header">
                        Lat-
                        <span className="tank-date">
                          {viewData.latitude === ""
                            ? null
                            : `${viewData?.latitude} 'N`}
                        </span>
                        &nbsp; &nbsp; Long-
                        <span className="tank-date">
                          {viewData.longitude === ""
                            ? null
                            : `${viewData?.longitude} 'E`}
                        </span>
                      </div>
                      {viewData?.reserved1 && (
                        <p className="tank-header">{viewData?.reserved1}</p>
                      )}
                      {viewData?.reserved2 && (
                        <p className="tank-header">{viewData?.reserved2}</p>
                      )}{" "}
                      {viewData?.reserved3 && (
                        <p className="tank-header">{viewData?.reserved3}</p>
                      )}{" "}
                      {viewData?.reserved4 && (
                        <p className="tank-header">{viewData?.reserved4}</p>
                      )}
                    </div>
                    <div className="detailsflex">
                      <p>
                        <span className="tank-header">Water Quality</span>
                        <span className="tank-date">
                          - {viewData?.source === 1 ? "TDS" : "EB"}
                        </span>
                      </p>
                      {viewData?.source === 1 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <p>
                            <span className="tank-header">TDS</span>
                            <span className="tank-date">
                              - {viewData?.battery}
                            </span>
                          </p>
                          <p>
                            <span className="tank-header">PH</span>
                            <span className="tank-date">
                              - {viewData?.solar_panel}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="detailsflex">
                      <p>
                        <span className="tank-header">Hardware Version -</span>
                        <span className="tank-date">
                          {viewData?.hardware_version}
                        </span>
                      </p>
                      <p>
                        <span className="tank-header">Software Version -</span>
                        <span className="tank-date">
                          {viewData?.software_version}
                        </span>
                      </p>
                    </div>
                  </div>
                  <hr />
                  <div>
                    <Row gutter={[10, 10]}>
                      {viewData?.level_data?.length > 0 ? (
                        <Col xs={24}>
                          <Row gutter={[10, 10]}>
                            <Col xs={24}>
                              <p className={commonstyle.deviceHeader}>Tank</p>
                            </Col>
                            {viewData?.level_data?.map(
                              (tankItem, tankIndex) => {
                                return (
                                  <Col sm={24} md={12} lg={12} xl={8}>
                                    <div className={commonstyle.CartItemBox}>
                                      <div className={commonstyle.rowStyle}>
                                        <div className="inputWidth">
                                          <OverlayTrigger
                                            key="top"
                                            placement="top"
                                            overlay={
                                              <Tooltip id="tooltip-top">
                                                <strong>
                                                  {tankItem?.device_name}
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
                                        </div>
                                      </div>
                                      <div
                                        className={`${commonstyle.rowStyle} align-items-start`}
                                      >
                                        <div
                                          className={devicestyle.RowLineFlex}
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
                                              <span className="tank-date">
                                                {tankItem?.high_limit}
                                              </span>
                                              &nbsp;&nbsp;
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
                                              <span className="tank-date">
                                                {tankItem?.low_limit}
                                              </span>

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
                                            </div>
                                          </p>

                                          <p className="input_width mb-0">
                                            <span className="tank-header">
                                              Tank Dia -{" "}
                                            </span>

                                            <span className="tank-date">
                                              {tankItem?.tank_width !== null
                                                ? tankItem?.tank_width
                                                : "-"}
                                            </span>

                                            <span className="tank-date">
                                              {" "}
                                              ft
                                            </span>
                                          </p>
                                        </div>
                                        <div
                                          className={devicestyle.RowLineFlex}
                                        >
                                          <p className="input_width mb-0">
                                            <span className={"tank-header"}>
                                              Tank Level -
                                            </span>{" "}
                                            <span className="tank-date">
                                              {tankItem?.tank_level || 0}%
                                            </span>
                                          </p>
                                          <p>
                                            <span className="tank-header">
                                              Tank Height -
                                            </span>

                                            <span className="tank-date">
                                              {tankItem?.tank_height !== null
                                                ? tankItem?.tank_height
                                                : "-"}
                                            </span>
                                            <span className="tank-date">
                                              {" "}
                                              ft
                                            </span>
                                          </p>
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
                      {viewData?.flow_data?.length > 0 ? (
                        <Col xs={24}>
                          <Row gutter={[10, 10]}>
                            <Col xs={24}>
                              <p className={commonstyle.deviceHeader}>Flow</p>
                            </Col>
                            {viewData?.flow_data?.map((flowItem, tankIndex) => {
                              return (
                                <Col sm={24} md={12} lg={12} xl={8}>
                                  <div className={commonstyle.CartItemBox}>
                                    <div className={commonstyle.rowStyle}>
                                      <div className="inputWidth">
                                        <OverlayTrigger
                                          key="top"
                                          placement="top"
                                          overlay={
                                            <Tooltip id="tooltip-top">
                                              <strong>
                                                {flowItem?.device_name}
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
                                      </div>
                                    </div>

                                    <div className={commonstyle.rowStyle}>
                                      <p className="input_width mb-0">
                                        <span className="tank-header">
                                          Usage Limit -{" "}
                                        </span>
                                        <div
                                          className={
                                            devicestyle.editFiledContainer
                                          }
                                        >
                                          <span className="tank-date">
                                            {flowItem?.usage_limit}
                                          </span>
                                          &nbsp;&nbsp;
                                          <span className="tank-date">
                                            {flowItem.usage_limit_action === 1
                                              ? "Off Motor"
                                              : flowItem.usage_limit_action ===
                                                0
                                              ? "No Action"
                                              : ""}
                                          </span>
                                        </div>
                                      </p>

                                      <p className="tank-usage">
                                        <span className="tank-header">
                                          Daily Usage -{" "}
                                        </span>
                                        <span className="tank-date">
                                          {flowItem.today_usage}{(flowItem.today_usage ?? "") !== "" ? " KL" : ""}
                                        </span>
                                      </p>
                                    </div>
                                    <div className={commonstyle.rowStyle}>
                                      <div>
                                        <p className="tank-usage">
                                          <span className="tank-header">
                                            Total usage -{" "}
                                          </span>
                                          <span className="tank-date">
                                            {flowItem.total_usage} kL
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              );
                            })}
                          </Row>
                        </Col>
                      ) : null}
                      {viewData?.valve_data?.length > 0 ? (
                        <Col xs={24}>
                          <Row gutter={[10, 10]}>
                            <Col xs={24}>
                              <p className={commonstyle.deviceHeader}>Valve</p>
                            </Col>
                            {viewData?.valve_data?.map(
                              (valveItem, tankIndex) => {
                                return (
                                  <Col sm={24} md={12} lg={12} xl={8}>
                                    <div className={commonstyle.CartItemBox}>
                                      <div className={commonstyle.rowStyle}>
                                        <div className="inputWidth">
                                          <OverlayTrigger
                                            key="top"
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
                                        </div>
                                        <div className="d-flex flex-row align-items-center">
                                          {valveItem?.device_code && (
                                            <p
                                              className={
                                                devicestyle.lineTextStyle
                                              }
                                            >
                                              {valveItem?.device_code}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className={commonstyle.rowStyle}>
                                        <p className="tank-usage d-flex flex-row">
                                          <p
                                            className="tank-header"
                                            style={{ textWrap: "nowrap" }}
                                          >
                                            Mode -{" "}
                                          </p>

                                          <span className="tank-date">
                                            {valveItem.valve_mode === 1
                                              ? "Daily"
                                              : valveItem.valve_mode === 0
                                              ? "Manual"
                                              : valveItem.valve_mode === 2
                                              ? "Weekly"
                                              : ""}
                                          </span>
                                        </p>
                                        <p
                                          className="tank-usage"
                                          style={{
                                            display: "flex",
                                            gap: 8,
                                          }}
                                        >
                                          <span className="tank-date">
                                            {valveItem.operated_by}
                                          </span>
                                          <CommonSwitch
                                            checked={
                                              valveItem.valve_status === 1
                                                ? true
                                                : false
                                            }
                                            type={3}
                                            disabled={true}
                                          />
                                        </p>
                                      </div>
                                      <div className={commonstyle.rowStyle}>
                                        <div>
                                          <p
                                            className="tank-date mergetankname NoWrapStyle"
                                            style={{
                                              alignItems: "flex-start",
                                              display: "flex",
                                            }}
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
                                      </div>
                                      {/* {valveItem.deviceMerge?.length !== 2 && (
                                        <p
                                          className="devicemergeInputblock"
                                          style={{
                                            display:
                                              !valveItem.deviceMerge?.length &&
                                              usertype === 3
                                                ? "none"
                                                : "",
                                          }}
                                        >
                                          {usertype !== 3 ? "Merge" : ""}

                                          {!mergeDeviceLength(valveItem) &&
                                            mergerDevice.action &&
                                            mergerDevice?.parent_device_id ===
                                              valveItem.device_id && (
                                              <input
                                                type="text"
                                                className="mergeInput filedPickBackground"
                                                value={mergerDevice.device_code}
                                                maxLength={18}
                                                onChange={(event) => {
                                                  setMergerDevice((pre) => ({
                                                    ...pre,
                                                    device_code:
                                                      event.target.value,
                                                  }));
                                                }}
                                              />
                                            )}
                                          {!mergeDeviceLength(valveItem) &&
                                            usertype !== 3 && (
                                              <img
                                                src={
                                                  mergerDevice.action &&
                                                  mergerDevice?.parent_device_id ===
                                                    valveItem.device_id
                                                    ? ExportedImages.SAVED_TICK_ICON
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
                                                  if (
                                                    mergerDevice.action &&
                                                    mergerDevice?.parent_device_id ===
                                                      valveItem.device_id
                                                  ) {
                                                    if (
                                                      mergerDevice.device_code >
                                                      0
                                                    ) {
                                                      HandlecheckDeviceType(
                                                        mergerDevice.device_code,
                                                        "device"
                                                      );
                                                    }
                                                  } else {
                                                    setMergerDevice((pre) => ({
                                                      child_device_id: "",
                                                      child_device_code: "",
                                                      parent_device_id:
                                                        valveItem?.device_id,
                                                      is_tank: false,
                                                      action:
                                                        mergerDevice?.parent_device_id ===
                                                          valveItem.device_id &&
                                                        mergerDevice.action
                                                          ? ""
                                                          : "merge",
                                                    }));
                                                  }
                                                }}
                                              />
                                            )}
                                        </p>
                                      )}
                                      {valveItem.deviceMerge?.length
                                        ? valveItem?.deviceMerge?.map(
                                            (item) => {
                                              return (
                                                <div
                                                  className="mergeSettings mergeSettinglimit"
                                                  style={{
                                                    width: "100%",
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
                                                      {usertype !== 3 ? (
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
                                                                tankdata: item,
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
                                                                  merge_id:
                                                                    item?.merge_id,
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
                                                      width: "100%",
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
                                                                  "60px",
                                                              }}
                                                              // onKeyPress={avoidletters}
                                                              className={
                                                                "location filedPickBackground"
                                                              }
                                                              onChange={(e) => {
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
                                                                        e.target
                                                                          .value,
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
                                                              onClick={(e) => {
                                                                setDeviceMergeSettingData(
                                                                  {
                                                                    ...DeviceMergeSettingData,
                                                                    high_limit_action:
                                                                      JSON.parse(
                                                                        e.target
                                                                          .value
                                                                      ),
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
                                                                Off Motor
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
                                                                On Motor
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
                                                                  "60px",
                                                              }}
                                                              // onKeyPress={avoidletters}
                                                              className={
                                                                "location filedPickBackground"
                                                              }
                                                              onChange={(e) => {
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
                                                                        e.target
                                                                          .value,
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
                                                              onClick={(e) => {
                                                                setDeviceMergeSettingData(
                                                                  {
                                                                    ...DeviceMergeSettingData,
                                                                    low_limit_action:
                                                                      JSON.parse(
                                                                        e.target
                                                                          .value
                                                                      ),
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
                                                                Off Motor
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
                                                                On Motor
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
                                                          width: "100%",
                                                        }}
                                                      >
                                                        <span>
                                                          Usage Limit Action-
                                                        </span>
                                                        {DeviceMergeSettingData.isEdit &&
                                                        DeviceMergeSettingData?.merge_id ===
                                                          item?.merge_id ? (
                                                          <>
                                                            <select
                                                              className={
                                                                "location filedPickBackground"
                                                              }
                                                              onClick={(e) => {
                                                                setDeviceMergeSettingData(
                                                                  {
                                                                    ...DeviceMergeSettingData,
                                                                    usage_limit_action:
                                                                      JSON.parse(
                                                                        e.target
                                                                          .value
                                                                      ),
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
                                                                Valve Off
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
                                                                Valve On
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
                                            }
                                          )
                                        : ""} */}
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
              ) : null}
            </div>
          </div>
          {!isMotorView && (
            <>
          <br />
          <div>
            <h3 className={`controller-name total_head`}>Controller</h3>
            <div className={`${classes.controller_padding} status-div `}>
              <div className={classes.subdetail}>
                <div className={classes.status_div_flex}>
                  <p>
                    <span className="allsubhead">
                      Controller Name&nbsp;:&nbsp;
                    </span>
                    <span>{viewData?.controller?.controller_name}</span>
                  </p>
                  <p>
                    <span className="allsubhead">
                      Controller Code&nbsp;:&nbsp;
                    </span>
                    <span>{viewData?.controller?.controller_code}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <br />
          <div style={{ marginBottom: "78px" }}>
            <h3 className={`controller-name total_head`}>History Details</h3>
            <div
              className={`${
                viewData?.history_lt?.length > 0
                  ? `${classes.history_padding} ${devicestyle.history_detail}`
                  : devicestyle.history_detail_nodata_found
              } status-div`}
            >
              {viewData?.history_lt?.length > 0 ? (
                viewData?.history_lt?.map((ele, ind) => {
                  return (
                    <div className={devicestyle.subdetail}>
                      <div className="status-div-flex">
                        <p>
                          <span className="allsubhead">
                            Device Name&nbsp;:&nbsp;
                          </span>

                          <span>{ele?.device_name}</span>
                        </p>
                        &nbsp;&nbsp;
                        {ele?.device_status ? (
                          <p>
                            <span className="allsubhead">
                              status&nbsp;:&nbsp;
                            </span>
                            <span
                              className={
                                ele?.device_status === -1
                                  ? productionstyle.production_status_deleted
                                  : ele?.device_status === 0
                                  ? productionstyle.production_status_inactive
                                  : ele?.device_status === 1
                                  ? productionstyle.production_status_on
                                  : ele?.device_status === 2
                                  ? productionstyle.production_status_waiting
                                  : ele?.device_status === 3
                                  ? productionstyle.production_status_off
                                  : null
                              }
                            >
                              {ele?.device_status === -1
                                ? "Deleted"
                                : ele?.device_status === 0
                                ? "In Active"
                                : ele?.device_status === 1
                                ? "Tested Ok"
                                : ele?.device_status === 2
                                ? "Waiting for Test"
                                : ele?.device_status === 3
                                ? "Fault"
                                : null}
                            </span>
                          </p>
                        ) : null}
                      </div>
                      <div className="status-div-flex">
                        <p>
                          <span className="allsubhead">
                            User Name&nbsp;:&nbsp;
                          </span>

                          <span>{ele?.username}</span>
                        </p>
                      </div>
                      <div className="status-div-flex">
                        <p>
                          <span className="allsubhead">
                            Created At&nbsp;:&nbsp;
                          </span>

                          <span>{ele?.updated_at}</span>
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={classes.nodata_found_in_device_history_view}>
                  no data found
                </p>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
