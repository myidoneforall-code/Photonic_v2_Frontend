import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import {
  UpdatePageState,
  Updatedeletefilter,
  UpdatedeletepageState,
  Updatefilterdata,
  UpdatemotorViewDatas,
} from "../../Store/Config/Configuration";

import {
  FaArrowLeft,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import {
  buttonapi,
  devicerefreshapi,
  groupdropdownapi,
  listcontrollerapi,
} from "../../../Service/ApiService";
import ReactPaginate from "react-paginate";

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

export default function Motorcontrolleroff() {
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
  let dispatch = useDispatch();
  const { filterdata } = useSelector((state) => state);
  const [buttongreyid, setbuttongreyid] = useState("");
  const [valvebuttontype, setvalvebuttontype] = useState(1);
  let sessiongroup = JSON.parse(sessionStorage.getItem("groupid"));
  let sessiontype = JSON.parse(sessionStorage.getItem("usertype"));
  let sessiongrouplight = JSON.parse(sessionStorage.getItem("groupidlight"));
  let sessiontypelight = JSON.parse(sessionStorage.getItem("usertypelight"));
  const [showEmail, setEmail] = useState(false);
  const { pagestate } = useSelector((state) => state);
  const sorttype = sessionStorage.getItem("sorttype");
  const [dataList, setDataList] = useState([]);
  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;
  let SessionUserId = JSON.parse(GetSessionStorage("mainUserId"));
  const { motor } = SessionUserId || {};

  const toalldetails = (id, data) => {
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
      "/dashboard/motorcontrolleroff"
    );
    sessionStorage.setItem("sorttype", 2);
  };

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
        setDataList(data?.items);
        settotaldata(data.total);
      })
      .catch((err) => {})
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
  const currentItems = dataList;
  const pageCount = Math.ceil(totaldatacount / 12);
  const handlePageClick = (event) => {
    // setpage(JSON.parse(event.selected) + 1);
    dispatch(UpdatePageState(JSON.parse(event.selected) + 1));
  };
  // work

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
    sessionStorage.setItem("controllerpage", "/dashboard/motorcontrolleroff");
  };

  const Items = ({ currentItems }) => {
    return (
      <>
        <div className="view-page">
          {currentItems?.length > 0 ? (
            <div className={motorstyle.total_motors}>
              {currentItems.map((motoroff, index) => {
                return (
                  <div
                    className={
                      FindAvilable(motoroff).show &&
                      (usertype === 3 || usertype === 2)
                        ? "BlurViewContainer"
                        : ""
                    }
                  >
                    <div
                      key={index}
                      className={`${motorstyle.motor_on_bg} ${commonstyle.cards_border_radius}`}
                      onClick={() =>
                        toalldetails(motoroff?.controller_id, motoroff)
                      }
                    >
                      <div
                        className={`${motorstyle.motor_on_pad} ${commonstyle.cards_padding} ${motorstyle.motor_card_height}`}
                      >
                        <div className="motor-tower-div-flex">
                          <div className="motor-1-flex">
                            <Tooltip title={motoroff.controller_name || ""}>
                              <p className={commonstyle.item_name}>
                                {motoroff.controller_name}
                              </p>
                            </Tooltip>
                            {motoroff.is_warning &&
                            (usertype === 2 || usertype === 3) ? (
                              <div
                                className="AMCnotificationBlock"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openNotification(motoroff);
                                }}
                              >
                                <span>AMC</span>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>

                          {motoroff.tower ? (
                            <>
                              <img
                                src={
                                  motoroff?.tower >= 20 && motoroff?.tower <= 39
                                    ? ExportedImages.TOWER_ICON1
                                    : motoroff?.tower >= 40 &&
                                      motoroff?.tower <= 59
                                    ? ExportedImages.TOWER_ICON2
                                    : motoroff?.tower >= 60 &&
                                      motoroff?.tower <= 79
                                    ? ExportedImages.TOWER_ICON3
                                    : motoroff?.tower >= 80 &&
                                      motoroff?.tower <= 99
                                    ? ExportedImages.TOWER_ICON4
                                    : motoroff?.tower === 100
                                    ? ExportedImages.TOWER_ICON5
                                    : ExportedImages.EMPTY_TOWER_ICON
                                }
                                alt="tower"
                                style={{ width: "30px" }}
                                className="motorTower"
                              />
                              <p className={motorstyle.towerpercentage}>
                                {motoroff.tower}%
                              </p>
                            </>
                          ) : null}
                          {/* LOADING IMAGE */}
                          {motoroff?.controller_code ? (
                            <>
                              {isloading && index === motorindex ? (
                                <img
                                  src={ExportedImages.GREEN_SPINNER_GIF}
                                  alt="tower"
                                  className="lightwhitespinner"
                                  style={{ height: "23px" }}
                                />
                              ) : (
                                <img
                                  src={ExportedImages.SPINNER_ICON}
                                  alt="rotating-arrow"
                                  className="lightwhitespinner"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    loadingspinner(
                                      motoroff.controller_id,
                                      motoroff.access_type
                                    );
                                    setindex(index);
                                  }}
                                />
                              )}
                            </>
                          ) : null}

                          {/* END */}
                          <div className="mobile-1-flex">
                            <Tooltip title={motoroff?.operated_by || ""}>
                              <p className={commonstyle.createdby}>
                                {motoroff?.operated_by
                                  ? motoroff?.operated_by
                                  : null}
                              </p>
                            </Tooltip>

                            {motoroff?.controller_id === buttongreyid ? (
                              <Toggle
                                buttoncol={"grey"}
                                id={index}
                                isChecked={
                                  motoroff?.controller_status == 1
                                    ? true
                                    : false
                                }
                                handleChange={({ status }) => {
                                  Changebutton(
                                    motoroff?.controller_id,
                                    status,
                                    motoroff?.access_type
                                  );
                                }}
                              />
                            ) : motoroff?.controller_code ? (
                              <Toggle
                                id={index}
                                isChecked={
                                  motoroff?.controller_status == 1
                                    ? true
                                    : false
                                }
                                handleChange={({ status }) => {
                                  Changebutton(
                                    motoroff?.controller_id,
                                    status,
                                    motoroff?.access_type
                                  );
                                }}
                              />
                            ) : null}
                          </div>
                        </div>

                        <div className="motor-div-one-flex">
                          {motoroff?.controller_code ? (
                            <>
                              <div className="motor-update-div-flex">
                                <div className={motorstyle.update_text}>
                                  <p className="tank-header">last update</p>
                                  <p className="tank-date">
                                    {motoroff?.controller_datetime}
                                  </p>
                                </div>

                                <div className="status-update">
                                  <p className="tank-header">status update</p>
                                  <p className="tank-date">
                                    {motoroff?.status_change_time}
                                  </p>
                                </div>
                              </div>

                              {motoroff?.software_version != null ? (
                                parseInt(
                                  motoroff?.software_version?.charAt(0)
                                ) == 3 ||
                                parseInt(
                                  motoroff?.software_version?.charAt(0)
                                ) == 1 ? (
                                  <div
                                    className={
                                      (motoroff?.y && motoroff?.b) ||
                                      (motoroff?.r && motoroff?.y) ||
                                      (motoroff?.r && motoroff?.b)
                                        ? motorstyle.motor_volt_div_flex
                                        : motorstyle.motor_volt_div_flex
                                    }
                                  >
                                    {parseInt(
                                      motoroff?.software_version?.charAt(0)
                                    ) == 3 ||
                                    parseInt(
                                      motoroff?.software_version?.charAt(0)
                                    ) == 1 ? (
                                      <div
                                        className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                      >
                                        <p className="volt-text-1">
                                          <span>R</span>
                                          {motoroff.r} V
                                        </p>
                                        <p className="volt-text-2">
                                          <span>A</span>
                                          {motoroff.rl1} A
                                        </p>
                                      </div>
                                    ) : null}
                                    {parseInt(
                                      motoroff?.software_version?.charAt(0)
                                    ) == 3 ? (
                                      <>
                                        <div
                                          className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                        >
                                          <p className="volt-text-1">
                                            <span>Y</span> {motoroff.y} V
                                          </p>
                                          <p className="volt-text-2">
                                            <span>A</span>
                                            {motoroff.yl2} A
                                          </p>
                                        </div>

                                        <div
                                          className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                        >
                                          <p className="volt-text-1">
                                            <span>B</span> {motoroff.b} V
                                          </p>
                                          <p className="volt-text-2">
                                            <span>A</span>
                                            {motoroff.bl3} A
                                          </p>
                                        </div>
                                      </>
                                    ) : null}
                                  </div>
                                ) : null
                              ) : null}

                              {/* {motoroff?.software_version != null ? (
                              parseInt(motoroff?.software_version?.charAt(0)) ==
                                3 ||
                              parseInt(motoroff?.software_version?.charAt(0)) ==
                                1 ? (
                                <div
                                  className={
                                    (motoroff?.y && motoroff?.b) ||
                                    (motoroff?.r && motoroff?.y) ||
                                    (motoroff?.r && motoroff?.b)
                                      ? motorstyle.motor_volt_div_flex
                                      : motorstyle.motor_volt_div_flex
                                  }
                                >
                                  {parseInt(
                                    motoroff?.software_version?.charAt(0)
                                  ) == 3 ||
                                  parseInt(
                                    motoroff?.software_version?.charAt(0)
                                  ) == 1 ? (
                                    <div
                                      className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>R</span>
                                        {motoroff.r} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {motoroff.rl1} A
                                      </p>
                                    </div>
                                  ) : null}
                                  {parseInt(
                                    motoroff?.software_version?.charAt(0)
                                  ) == 3 ? (
                                    <>
                                      <div
                                        className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                      >
                                        <p className="volt-text-1">
                                          <span>Y</span> {motoroff.y} V
                                        </p>
                                        <p className="volt-text-2">
                                          <span>A</span>
                                          {motoroff.yl2} A
                                        </p>
                                      </div>

                                      <div
                                        className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                      >
                                        <p className="volt-text-1">
                                          <span>B</span> {motoroff.b} V
                                        </p>
                                        <p className="volt-text-2">
                                          <span>A</span>
                                          {motoroff.bl3} A
                                        </p>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              ) : motoroff.r || motoroff?.y || motoroff?.b ? (
                                <div
                                  className={
                                    (motoroff?.y && motoroff?.b) ||
                                    (motoroff?.r && motoroff?.y) ||
                                    (motoroff?.r && motoroff?.b)
                                      ? motorstyle.motor_volt_div_flex
                                      : motorstyle.motor_volt_div_flex
                                  }
                                >
                                  {motoroff.r ? (
                                    <div
                                      className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>R</span>
                                        {motoroff.r} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {motoroff.rl1} A
                                      </p>
                                    </div>
                                  ) : null}
                                  {motoroff.y ? (
                                    <div
                                      className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>Y</span> {motoroff.y} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {motoroff.yl2} A
                                      </p>
                                    </div>
                                  ) : null}

                                  {motoroff.b ? (
                                    <div
                                      className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>B</span> {motoroff.b} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {motoroff.bl3} A
                                      </p>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null
                            ) : motoroff.r || motoroff?.y || motoroff?.b ? (
                              <div
                                className={
                                  (motoroff?.y && motoroff?.b) ||
                                  (motoroff?.r && motoroff?.y) ||
                                  (motoroff?.r && motoroff?.b)
                                    ? motorstyle.motor_volt_div_flex
                                    : motorstyle.motor_volt_div_flex
                                }
                              >
                                {motoroff.r ? (
                                  <div
                                    className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>R</span>
                                      {motoroff.r} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {motoroff.rl1} A
                                    </p>
                                  </div>
                                ) : null}
                                {motoroff.y ? (
                                  <div
                                    className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>Y</span> {motoroff.y} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {motoroff.yl2} A
                                    </p>
                                  </div>
                                ) : null}

                                {motoroff.b ? (
                                  <div
                                    className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>B</span> {motoroff.b} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {motoroff.bl3} A
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            ) : null} */}
                            </>
                          ) : null}

                          {motoroff.controller_code ? (
                            <p className="line secondLine"></p>
                          ) : null}

                          <div className={motorstyle.motor_valve_div_flex}>

                            {
                              motoroff.device.level>0&&(
                            <p>
                              tank-<span>{motoroff.device.level}</span>
                            </p>

                              )
                            }

                            {
                              motoroff.device.flow>0&&(
                            <p>
                              flow meter-<span>{motoroff.device.flow}</span>
                            </p>

                              )
                            }

                            {
                              motoroff.device.valve>0&&(
                            <p>
                              valve-<span>{motoroff.device.valve}</span>
                            </p>
                              )
                            }
                          </div>

                          {!motoroff.controller_code &&
                          (motoroff?.tank_level?.length > 0 ||
                            motoroff?.flow_meter.length > 0 ||
                            motoroff?.valve_device.length > 0 ||
                            motoroff?.multi_device?.length > 0) ? (
                            <p
                              className={`line ${commonstyle.margin_zero}`}
                            ></p>
                          ) : null}

                          <div>
                            {motoroff?.tank_level?.length > 0 &&
                            !motoroff?.controller_code ? (
                              <>
                                {motoroff?.tank_level?.map((datas, i) => {
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
                                                motoroff?.access_type,
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
                                              -{" "}
                                              {datas?.tank_height
                                                ? `${datas?.tank_height}ft`
                                                : null}
                                            </span>
                                          </p>
                                        </div>
                                        <div
                                          className={motorstyle.offwater_tank}
                                        >
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
                            {motoroff?.flow_meter?.length > 0 &&
                            !motoroff?.controller_code ? (
                              <>
                                {motoroff?.flow_meter?.map((datas, i) => {
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
                                                motoroff?.access_type,
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
                                              -{datas?.today_usage}
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

                            {motoroff?.valve_device?.length > 0 &&
                            !motoroff?.controller_code ? (
                              <div className="valveflex">
                                {motoroff?.valve_device?.map((datas, i) => {
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
                                                motoroff?.access_type,
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
                                          className={
                                            motorstyle.off_listvalveimg
                                          }
                                        /> */}
                                        <img
                                          src={ExportedImages.valveImage}
                                          className={
                                            motorstyle.off_listvalveimg
                                          }
                                        />

                                        <div className="valvebuttonflex">
                                          <p className="tank-header">
                                            {datas?.operated_by}
                                          </p>
                                          {datas?.device_id === buttongreyid ? (
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
                                                  motoroff?.access_type,
                                                  valvebuttontype
                                                );
                                              }}
                                            />
                                          ) : datas?.device_code ? (
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
                                                  motoroff?.access_type,
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
                            {motoroff?.multi_device?.length > 0 &&
                            !motoroff?.controller_code ? (
                              <>
                                {motoroff?.multi_device?.map((datas, i) => {
                                  return (
                                    <div key={i}>
                                      <MultiDeviceComponent
                                        datas={datas}
                                        isloading={isloading}
                                        index={index}
                                        motorindex={motorindex}
                                        loadingspinner={loadingspinner}
                                        motors={motoroff}
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
                          toalldetails(motoroff?.controller_id, motoroff);
                        }}
                        deviceData={motoroff}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="view-msg">no data found</p>
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
    sessionStorage.setItem("controllerpage", "/dashboard/motorcontrolleroff");
  };

  const [api, contextHolder] = notification.useNotification();
  const openNotification = (warning_data) => {
    api.destroy();
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
