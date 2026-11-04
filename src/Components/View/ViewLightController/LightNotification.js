import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowLeft,
} from "react-icons/fa";
import "../ViewController.modules.css";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  buttonapi,
  groupdropdownapi,
  listcontrollerapi,
} from "../../../Service/ApiService";
import { useDispatch, useSelector } from "react-redux";
import {
  UpdatePageState,
  Updatedeletefilter,
  UpdatedeletepageState,
  Updatefilterdata,
  UpdatelightViewDatas,
} from "../../Store/Config/Configuration";
import ReactPaginate from "react-paginate";
import Toggle from "../../ToggleButton";

import FilterControllerModal from "../../../Modalcomponents/FilterControllerModal";
import Loader from "../../Loader";

import { OverlayTrigger, Tooltip } from "react-bootstrap";
import EmailModal from "../../../Modalcomponents/EmailModal";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import motorstyle from "../ViewController/motorcontroller.module.css";
import {
  GetSessionStorage,
  SetSessionStorage,
} from "../../../Utilities/Storage";
import { getCookie } from "../../../Utilities/Cookie";
import BlurComponent from "../BlurComponent";
import { FindAvilable } from "../../../Utilities/Methods";
import { ExportedImages } from "../../../Utilities/ImageExport";
import { notification } from "antd";

export default function Lightnotification() {
  let abortcontroller = undefined;
  let location = useLocation();
  let navigate = useNavigate();
  const { lightcontrollerlist } = useSelector((state) => state);
  let dispatch = useDispatch();
  // const [pagestate, setpage] = useState(1);
  const [isloading, setloading] = useState(false);
  const [motorindex, setindex] = useState();
  const [totaldatacount, settotaldata] = useState();
  const [lgShow, setLgShow] = useState(false);
  const [groupname, setgroup] = useState();
  const [controllertype, setcontrollertype] = useState(2);
  const [loader, setloader] = useState(false);
  const { filterdata } = useSelector((state) => state);
  let sessiongroup = JSON.parse(sessionStorage.getItem("groupid"));
  let sessiontype = JSON.parse(sessionStorage.getItem("usertype"));
  let sessiongrouplight = JSON.parse(sessionStorage.getItem("groupidlight"));
  let sessiontypelight = JSON.parse(sessionStorage.getItem("usertypelight"));
  const [buttongreyid, setbuttongreyid] = useState("");
  const [showEmail, setEmail] = useState(false);
  const { pagestate } = useSelector((state) => state);
  const sorttype = sessionStorage.getItem("sorttype");
  const [dataList, setDataList] = useState([]);
  let cookie = JSON.parse(getCookie("cookiedata"));

  let SessionUserId = JSON.parse(GetSessionStorage("mainUserId"));
  const { light } = SessionUserId || {};

  let usertype = cookie?.user_type;
  const toview = (id, data) => {
    navigate("/dashboard/lightdetails", {
      state: {
        id: id,
        ControllerFilters: {
          page: pagestate,
          values: filterdata,
        },
      },
    });
    dispatch(UpdatelightViewDatas(data));
    SetSessionStorage("lightViewDatas", JSON.stringify(data));
    sessionStorage.setItem("lightdetailspage", "/dashboard/lightnotification");
    sessionStorage.setItem("sorttype", 3);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    ListController();
  }, [pagestate]);

  useEffect(() => {
    const interval = setInterval(() => {
      ListController(true);
      dispatch(Updatefilterdata(filterdata));
      dispatch(UpdatePageState(pagestate));
    }, 60000);
    return () => clearInterval(interval);
  }, [pagestate, filterdata]);

  const ListController = (silent = false) => {
    if (!silent) setloader(true);
    let formData = new FormData();
    formData.append("controller_type", 2);
    formData.append(
      "sort_type",
      filterdata.sortby !== "" ? filterdata.sortby : sorttype
    );
    // formData.append("page", pagestate);
    // formData.append("size", 12);
    if (sessiongrouplight || filterdata?.groupid) {
      formData.append(
        "group_id",
        filterdata?.groupid ? filterdata?.groupid : sessiongrouplight
      );
    }
    if (sessiontypelight || filterdata?.usertype) {
      formData.append(
        "user_type",
        filterdata?.usertype != "" ? filterdata?.usertype : sessiontypelight
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
    if (light?.id || filterdata?.user_id) {
      formData.append(
        "user_id",
        filterdata.user_id !== "" ? filterdata?.user_id || "" : light?.id
      );
    }
    if (filterdata?.empty_controller) {
      formData.append("empty_controller", 1);
    }
    listcontrollerapi(formData, pagestate)
      .then(({ data }) => {
        // dispatch(Updatelightcontrollerlist(data.items));
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

  const Changebutton = (id, togglestatus, accesstype) => {
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
      let formData = new FormData();
      formData.append("controller_id", id);
      formData.append("controller_type", 2);
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
  };
  const loadingspinner = (ind, id, accesstype) => {
    if (
      accesstype === 0 ||
      accesstype === 1 ||
      accesstype === null ||
      accesstype === 2
    ) {
      setloading(true);
      setTimeout(() => {
        setloading(false);
      }, 3000);

      let formData = new FormData();
      formData.append("controller_id", id);
      formData.append("controller_type", 2);
      formData.append("request_type", 1);

      buttonapi(formData)
        .then(({ data }) => {
          setTimeout(() => {
            ListController();
          }, 5000);
        })
        .catch((err) => {});
    }
  };

  const todashboard = () => {
    navigate("/dashboard");
    sessionStorage.removeItem("lightcontrollerpage");
    sessionStorage.removeItem("lightdetailspage");
    dispatch(UpdatePageState(1));
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
    sessionStorage.setItem(
      "lightcontrollerpage",
      "/dashboard/lightnotification"
    );
  };

  const Items = ({ currentdata }) => {
    return (
      <>
        <div className="view-page">
          {currentdata?.length > 0 ? (
            <div className={motorstyle.total_motors}>
              {currentdata?.map((lights, index) => {
                return (
                  <div
                    className={
                      FindAvilable(lights).show &&
                      (usertype === 3 || usertype === 2)
                        ? "BlurViewContainer"
                        : ""
                    }
                  >
                    <div
                      key={index}
                      className={`${motorstyle.motor_on_bg} ${commonstyle.cards_border_radius}`}
                      onClick={() => toview(lights?.controller_id, lights)}
                    >
                      <div
                        className={`${motorstyle.motor_on_pad} ${commonstyle.cards_padding}`}
                      >
                        <div className="motor-div-one-flex">
                          <div className="motor-tower-div-flex">
                            <div className="motor-1-flex">
                              {lights?.controller_name ? (
                                <OverlayTrigger
                                  key="top"
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top">
                                      <strong>{lights?.controller_name}</strong>
                                    </Tooltip>
                                  }
                                >
                                  <p className={commonstyle.item_name}>
                                    {lights?.controller_name}
                                  </p>
                                </OverlayTrigger>
                              ) : (
                                <p className={commonstyle.item_name}>
                                  {lights?.controller_name}
                                </p>
                              )}
                              {lights.is_warning &&
                              (usertype === 2 || usertype === 3) ? (
                                <div
                                  className="AMCnotificationBlock"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openNotification(lights);
                                  }}
                                >
                                  <span>AMC</span>
                                </div>
                              ) : (
                                ""
                              )}
                            </div>

                            {lights.tower ? (
                              <>
                                <img
                                  src={
                                    lights?.tower >= 20 && lights?.tower <= 39
                                      ? ExportedImages.TOWER_ICON1
                                      : lights?.tower >= 40 &&
                                        lights?.tower <= 59
                                      ? ExportedImages.TOWER_ICON2
                                      : lights?.tower >= 60 &&
                                        lights?.tower <= 79
                                      ? ExportedImages.TOWER_ICON3
                                      : lights?.tower >= 80 &&
                                        lights?.tower <= 99
                                      ? ExportedImages.TOWER_ICON4
                                      : lights?.tower === 100
                                      ? ExportedImages.TOWER_ICON5
                                      : ExportedImages.EMPTY_TOWER_ICON
                                  }
                                  alt="tower"
                                  style={{ width: "30px" }}
                                  className="lightTower"
                                />
                                <p className={motorstyle.towerpercentage}>
                                  {lights.tower}%
                                </p>
                              </>
                            ) : null}
                            {/* LOADING IMAGE */}
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
                                    index,
                                    lights?.controller_id,
                                    lights?.access_type
                                  );
                                  setindex(index);
                                }}
                              />
                            )}
                            {/* END */}
                            <div className="mobile-1-flex">
                              {lights?.operated_by ? (
                                <OverlayTrigger
                                  key="top"
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top">
                                      <strong>{lights?.operated_by}</strong>
                                    </Tooltip>
                                  }
                                >
                                  <p className={commonstyle.createdby}>
                                    {lights?.operated_by
                                      ? lights?.operated_by
                                      : null}
                                  </p>
                                </OverlayTrigger>
                              ) : (
                                <p className={commonstyle.createdby}>
                                  {lights?.operated_by
                                    ? lights?.operated_by
                                    : null}
                                </p>
                              )}
                              {lights?.controller_id === buttongreyid ? (
                                <Toggle
                                  buttoncol={"grey"}
                                  id={index}
                                  isChecked={
                                    lights?.controller_status == 1
                                      ? true
                                      : false
                                  }
                                  handleChange={({ status }) => {
                                    Changebutton(
                                      lights?.controller_id,
                                      status,
                                      lights?.access_type
                                    );
                                  }}
                                />
                              ) : lights?.controller_code ? (
                                <Toggle
                                  id={index}
                                  isChecked={
                                    lights?.controller_status == 1
                                      ? true
                                      : false
                                  }
                                  handleChange={({ status }) => {
                                    Changebutton(
                                      lights?.controller_id,
                                      status,
                                      lights?.access_type
                                    );
                                  }}
                                />
                              ) : null}
                            </div>
                          </div>

                          <div
                            className={motorstyle.motor_head_sub_div}

                            // onClick={() => toview(lights?.controller_id)}
                          >
                            <div className="motor-update-div-flex">
                              <div className="update-text">
                                <p className="tank-header">last update</p>
                                <p className="tank-date">
                                  {lights?.controller_datetime
                                    ? lights?.controller_datetime
                                    : null}
                                </p>
                              </div>
                              <div className="status-update">
                                <div>
                                  <p className="tank-header">status update</p>
                                  <p className="tank-date">
                                    {lights?.status_change_time
                                      ? lights?.status_change_time
                                      : null}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {lights?.software_version != null ? (
                              parseInt(lights?.software_version?.charAt(0)) ==
                                3 ||
                              parseInt(lights?.software_version?.charAt(0)) ==
                                1 ? (
                                <div
                                  className={
                                    (lights?.y && lights?.b) ||
                                    (lights?.r && lights?.y) ||
                                    (lights?.r && lights?.b)
                                      ? motorstyle.motor_volt_div_flex
                                      : motorstyle.motor_volt_div_flex
                                  }
                                >
                                  {parseInt(
                                    lights?.software_version?.charAt(0)
                                  ) == 3 ||
                                  parseInt(
                                    lights?.software_version?.charAt(0)
                                  ) == 1 ? (
                                    <div
                                      className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>R</span>
                                        {lights.r} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {lights.rl1} A
                                      </p>
                                    </div>
                                  ) : null}
                                  {parseInt(
                                    lights?.software_version?.charAt(0)
                                  ) == 3 ? (
                                    <>
                                      <div
                                        className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                      >
                                        <p className="volt-text-1">
                                          <span>Y</span> {lights.y} V
                                        </p>
                                        <p className="volt-text-2">
                                          <span>A</span>
                                          {lights.yl2} A
                                        </p>
                                      </div>

                                      <div
                                        className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                      >
                                        <p className="volt-text-1">
                                          <span>B</span> {lights.b} V
                                        </p>
                                        <p className="volt-text-2">
                                          <span>A</span>
                                          {lights.bl3} A
                                        </p>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              ) : null
                            ) : null}

                            {/* {lights?.software_version != null ? (
                            parseInt(lights?.software_version?.charAt(0)) ==
                              3 ||
                            parseInt(lights?.software_version?.charAt(0)) ==
                              1 ? (
                              <div
                                className={
                                  (lights?.y && lights?.b) ||
                                  (lights?.r && lights?.y) ||
                                  (lights?.r && lights?.b)
                                    ? motorstyle.motor_volt_div_flex
                                    : motorstyle.motor_volt_div_flex
                                }
                              >
                                {parseInt(
                                  lights?.software_version?.charAt(0)
                                ) == 3 ||
                                parseInt(lights?.software_version?.charAt(0)) ==
                                  1 ? (
                                  <div
                                    className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>R</span>
                                      {lights?.r} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {lights?.rl1} A
                                    </p>
                                  </div>
                                ) : null}
                                {parseInt(
                                  lights?.software_version?.charAt(0)
                                ) == 3 ? (
                                  <>
                                    <div
                                      className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>Y</span> {lights?.y} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {lights?.yl2} A
                                      </p>
                                    </div>

                                    <div
                                      className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                    >
                                      <p className="volt-text-1">
                                        <span>B</span> {lights?.b} V
                                      </p>
                                      <p className="volt-text-2">
                                        <span>A</span>
                                        {lights?.bl3} A
                                      </p>
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            ) : lights?.r || lights?.y || lights?.b ? (
                              <div
                                className={
                                  (lights?.y && lights?.b) ||
                                  (lights?.r && lights?.y) ||
                                  (lights?.r && lights?.b)
                                    ? motorstyle.motor_volt_div_flex
                                    : motorstyle.motor_volt_div_flex
                                }
                              >
                                {lights?.r ? (
                                  <div
                                    className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>R</span>
                                      {lights?.r} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {lights?.rl1} A
                                    </p>
                                  </div>
                                ) : null}
                                {lights?.y ? (
                                  <div
                                    className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>Y</span> {lights?.y} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {lights?.yl2} A
                                    </p>
                                  </div>
                                ) : null}
                                {lights?.b ? (
                                  <div
                                    className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                  >
                                    <p className="volt-text-1">
                                      <span>B</span> {lights?.b} V
                                    </p>
                                    <p className="volt-text-2">
                                      <span>A</span>
                                      {lights?.bl3} A
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            ) : null
                          ) : lights?.r || lights?.y || lights?.b ? (
                            <div
                              className={
                                (lights?.y && lights?.b) ||
                                (lights?.r && lights?.y) ||
                                (lights?.r && lights?.b)
                                  ? motorstyle.motor_volt_div_flex
                                  : motorstyle.motor_volt_div_flex
                              }
                            >
                              {lights?.r ? (
                                <div
                                  className={`bg-color-one ${motorstyle.motor_volt_sub_div}`}
                                >
                                  <p className="volt-text-1">
                                    <span>R</span>
                                    {lights?.r} V
                                  </p>
                                  <p className="volt-text-2">
                                    <span>A</span>
                                    {lights?.rl1} A
                                  </p>
                                </div>
                              ) : null}
                              {lights?.y ? (
                                <div
                                  className={`bg-color-two ${motorstyle.motor_volt_sub_div}`}
                                >
                                  <p className="volt-text-1">
                                    <span>Y</span> {lights?.y} V
                                  </p>
                                  <p className="volt-text-2">
                                    <span>A</span>
                                    {lights?.yl2} A
                                  </p>
                                </div>
                              ) : null}
                              {lights?.b ? (
                                <div
                                  className={`bg-color-three ${motorstyle.motor_volt_sub_div}`}
                                >
                                  <p className="volt-text-1">
                                    <span>B</span> {lights?.b} V
                                  </p>
                                  <p className="volt-text-2">
                                    <span>A</span>
                                    {lights?.bl3} A
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          ) : null} */}
                          </div>
                        </div>
                      </div>
                    </div>
                    {(usertype === 3 || usertype === 2) && (
                      <BlurComponent
                        navigateFunc={() => {
                          toview(lights?.controller_id, lights);
                        }}
                        deviceData={lights}
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
        pevpath: location?.pathname,
        ControllerFilters: {
          page: pagestate,
          values: filterdata,
        },
      },
    });
    sessionStorage.setItem(
      "lightcontrollerpage",
      "/dashboard/lightnotification"
    );
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
          controllertype={controllertype}
        />
      ) : null}
      {showEmail ? (
        <EmailModal show={showEmail} close={() => setEmail(false)} />
      ) : null}
      <Loader isLoader={loader} />
      <div className="background-images">
        <div className="router-pages">
          <div className={commonstyle.controller_head}>
            <div className="pre-page">
              <FaArrowLeft
                className="arrow total_head"
                onClick={() => todashboard()}
              />
              <p className="controller-name total_head">
                Light Controller({totaldatacount})
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
            <Items currentdata={currentItems} />
            {totaldatacount > 12 ? (
              <div className="col-12 float-start d-flex justify-content-center  paginator">
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
