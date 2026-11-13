import {
  FaArrowLeft,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
// import "../../View/ViewController.modules.css"
import "../ViewController.modules.css";
import ReactPaginate from "react-paginate";
import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  buttonapi,
  devicerefreshapi,
  groupdropdownapi,
  listcontrollerapi,
} from "../../../Service/ApiService";
import {
  UpdatePageState,
  Updatedeletefilter,
  UpdatedeletepageState,
  Updatefilterdata,
  UpdatemotorViewDatas,
} from "../../Store/Config/Configuration";
import Toggle from "../../ToggleButton";
import FilterControllerModal from "../../../Modalcomponents/FilterControllerModal";
import Loader from "../../Loader";

import EmailModal from "../../../Modalcomponents/EmailModal";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import motorstyle from "../ViewController/motorcontroller.module.css";
import {
  GetSessionStorage,
  SetSessionStorage,
} from "../../../Utilities/Storage";
import { getCookie } from "../../../Utilities/Cookie";
import { FindAvilable } from "../../../Utilities/Methods";
import { notification, Tooltip } from "antd";
import BlurComponent from "../BlurComponent";
import { ExportedImages } from "../../../Utilities/ImageExport";
import CommonSwitch from "../../CommonComponents/CommonSwitch";
import MultiDeviceComponent from "../MultiDeviceComponent";

export default function Motornotification() {
  // const [pagestate, setpage] = useState(1);
  let abortcontroller = undefined;

  let navigate = useNavigate();
  let location = useLocation();
  const [isloading, setloading] = useState(false);
  const [refresh, setrefresh] = useState(0);
  const [motorindex, setindex] = useState();
  const [totaldatacount, settotaldata] = useState();
  const [lgShow, setLgShow] = useState(false);
  const [groupname, setgroup] = useState();
  const [loader, setloader] = useState(false);
  const { filterdata } = useSelector((state) => state);
  const [buttongreyid, setbuttongreyid] = useState("");
  const [valvebuttontype, setvalvebuttontype] = useState(1);
  let sessiongroup = JSON.parse(sessionStorage.getItem("groupid"));
  let sessiontype = JSON.parse(sessionStorage.getItem("usertype"));
  const { pagestate } = useSelector((state) => state);
  const sorttype = sessionStorage.getItem("sorttype");
  const [dataList, setDataList] = useState([]);
  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;
  const [showEmail, setEmail] = useState(false);
  let SessionUserId = JSON.parse(GetSessionStorage("mainUserId"));
  const { motor } = SessionUserId || {};

  const toview = (id, data) => {
    navigate("/dashboard/details", {
      state: {
        id: id,
        ControllerFilters: {
          page: pagestate,
          values: filterdata,
        },
      },
    });
    dispatch(UpdatemotorViewDatas(data));
    SetSessionStorage("MotorViewDatas", JSON.stringify(data));
    sessionStorage.setItem(
      "controllerdetailspage",
      "/dashboard/motornotification"
    );
    sessionStorage.setItem("sorttype", 3);
  };

  let dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
    ListController();
  }, [pagestate, refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      ListController(true);
      dispatch(Updatefilterdata(filterdata));
      dispatch(UpdatePageState(pagestate));
    }, 60000);
    return () => clearInterval(interval);
  }, [pagestate, filterdata]);

  const todashboard = () => {
    navigate("/dashboard");
    sessionStorage.removeItem("controllerpage");
    sessionStorage.removeItem("controllerdetailspage");
    dispatch(UpdatePageState(1));
  };

  const ListController = (silent = false) => {
    if (!silent) setloader(true);
    let formData = new FormData();
    formData.append("controller_type", 1);
    formData.append(
      "sort_type",
      filterdata.sortby !== "" ? filterdata.sortby : sorttype
    );
    // formData.append("page", pagestate);
    // formData.append("size", 12);
    if (sessiongroup || filterdata?.groupid) {
      formData.append(
        "group_id",
        filterdata?.groupid ? filterdata?.groupid : sessiongroup
      );
    }
    if (sessiontype || filterdata?.usertype) {
      formData.append(
        "user_type",
        filterdata?.usertype ? filterdata?.usertype : sessiontype
      );
    }
    if (filterdata?.controllername) {
      formData.append("controller_name", filterdata?.controllername);
    }
    if (filterdata?.controllercode) {
      formData.append("controller_code", filterdata?.controllercode);
    }
    if (filterdata?.devicecode) {
      formData.append("device_code", filterdata?.devicecode);
    }

    if (filterdata?.empty_controller) {
      formData.append("empty_controller", 1);
    }
    if (motor?.id || filterdata?.user_id) {
      formData.append(
        "user_id",
        filterdata.user_id !== "" ? filterdata?.user_id || "" : motor?.id
      );
    }
    listcontrollerapi(formData, pagestate)
      .then(({ data }) => {
        setDataList(data.items);
        settotaldata(data.total);
      })
      .catch(() => {})
      .finally(() => setloader(false));

    groupdropdownapi().then(({ data }) => {
      if (data) {
        setgroup(
          data?.map((ele) => ({
            ...ele,
            label: ele?.group_name,
            value: ele?.group_id,
          }))
        );
      } else {
        setgroup([]);
      }
    });
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
        formData.append("device_id", id);
        formData.append("device_type", 3);
        formData.append("request_type", togglestatus ? 3 : 4);
        setbuttongreyid(id);
        devicerefreshapi(formData, abortcontroller)
          .then(({ data }) => {
            setTimeout(() => {
              ListController();
              setbuttongreyid("");
            }, 5000);
          })
          .catch((err) => {});
      } else {
        let formData = new FormData();
        formData.append("controller_id", id);
        formData.append("controller_type", 1);
        formData.append("request_type", togglestatus ? 3 : 4);
        setbuttongreyid(id);
        buttonapi(formData, abortcontroller)
          .then(({ data }) => {
            setTimeout(() => {
              ListController();
              setbuttongreyid("");
            }, 5000);
          })
          .catch((err) => {});
      }
    }
  };

  const loadingspinner = (id, accesstype, devicetype) => {
    if (
      accesstype === 0 ||
      accesstype === 1 ||
      accesstype === null ||
      accesstype === 2
    ) {
      if (devicetype) {
        setloading(true);
        setTimeout(() => {
          setloading(false);
        }, 3000);
        setTimeout(() => {
          setrefresh(refresh + 1);
        }, 5000);
        let formData = new FormData();
        formData.append("device_id", id);
        formData.append("device_type", devicetype);
        formData.append("request_type", 1);

        devicerefreshapi(formData)
          .then(({ data }) => {})
          .catch((err) => {});
      } else {
        setloading(true);

        setTimeout(() => {
          setloading(false);
        }, 3000);

        setTimeout(() => {
          setrefresh(refresh + 1);
        }, 5000);

        let formData = new FormData();
        formData.append("controller_id", id);
        formData.append("controller_type", 1);
        formData.append("request_type", 1);

        buttonapi(formData)
          .then(({ data }) => {})
          .catch((err) => {});
      }
    }
  };
  const currentItems = dataList;
  const pageCount = Math.ceil(totaldatacount / 12);
  const handlePageClick = (event) => {
    // setpage(JSON.parse(event.selected) + 1);
    dispatch(UpdatePageState(JSON.parse(event.selected) + 1));
  };

  const Deletecontroller = () => {
    dispatch(
      Updatedeletefilter({
        controllername: "",
        controllercode: "",
        devicecode: "",
        usertype: "",
        sortby: "",
        groupid: "",
        empty_controller: "",
      })
    );
    dispatch(UpdatedeletepageState(1));
    navigate("/dashboard/deletecontroller", {
      state: {
        ...location.state,
        pevpath: location?.pathname,
        ControllerFilters: {
          page: pagestate,
          values: filterdata,
        },
      },
    });
    sessionStorage.setItem("controllerpage", "/dashboard/motornotification");
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        <div className="view-page">
          {currentItems?.length > 0 ? (
            <div className={motorstyle.total_motors}>
              {currentItems?.map((motors, index) => {
                return (
                  <div
                    className={
                      FindAvilable(motors).show &&
                      (usertype === 3 || usertype === 2)
                        ? "BlurViewContainer"
                        : ""
                    }
                  >
                    <div
                      key={index}
                      className={`${motorstyle.motor_on_bg} ${commonstyle.cards_border_radius} ${motorstyle.motor_card_height}`}
                      onClick={() => toview(motors.controller_id, motors)}
                    >
                      <div
                        className={`${motorstyle.motor_on_pad} ${commonstyle.cards_padding}`}
                      >
                        <div className="motor-tower-div-flex">
                          <div className="motor-1-flex">
                            <Tooltip title={motors?.controller_name || ""}>
                              <p className={commonstyle.item_name}>
                                {motors?.controller_name}
                              </p>
                            </Tooltip>
                            {motors.is_warning &&
                            (usertype === 2 || usertype === 3) ? (
                              <div
                                className="AMCnotificationBlock"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openNotification(motors);
                                }}
                              >
                                <span>AMC</span>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>

                          {motors.tower ? (
                            <>
                              <img
                                src={
                                  motors?.tower >= 20 && motors?.tower <= 39
                                    ? ExportedImages.TOWER_ICON1
                                    : motors?.tower >= 40 && motors?.tower <= 59
                                    ? ExportedImages.TOWER_ICON2
                                    : motors?.tower >= 60 && motors?.tower <= 79
                                    ? ExportedImages.TOWER_ICON3
                                    : motors?.tower >= 80 && motors?.tower <= 99
                                    ? ExportedImages.TOWER_ICON4
                                    : motors?.tower === 100
                                    ? ExportedImages.TOWER_ICON5
                                    : ExportedImages.EMPTY_TOWER_ICON
                                }
                                alt="tower"
                                style={{ width: "30px" }}
                                className="motorTower"
                              />
                              <p className={motorstyle.towerpercentage}>
                                {motors.tower}%
                              </p>
                            </>
                          ) : null}

                          {motors?.controller_code ? (
                            <>
                              {isloading && index === motorindex ? (
                                <img
                                  src={ExportedImages.GREEN_SPINNER_GIF}
                                  alt="tower"
                                  className="tower motor-whitespinner"
                                  style={{ height: "23px" }}
                                />
                              ) : (
                                <img
                                  src={ExportedImages.SPINNER_ICON}
                                  alt="rotating-arrow"
                                  className="motor-whitespinner"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    loadingspinner(
                                      motors.controller_id,
                                      motors?.access_type
                                    );
                                    setindex(index);
                                  }}
                                />
                              )}
                            </>
                          ) : null}

                          <div className="mobile-1-flex">
                            <Tooltip title={motors?.operated_by || ""}>
                              <p className={commonstyle.createdby}>
                                {motors?.operated_by
                                  ? motors?.operated_by
                                  : null}
                              </p>
                            </Tooltip>

                            {motors?.controller_id === buttongreyid ? (
                              <Toggle
                                buttoncol={"grey"}
                                id={index}
                                isChecked={
                                  motors?.controller_status == 1 ? true : false
                                }
                                handleChange={({ status }) => {
                                  Changebutton(
                                    motors?.controller_id,
                                    status,
                                    motors?.access_type
                                  );
                                }}
                              />
                            ) : motors?.controller_code ? (
                              <Toggle
                                id={index}
                                isChecked={
                                  motors?.controller_status == 1 ? true : false
                                }
                                handleChange={({ status }) => {
                                  Changebutton(
                                    motors?.controller_id,
                                    status,
                                    motors?.access_type
                                  );
                                }}
                              />
                            ) : null}
                          </div>
                        </div>

                        <div className="motor-div-one-flex">
                          {motors.controller_code ? (
                            <>
                              <div className="motor-update-div-flex">
                                <div className={motorstyle.update_text}>
                                  <p className="tank-header">last update</p>
                                  <p className="tank-date">
                                    {motors?.controller_datetime}
                                  </p>
                                </div>
                                <div className="status-update">
                                  <div>
                                    <p className="tank-header">status update</p>
                                    <p className="tank-date">
                                      {motors?.status_change_time}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {motors?.software_version != null ? (
                                parseInt(motors?.software_version?.charAt(0)) ==
                                  3 ||
                                parseInt(motors?.software_version?.charAt(0)) ==
                                  1 ? (
                                  <div
                                    className={
                                      (motors?.y && motors?.b) ||
                                      (motors?.r && motors?.y) ||
                                      (motors?.r && motors?.b)
                                        ? motorstyle.motor_volt_div_flex
                                        : motorstyle.motor_volt_div_flex
                                    }
                                  >
                                    {parseInt(
                                      motors?.software_version?.charAt(0)
                                    ) == 3 ||
                                    parseInt(
                                      motors?.software_version?.charAt(0)
                                    ) == 1 ? (
                                      <div
                                        className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                      >
                                        <p className="volt-text-1">
                                          <span>R</span>
                                          {motors.r} V
                                        </p>
                                        <p className="volt-text-2">
                                          <span>A</span>
                                          {motors.rl1} A
                                        </p>
                                      </div>
                                    ) : null}
                                    {parseInt(
                                      motors?.software_version?.charAt(0)
                                    ) == 3 ? (
                                      <>
                                        <div
                                          className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                        >
                                          <p className="volt-text-1">
                                            <span>Y</span> {motors.y} V
                                          </p>
                                          <p className="volt-text-2">
                                            <span>A</span>
                                            {motors.yl2} A
                                          </p>
                                        </div>

                                        <div
                                          className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                        >
                                          <p className="volt-text-1">
                                            <span>B</span> {motors.b} V
                                          </p>
                                          <p className="volt-text-2">
                                            <span>A</span>
                                            {motors.bl3} A
                                          </p>
                                        </div>
                                      </>
                                    ) : null}
                                  </div>
                                ) : null
                              ) : null}

                              {/* {motors?.software_version != null ? (
                              parseInt(motors?.software_version?.charAt(0)) ==
                                3 ||
                              parseInt(motors?.software_version?.charAt(0)) ==
                                1 ? (
                                <div
                                  className={
                                    (motors?.y && motors?.b) ||
                                    (motors?.r && motors?.y) ||
                                    (motors?.r && motors?.b)
                                      ? motorstyle.motor_volt_div_flex
                                      : motorstyle.motor_volt_div_flex
                                  }
                                  // className="motor-volt-div-flex"
                                >
                                  {parseInt(
                                    motors?.software_version?.charAt(0)
                                  ) == 3 ||
                                  parseInt(
                                    motors?.software_version?.charAt(0)
                                  ) == 1 ? (
                                    <div
                                      className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>R</span>
                                        {motors.r} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {motors.rl1} A
                                      </p>
                                    </div>
                                  ) : null}
                                  {parseInt(
                                    motors?.software_version?.charAt(0)
                                  ) == 3 ? (
                                    <>
                                      <div
                                        className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                      >
                                        <p className="volt-text-1">
                                          <span>Y</span> {motors.y} V
                                        </p>
                                        <p className="volt-text-2">
                                          <span>A</span>
                                          {motors.yl2} A
                                        </p>
                                      </div>

                                      <div
                                        className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                      >
                                        <p className="volt-text-1">
                                          <span>B</span> {motors.b} V
                                        </p>
                                        <p className="volt-text-2">
                                          <span>A</span>
                                          {motors.bl3} A
                                        </p>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              ) : motors?.r || motors?.b || motors?.y ? (
                                <div
                                  className={
                                    (motors?.y && motors?.b) ||
                                    (motors?.r && motors?.y) ||
                                    (motors?.r && motors?.b)
                                      ? motorstyle.motor_volt_div_flex
                                      : motorstyle.motor_volt_div_flex
                                  }
                                  // className="motor-volt-div-flex"
                                >
                                  {motors.r ? (
                                    <div
                                      className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>R</span>
                                        {motors.r} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {motors.rl1} A
                                      </p>
                                    </div>
                                  ) : null}
                                  {motors.y ? (
                                    <div
                                      className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>Y</span> {motors.y} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {motors.yl2} A
                                      </p>
                                    </div>
                                  ) : null}

                                  {motors.b ? (
                                    <div
                                      className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>B</span> {motors.b} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {motors.bl3} A
                                      </p>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null
                            ) : motors?.r || motors?.b || motors?.y ? (
                              <div
                                className={
                                  (motors?.y && motors?.b) ||
                                  (motors?.r && motors?.y) ||
                                  (motors?.r && motors?.b)
                                    ? motorstyle.motor_volt_div_flex
                                    : motorstyle.motor_volt_div_flex
                                }
                                // className="motor-volt-div-flex"
                              >
                                {motors.r ? (
                                  <div
                                    className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>R</span>
                                      {motors.r} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {motors.rl1} A
                                    </p>
                                  </div>
                                ) : null}
                                {motors.y ? (
                                  <div
                                    className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>Y</span> {motors.y} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {motors.yl2} A
                                    </p>
                                  </div>
                                ) : null}

                                {motors.b ? (
                                  <div
                                    className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>B</span> {motors.b} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {motors.bl3} A
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            ) : null} */}
                            </>
                          ) : null}

                          {motors.controller_code ? (
                            <p className="line secondLine"></p>
                          ) : null}

                          <div className={motorstyle.motor_valve_div_flex}>
                            <p>
                              tank-<span>{motors.device?.level}</span>
                            </p>
                            <p>
                              flow meter-<span>{motors.device?.flow}</span>
                            </p>
                            <p>
                              valve-<span>{motors.device?.valve}</span>
                            </p>
                          </div>
                          {!motors.controller_code &&
                          (motors?.tank_level?.length > 0 ||
                            motors?.flow_meter.length > 0 ||
                            motors?.valve_device.length > 0 ||
                            motors?.multi_device?.length > 0) ? (
                            <p
                              className={`line ${commonstyle.margin_zero}`}
                            ></p>
                          ) : null}

                          <div>
                            {motors?.tank_level?.length > 0 &&
                            !motors?.controller_code ? (
                              <>
                                {motors?.tank_level?.map((datas, i) => {
                                  return (
                                    <div key={i}>
                                      <div
                                        className={
                                          motorstyle.motor_valve_div_flex
                                        }
                                      >
                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          <Tooltip
                                            title={datas?.device_name || ""}
                                          >
                                            <p className={motorstyle.levels}>
                                              {datas?.device_name}
                                            </p>
                                          </Tooltip>

                                          <p
                                            className={
                                              motorstyle.tank_level_details
                                            }
                                          >
                                            <span className="tank-header">
                                              Tank Level -{""}
                                              <span className="tank-date">
                                                {datas?.tank_level !== null
                                                  ? `${datas?.tank_level}%`
                                                  : null}
                                              </span>
                                            </span>
                                          </p>
                                        </div>

                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          {datas?.tower ? (
                                            <>
                                              <img
                                                src={
                                                  datas?.tower >= 20 &&
                                                  datas?.tower <= 39
                                                    ? ExportedImages.TOWER_ICON1
                                                    : datas?.tower >= 40 &&
                                                      datas?.tower <= 59
                                                    ? ExportedImages.TOWER_ICON2
                                                    : datas?.tower >= 60 &&
                                                      datas?.tower <= 79
                                                    ? ExportedImages.TOWER_ICON3
                                                    : datas?.tower >= 80 &&
                                                      datas?.tower <= 99
                                                    ? ExportedImages.TOWER_ICON4
                                                    : datas?.tower === 100
                                                    ? ExportedImages.TOWER_ICON5
                                                    : ExportedImages.EMPTY_TOWER_ICON
                                                }
                                                alt="tower"
                                                style={{ width: "30px" }}
                                              />
                                              <p
                                                className={
                                                  motorstyle.motorviewtowerpercentage
                                                }
                                              >
                                                {datas.tower}%
                                              </p>
                                            </>
                                          ) : (
                                            <img
                                              src={
                                                ExportedImages.EMPTY_TOWER_ICON
                                              }
                                              alt="tower"
                                              style={{ width: "30px" }}
                                            />
                                          )}
                                        </div>
                                        {isloading && index === motorindex ? (
                                          <img
                                            src={
                                              ExportedImages.GREEN_SPINNER_GIF
                                            }
                                            alt="tower"
                                            className="whitespinner"
                                            style={{ height: "23px" }}
                                          />
                                        ) : (
                                          <img
                                            src={ExportedImages.SPINNER_ICON}
                                            alt="rotating-arrow"
                                            className="whitespinner spinnerOne"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              loadingspinner(
                                                datas?.device_id,
                                                motors?.access_type,
                                                1
                                              );
                                              setindex(index);
                                            }}
                                          />
                                        )}
                                        <p className="tank-date timeOnly">
                                          {datas?.device_time}
                                        </p>
                                      </div>

                                      <div
                                        className={
                                          motorstyle.motor_valve_div_flex
                                        }
                                      >
                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          <p className="tank-header">
                                            ID -{" "}
                                            <span className="tank-date">
                                              {datas?.device_code}
                                            </span>{" "}
                                          </p>
                                          <p className="tank-header">
                                            Tank Height{" "}
                                            <span className="tank-date">
                                              {datas?.tank_height
                                                ? `${datas?.tank_height}  ft`
                                                : null}
                                            </span>
                                          </p>
                                        </div>
                                        <div className={motorstyle.water_tank}>
                                          {datas?.tank_level !== null ? (
                                            <div
                                              className={motorstyle.tankstyle}
                                            >
                                              <p
                                                className={motorstyle.waterper}
                                              >
                                                {datas?.tank_level !== null
                                                  ? `${datas?.tank_level}%`
                                                  : null}
                                              </p>
                                              {datas?.tank_level >= 1 &&
                                              datas?.tank_level <= 10 ? (
                                                <img
                                                  src={
                                                    ExportedImages.WATER_TANK_10_GIF
                                                  }
                                                />
                                              ) : datas?.tank_level > 10 &&
                                                datas?.tank_level <= 20 ? (
                                                <img
                                                  src={
                                                    ExportedImages.WATER_TANK_20_GIF
                                                  }
                                                />
                                              ) : datas?.tank_level > 20 &&
                                                datas?.tank_level <= 30 ? (
                                                <img
                                                  src={
                                                    ExportedImages.WATER_TANK_30_GIF
                                                  }
                                                />
                                              ) : datas?.tank_level > 30 &&
                                                datas?.tank_level <= 40 ? (
                                                <img
                                                  src={
                                                    ExportedImages.WATER_TANK_40_GIF
                                                  }
                                                />
                                              ) : datas?.tank_level > 40 &&
                                                datas?.tank_level <= 60 ? (
                                                <img
                                                  src={
                                                    ExportedImages.WATER_TANK_50_GIF
                                                  }
                                                />
                                              ) : datas?.tank_level > 60 &&
                                                datas?.tank_level <= 70 ? (
                                                <img
                                                  src={
                                                    ExportedImages.WATER_TANK_60_GIF
                                                  }
                                                />
                                              ) : datas?.tank_level > 70 &&
                                                datas?.tank_level <= 80 ? (
                                                <img
                                                  src={
                                                    ExportedImages.WATER_TANK_70_GIF
                                                  }
                                                />
                                              ) : datas?.tank_level > 80 &&
                                                datas?.tank_level <= 90 ? (
                                                <img
                                                  src={
                                                    ExportedImages.WATER_TANK_80_GIF
                                                  }
                                                />
                                              ) : datas?.tank_level > 90 &&
                                                datas?.tank_level <= 95 ? (
                                                <img
                                                  src={
                                                    ExportedImages.WATER_TANK_90_GIF
                                                  }
                                                />
                                              ) : datas?.tank_level > 95 &&
                                                datas?.tank_level <= 100 ? (
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
                                            </div>
                                          ) : null}
                                        </div>

                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          <p className="tank-header">
                                            High Limit{" "}
                                            <span className="tank-date">
                                              - {datas?.high_limit}
                                            </span>
                                          </p>
                                          <p className="tank-header">
                                            Low Limit{" "}
                                            <span className="tank-date">
                                              -{datas?.low_limit}
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            ) : null}

                            {motors?.flow_meter?.length > 0 &&
                            !motors?.controller_code ? (
                              <>
                                {motors?.flow_meter?.map((datas, i) => {
                                  return (
                                    <>
                                      <div
                                        className={
                                          motorstyle.motor_valve_div_flex
                                        }
                                        key={i}
                                      >
                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          <Tooltip
                                            title={datas?.device_name || ""}
                                          >
                                            <p className={motorstyle.levels}>
                                              {datas?.device_name}
                                            </p>
                                          </Tooltip>

                                          <p
                                            className={
                                              motorstyle.tank_level_details
                                            }
                                          >
                                            <span className="tank-header">
                                              Total Usage -
                                            </span>
                                            <span className="tank-date">
                                              {datas?.total_usage}
                                            </span>{" "}
                                          </p>
                                        </div>
                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          {datas?.tower ? (
                                            <>
                                              <img
                                                src={
                                                  datas?.tower >= 20 &&
                                                  datas?.tower <= 39
                                                    ? ExportedImages.TOWER_ICON1
                                                    : datas?.tower >= 40 &&
                                                      datas?.tower <= 59
                                                    ? ExportedImages.TOWER_ICON2
                                                    : datas?.tower >= 60 &&
                                                      datas?.tower <= 79
                                                    ? ExportedImages.TOWER_ICON3
                                                    : datas?.tower >= 80 &&
                                                      datas?.tower <= 99
                                                    ? ExportedImages.TOWER_ICON4
                                                    : datas?.tower === 100
                                                    ? ExportedImages.TOWER_ICON5
                                                    : ExportedImages.EMPTY_TOWER_ICON
                                                }
                                                alt="tower"
                                                style={{ width: "30px" }}
                                              />
                                              <p
                                                className={
                                                  motorstyle.motorviewtowerpercentage
                                                }
                                              >
                                                {datas.tower}%
                                              </p>
                                            </>
                                          ) : (
                                            <img
                                              src={
                                                ExportedImages.EMPTY_TOWER_ICON
                                              }
                                              alt="tower"
                                              style={{ width: "30px" }}
                                            />
                                          )}
                                        </div>
                                        {isloading && index === motorindex ? (
                                          <img
                                            src={
                                              ExportedImages.GREEN_SPINNER_GIF
                                            }
                                            alt="tower"
                                            className="whitespinner"
                                            style={{ height: "23px" }}
                                          />
                                        ) : (
                                          <img
                                            src={ExportedImages.SPINNER_ICON}
                                            alt="rotating-arrow"
                                            className="whitespinner spinnerOne"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              loadingspinner(
                                                datas?.device_id,
                                                motors?.access_type,
                                                2
                                              );
                                              setindex(index);
                                            }}
                                          />
                                        )}
                                        <p className="tank-date timeOnly">
                                          {datas?.device_time}
                                        </p>
                                      </div>

                                      <div className="tank-limit">
                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          <p className="tank-header">
                                            ID -{" "}
                                            <span className="tank-date">
                                              {datas?.device_code}
                                            </span>{" "}
                                          </p>
                                          <p className="tank-header">
                                            Daily usage{" "}
                                            <span className="tank-date">
                                              -{datas?.today_usage}{(datas?.today_usage ?? "") !== "" ? " kL" : ""}
                                            </span>
                                          </p>
                                          <p className="tank-header">
                                            Daily update{" "}
                                            <span className="tank-date">
                                              -{datas?.daily_update}
                                            </span>
                                          </p>
                                        </div>
                                        <div>
                                          <img
                                            src={ExportedImages.Flow_Image}
                                            alt="flowgif"
                                            className={motorstyle.flowgif}
                                          />
                                        </div>
                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          <p className="tank-header">
                                            flow rate{" "}
                                            <span className="tank-date">
                                              - {datas?.flow_rate}
                                            </span>
                                          </p>
                                          <p className="tank-header">
                                            usage Limit{" "}
                                            <span className="tank-date">
                                              -{datas?.usage_limit}
                                            </span>
                                          </p>
                                          <p className="tank-header">
                                            liter/pulse{" "}
                                            <span className="tank-date">
                                              -{datas?.lt_per_pulse}
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                    </>
                                  );
                                })}
                              </>
                            ) : null}

                            {motors?.valve_device?.length > 0 &&
                            !motors?.controller_code ? (
                              <div className="valveflex">
                                {motors?.valve_device?.map((datas, i) => {
                                  return (
                                    <>
                                      <div
                                        className={
                                          motorstyle.motor_valve_div_flex
                                        }
                                        key={i}
                                      >
                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          <Tooltip
                                            title={datas?.device_name || ""}
                                          >
                                            <p className={motorstyle.levels}>
                                              {datas?.device_name}
                                            </p>
                                          </Tooltip>
                                        </div>
                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          {datas?.tower ? (
                                            <>
                                              <img
                                                src={
                                                  datas?.tower >= 20 &&
                                                  datas?.tower <= 39
                                                    ? ExportedImages.TOWER_ICON1
                                                    : datas?.tower >= 40 &&
                                                      datas?.tower <= 59
                                                    ? ExportedImages.TOWER_ICON2
                                                    : datas?.tower >= 60 &&
                                                      datas?.tower <= 79
                                                    ? ExportedImages.TOWER_ICON3
                                                    : datas?.tower >= 80 &&
                                                      datas?.tower <= 99
                                                    ? ExportedImages.TOWER_ICON4
                                                    : datas?.tower === 100
                                                    ? ExportedImages.TOWER_ICON5
                                                    : ExportedImages.EMPTY_TOWER_ICON
                                                }
                                                alt="tower"
                                                style={{ width: "30px" }}
                                              />
                                              <p
                                                className={
                                                  motorstyle.motorviewtowerpercentage
                                                }
                                              >
                                                {datas.tower}%
                                              </p>
                                            </>
                                          ) : (
                                            <img
                                              src={
                                                ExportedImages.EMPTY_TOWER_ICON
                                              }
                                              alt="tower"
                                              style={{ width: "30px" }}
                                            />
                                          )}
                                        </div>
                                        {isloading && index === motorindex ? (
                                          <img
                                            src={
                                              ExportedImages.GREEN_SPINNER_GIF
                                            }
                                            alt="tower"
                                            className="whitespinner"
                                            style={{ height: "23px" }}
                                          />
                                        ) : (
                                          <img
                                            src={ExportedImages.SPINNER_ICON}
                                            alt="rotating-arrow"
                                            className="whitespinner spinnerOne"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              loadingspinner(
                                                datas?.device_id,
                                                motors?.access_type,
                                                3
                                              );
                                              setindex(index);
                                            }}
                                          />
                                        )}
                                        <p className="tank-date timeOnly">
                                          {datas?.device_time}
                                        </p>
                                      </div>

                                      <div className="valveimgflex">
                                        <div
                                          className={motorstyle.updatetank_text}
                                        >
                                          <p className="tank-header">
                                            mode -{" "}
                                            <span className="tank-date">
                                              {datas?.valve_mode === 1
                                                ? "Daily"
                                                : datas?.valve_mode === 0
                                                ? "manual"
                                                : datas?.valve_mode === 2
                                                ? "Weekly"
                                                : null}
                                            </span>{" "}
                                          </p>
                                          <p className="tank-header">
                                            ID -{" "}
                                            <span className="tank-date">
                                              {datas?.device_code}
                                            </span>{" "}
                                          </p>
                                        </div>
                                        {/* <img
                                          src={ExportedImages.VALVE_IMG}
                                          className="listvalveimg"
                                        /> */}
                                        <img
                                          src={ExportedImages.valveImage}
                                          className="listvalveimg"
                                        />
                                        <div className="valvebuttonflex">
                                          <p className="tank-header">
                                            {datas?.operated_by}
                                          </p>
                                          {datas.device_id === buttongreyid ? (
                                            <CommonSwitch
                                              color={"grey"}
                                              type={3}
                                              checked={
                                                datas?.valve_status === 1
                                                  ? true
                                                  : false
                                              }
                                              onChange={({ status }) => {
                                                Changebutton(
                                                  datas.device_id,
                                                  status,
                                                  motors?.access_type,
                                                  valvebuttontype
                                                );
                                              }}
                                            />
                                          ) : datas.device_code ? (
                                            <CommonSwitch
                                              type={3}
                                              checked={
                                                datas?.valve_status === 1
                                                  ? true
                                                  : false
                                              }
                                              onChange={({ status }) => {
                                                Changebutton(
                                                  datas.device_id,
                                                  status,
                                                  motors?.access_type,
                                                  valvebuttontype
                                                );
                                              }}
                                            />
                                          ) : null}
                                        </div>
                                      </div>
                                    </>
                                  );
                                })}
                              </div>
                            ) : null}
                            {motors?.multi_device?.length > 0 &&
                            !motors?.controller_code ? (
                              <>
                                {motors?.multi_device?.map((datas, i) => {
                                  return (
                                    <div key={i}>
                                      <MultiDeviceComponent
                                        datas={datas}
                                        isloading={isloading}
                                        index={index}
                                        motorindex={motorindex}
                                        loadingspinner={loadingspinner}
                                        motors={motors}
                                        setindex={setindex}
                                      />
                                    </div>
                                  );
                                })}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                    {(usertype === 2 || usertype === 3) && (
                      <BlurComponent
                        navigateFunc={() => {
                          toview(motors.controller_id, motors);
                        }}
                        deviceData={motors}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="view-msg">No datas Found</p>
          )}
        </div>
      </>
    );
  };

  const toadd = () => {
    navigate("/dashboard/addcontroller", {
      state: {
        ControllerFilters: {
          page: pagestate,
          values: filterdata,
        },
      },
    });
    sessionStorage.setItem("controllerpage", "/dashboard/motornotification");
  };
  const [api, contextHolder] = notification.useNotification();
  const openNotification = (warning_data) => {
    api.warning({
      message: <p className="amc_expiry_title">AMC Expiry Warning!</p>,
      description: (
        <div className="amc_expiry_notification">
          Number of days to expiry :&nbsp;&nbsp;
          <span>{warning_data.no_of_days}</span>
        </div>
      ),
      placement: "top",
    });
  };
  return (
    <>
      {contextHolder}
      {lgShow ? (
        <FilterControllerModal
          show={lgShow}
          close={() => setLgShow(false)}
          pagestate={pagestate}
          groupname={groupname}
          ListController={ListController}
          settotaldata={settotaldata}
        />
      ) : null}
      {showEmail ? (
        <EmailModal show={showEmail} close={() => setEmail(false)} />
      ) : null}
      <Loader isLoader={loader} />
      <div className="motorbackground_images">
        <div className="router-pages">
          <div className={commonstyle.controller_head}>
            <div className="pre-page">
              <FaArrowLeft
                className="arrow total_head"
                onClick={() => todashboard()}
              />
              <p className="controller-name total_head">
                Motor Controller({totaldatacount})
              </p>
            </div>
            <div className={commonstyle.cnt_buttons}>
              <img
                src={ExportedImages.FILTER_ICON}
                className={`${commonstyle.filter_icon} 
                ${commonstyle.outer_card_btn}`}
                onClick={() => {
                  setLgShow(true);
                }}
              />
              <button
                type="button"
                className={`${commonstyle.email_btn} 
                ${commonstyle.outer_card_btn}`}
                onClick={() => setEmail(true)}
              >
                Email
              </button>
              {usertype !== 3 && (
                <button
                  type="button"
                  className={`${commonstyle.add_controller_btn} 
                    ${commonstyle.outer_card_btn}`}
                  onClick={() => toadd()}
                >
                  Add Controller
                </button>
              )}
              {/* <Link
                to="/dashboard/deletecontroller"
                state={{ ...location.state, pevpath: location?.pathname }}
              >
                <FaTrashAlt className="icontrash" />
                <br />
              </Link> */}
              {usertype !== 3 && (
                <button
                  type="button"
                  className={`${commonstyle.delete_controller_btn} 
                    ${commonstyle.outer_card_btn}`}
                  onClick={() => Deletecontroller()}
                >
                  Delete Controller
                </button>
              )}
            </div>
          </div>
          <div className="controller-bottom ">
            <Items currentItems={currentItems} />
            {totaldatacount > 12 ? (
              <div className="col-12 float-start d-flex justify-content-center paginator">
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
                  forcePage={pagestate - 1}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
