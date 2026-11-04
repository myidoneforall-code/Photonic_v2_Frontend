import React, { useEffect, useState } from "react";
import "./Dashboard.modules.css";

import { Outlet, useLocation, useNavigate } from "react-router";
import { getCookie } from "../../Utilities/Cookie";
import "react-datepicker/dist/react-datepicker.css";
import { FaBars, FaUser } from "react-icons/fa";
import Dropdown from "react-bootstrap/Dropdown";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { FaUsers } from "react-icons/fa";
import { SiMqtt } from "react-icons/si";
import { toast } from "react-hot-toast";
import Loader from "../../Components/Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  UpdateDeviceFilter,
  Updatefilterdata,
  UpdateGroupFilters,
  UpdateLoginUserData,
  UpdatePageState,
  UpdateUserFilters,
  Updatewebtest
} from "../../Components/Store/Config/Configuration";
import { HiOutlineUserCircle } from "react-icons/hi";
import { BiSolidCategory } from "react-icons/bi";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import DeleteConfirmationModal from "../../Modalcomponents/DeleteConfirmationModal";

import { RiEdit2Fill, RiFileExcel2Fill } from "react-icons/ri";
import {
  ChangeUserMenu,
  editprofile,
  profile,
  ViewUserPermission
} from "../../Service/ApiService";
import { FaPowerOff } from "react-icons/fa";
import MobileNotificationModal from "../../Modalcomponents/MobileNotificationModal";
import { getCatchMsg, JSONtoformdata } from "../../Utilities/Methods";
import { ExportedImages } from "../../Utilities/ImageExport";
import { Checkbox } from "antd";
import CommonCheckbox from "../../Components/CommonComponents/CommonCheckbox";
import styles from "./ModifiedDashboard.module.css";
import { useMediaQuery } from "@mui/material";

export default function ModifiedHeader() {
  let navigate = useNavigate();
  let location = useLocation();
  let dispatch = useDispatch();

  let controllerType = JSON.parse(localStorage?.getItem("contollertype"));
  let LoginDatas = JSON?.parse(getCookie?.("cookiedata"));
  let webtextdata = sessionStorage.getItem("webtext");
  const breakPoint = useMediaQuery(`(max-width:998px)`);
  const { webtest } = useSelector((state) => state);
  let usertype = LoginDatas?.user_type;

  const [loader, setloader] = useState(false);
  const [ShowSidebar, setShowSidebar] = useState(false);
  const [editWebText, setEditWebText] = useState(false);
  const [ShowLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenus, setShowMenus] = useState(false);
  const [profileData, setProfiledata] = useState();
  const { LoginUserData } = useSelector((state) => state);
  const [color, setColor] = useState("");
  const [controllerTypes, setControllerTypes] = useState(controllerType || 1);
  const [notificationModal, setNotificationModal] = useState({
    show: false
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [userpersmission, setUserPermissions] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMotorScreens = () => {
    if (controllerType === 2) {
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
      navigate("/dashboard");
    }
  };

  const handleProfileClick = () => {
    navigate("/dashboard/profile", {
      state: { ...location.state, pevpath: location?.pathname }
    });
  };

  const HandleClickController = () => {
    dispatch(
      Updatefilterdata({
        controllername: "",
        controllercode: "",
        devicecode: "",
        usertype: "",
        user_id: "",
        sortby: "",
        groupid: ""
      })
    );
    dispatch(UpdatePageState(1));
    if (controllerType === 1) {
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
      navigate("/dashboard/motorcontrollerview");
    } else {
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
      navigate("/dashboard/lightcontrollerview");
    }
  };

  const handleLightScreens = () => {
    if (controllerType === 1) {
      navigate("/dashboard");
    }
  };

  const getUserProfileData = (silent = false) => {
    if (!silent) setloader(true);
    profile(LoginDatas?.user_id)
      .then(({ data }) => {
        dispatch(UpdateLoginUserData(data));
        setProfiledata(data);
        dispatch(Updatewebtest(data?.web_text));
        sessionStorage.setItem("webtext", data?.web_text);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {
        setloader(false);
      });
  };

  const handleEditWebText = () => {
    let profiledatas = {
      username: profileData?.username,
      name: profileData?.name,
      email: profileData?.email,
      mobile_no: profileData?.mobile_no,
      user_type: profileData?.user_type,
      admin_type: profileData?.admin_type,
      web_text: webtest,
      display_color: color
    };
    editprofile(profiledatas, LoginDatas?.user_id)
      .then((res) => {
        getUserProfileData();
        toast.success(res?.data);
        setEditWebText(false);
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  const ClearGroupFilters = () => {
    dispatch(
      UpdateGroupFilters({
        page: 1,
        values: {
          name: "",
          empty_group: 0
        }
      })
    );
  };

  const handleChangeDashboardMenu = (dashboard_menu, isChecked) => {
    setloader(true);
    let finalObj = {
      view_status: profileData?.view_status,
      dashboard_menu: isChecked
        ? dashboard_menu
        : !isChecked && profileData?.dashboard_menu === 3
        ? dashboard_menu === 3
          ? 0
          : dashboard_menu === 1
          ? 2
          : 1
        : 0
    };
    ChangeUserMenu(profileData?.user_id, JSONtoformdata(finalObj))
      .then((response) => {
        if (typeof response?.data === "string") {
          toast.success(response?.data);
          getUserProfileData();
        } else {
          // toast.error("Something went wrong");
        }
      })
      .catch((error) => {
        getCatchMsg(error);
      })
      .finally(() => {
        setloader(false);
      });
  };

  const handleClearUserFilters = () => {
    dispatch(
      UpdateUserFilters({
        page: 1,
        values: {
          is_empty: 0,
          usertype: "",
          group_id: "",
          name: ""
        }
      })
    );
  };

  const handleClearDeviceFilters = () => {
    dispatch(
      UpdateDeviceFilter({
        page: 1,
        values: {
          device_code: "",
          device_name: "",
          controller_id: "",
          device_type: "",
          order_by: "",
          order: ""
        }
      })
    );
  };

  const handleMenuClick = () => {
    if (breakPoint) {
      setShowSidebar(!ShowSidebar);
    } else {
      toggleSidebar();
    }
  };

  const handleMotorClick = () => {
    localStorage.setItem("contollertype", 1);
    setControllerTypes(1);
    handleMotorScreens();
  };

  const handleLightClick = () => {
    setControllerTypes(2);
    localStorage.setItem("contollertype", 2);
    handleLightScreens();
  };

  useEffect(() => {
    getUserProfileData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getUserProfileData(true);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (breakPoint) {
      setShowSidebar(false);
    }
  }, [location.pathname, breakPoint]);

  // Sidebar Links Component
  const SidebarLinks = ({ isCollapsed = false }) => (
    <div className="sidebar-content">
      {!isCollapsed && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <img src={ExportedImages.PHOTONIC_LOGO_SVG} className="app-logo" />
          <br />
        </div>
      )}
      {usertype === 4 ? null : usertype === 3 ? (
        <>
          <Link
            to="/dashboard/group"
            state={{
              ...location.state,
              pevpath: location?.pathname,
              cntype: controllerType
            }}
            className="dashbord-pages"
            onClick={() => {
              if (breakPoint) setShowSidebar(false);
              ClearGroupFilters();
            }}
          >
            <FaUsers className="icons user" />
            {!isCollapsed && <p className="page-name">Groups</p>}
            {isCollapsed && <span className="tooltip-text">Groups</span>}
          </Link>
          {/* <Link
            className="dashbord-pages"
            onClick={() => {
              if (!isCollapsed) {
                setShowMenus((pre) => !pre);
              }
            }}
          >
            <BiSolidCategory
              className="icons user"
              style={{ width: "30px", height: "28px" }}
            />
            {!isCollapsed && <p className="page-name">Report View</p>}
            {isCollapsed && <span className="tooltip-text">Report View</span>}
          </Link> */}
          {showMenus && !isCollapsed && (
            <div className={"menuBox"}>
              <CommonCheckbox
                checked={profileData?.dashboard_menu === 3}
                lable={"Both"}
                onChange={(checked) => {
                  handleChangeDashboardMenu(3, checked);
                }}
              />
              <CommonCheckbox
                checked={
                  profileData?.dashboard_menu === 1 ||
                  profileData?.dashboard_menu === 3
                }
                lable={"Power Consumption"}
                onChange={(checked) => {
                  handleChangeDashboardMenu(1, checked);
                }}
              />
              {controllerType !== 2 && (
                <CommonCheckbox
                  checked={
                    profileData?.dashboard_menu === 2 ||
                    profileData?.dashboard_menu === 3
                  }
                  lable={"Water Consumption"}
                  onChange={(checked) => {
                    handleChangeDashboardMenu(2, checked);
                  }}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <Link
            to="/dashboard"
            className="dashbord-pages"
            onClick={() => {
              if (breakPoint) setShowSidebar(false);
            }}
          >
            <img src={ExportedImages.DASHBOARD_ICON} className="icons home" />
            {!isCollapsed && <p className="page-name">Dashboard</p>}
            {isCollapsed && <span className="tooltip-text">Dashboard</span>}
          </Link>
          <div
            className="dashbord-pages"
            onClick={() => {
              HandleClickController();
              if (breakPoint) setShowSidebar(false);
            }}
            style={{ cursor: "pointer" }}
          >
            <img
              src={
                controllerType === 1
                  ? ExportedImages.MOTOR_ICON
                  : ExportedImages.LIGHTS_ICON
              }
              style={{ width: "31px", marginTop: "-8px", height: "31px" }}
              className="icons home"
            />
            {!isCollapsed && <p className="page-name ">Controller</p>}
            {isCollapsed && <span className="tooltip-text">Controller</span>}
          </div>

          {usertype === 1 ? (
            <Link
              to="/dashboard/controllerdevice"
              className="dashbord-pages"
              onClick={() => {
                if (breakPoint) setShowSidebar(false);
                handleClearDeviceFilters();
              }}
            >
              <img src={ExportedImages.DEVICE_ICON} className="icons home" />
              {!isCollapsed && <p className="page-name">Device</p>}
              {isCollapsed && <span className="tooltip-text">Device</span>}
            </Link>
          ) : null}

          <Link
            to={
              usertype === 2
                ? "/dashboard/user/viewuser/subuser"
                : "/dashboard/user/viewuser/admin"
            }
            className="dashbord-pages"
            onClick={() => {
              if (breakPoint) setShowSidebar(false);
              handleClearUserFilters();
            }}
          >
            <img src={ExportedImages.USERS_ICON} className="icons home" />
            {!isCollapsed && <p className="page-name">User Details</p>}
            {isCollapsed && <span className="tooltip-text">User Details</span>}
          </Link>
          <Link
            to="/dashboard/group"
            state={{
              ...location.state,
              pevpath: location?.pathname,
              cntype: controllerType
            }}
            className="dashbord-pages"
            onClick={() => {
              if (breakPoint) setShowSidebar(false);
              ClearGroupFilters();
            }}
          >
            <img src={ExportedImages.GROUPS_ICON} className="icons home" />
            {!isCollapsed && <p className="page-name">Groups</p>}
            {isCollapsed && <span className="tooltip-text">Groups</span>}
          </Link>
          <Link
            to="/dashboard/report"
            className="dashbord-pages"
            onClick={() => {
              if (breakPoint) setShowSidebar(false);
            }}
          >
            <RiFileExcel2Fill className="icons user" />
            {!isCollapsed && <p className="page-name"> Reports</p>}
            {isCollapsed && <span className="tooltip-text">Report</span>}
          </Link>
          {usertype === 1 && (
            <>
              <Link
                to="/dashboard/production_history"
                className="dashbord-pages"
                onClick={() => {
                  if (breakPoint) setShowSidebar(false);
                }}
              >
                <img
                  src={ExportedImages.PRODUCTION_HISTORY_ICON}
                  className="icons user"
                />
                {!isCollapsed && <p className="page-name">History</p>}
                {isCollapsed && <span className="tooltip-text">History</span>}
              </Link>
              <Link
                to="/dashboard/amcreport"
                className="dashbord-pages"
                onClick={() => {
                  if (breakPoint) setShowSidebar(false);
                }}
              >
                <img src={ExportedImages.AMC_ICON} className="icons user" />
                {!isCollapsed && <p className="page-name">AMC Report</p>}
                {isCollapsed && (
                  <span className="tooltip-text">AMC Report</span>
                )}
              </Link>
              <Link
                to="/dashboard/sim"
                className="dashbord-pages"
                onClick={() => {
                  if (breakPoint) setShowSidebar(false);
                }}
              >
                <img src={ExportedImages.SIM_ICON} className="icons user" />
                {!isCollapsed && <p className="page-name">SIM</p>}
                {isCollapsed && <span className="tooltip-text">SIM</span>}
              </Link>
              <Link
                to="/dashboard/mqtt"
                className="dashbord-pages"
                onClick={() => {
                  if (breakPoint) setShowSidebar(false);
                }}
              >
                <SiMqtt
                  className="icons user"
                  style={{ width: "30px", height: "28px" }}
                />
                {!isCollapsed && <p className="page-name">Mqtt</p>}
                {isCollapsed && <span className="tooltip-text">Mqtt</span>}
              </Link>
              <Link
                to="/dashboard/payment_history"
                className="dashbord-pages"
                onClick={() => {
                  if (breakPoint) setShowSidebar(false);
                }}
              >
                <img src={ExportedImages.PAYMENT_ICON} className="icons user" />
                {!isCollapsed && <p className="page-name">Payment History</p>}
                {isCollapsed && (
                  <span className="tooltip-text">Payment History</span>
                )}
              </Link>
              <Link
                to="/dashboard/sms_setting"
                className="dashbord-pages"
                onClick={() => {
                  if (breakPoint) setShowSidebar(false);
                }}
              >
                <img src={ExportedImages.SMS_ICON} className="icons user" />
                {!isCollapsed && <p className="page-name">SMS Setting</p>}
                {isCollapsed && (
                  <span className="tooltip-text">SMS Setting</span>
                )}
              </Link>
            </>
          )}
          {/* <Link
            className="dashbord-pages"
            onClick={() => {
              if (!isCollapsed) {
                setShowMenus((pre) => !pre);
              }
            }}
          >
            <BiSolidCategory
              className="icons user"
              style={{ width: "30px", height: "28px" }}
            />
            {!isCollapsed && <p className="page-name">Report View</p>}
            {isCollapsed && <span className="tooltip-text">Report View</span>}
          </Link> */}

          {usertype === 1 && (
            <Link
              to="/dashboard/list_controllers"
              className="dashbord-pages"
              onClick={() => {
                if (breakPoint) setShowSidebar(false);
              }}
            >
              <img src={ExportedImages.SIM_ICON} className="icons user" />
              {!isCollapsed && <p className="page-name">List Controllers</p>}
              {isCollapsed && (
                <span className="tooltip-text">List Controllers</span>
              )}
            </Link>
          )}
          {usertype === 1 && (
            <Link
              to={"/dashboard/permission"}
              className="dashbord-pages"
              onClick={() => {
                if (breakPoint) setShowSidebar(false);
                handleClearUserFilters();
              }}
            >
              <img src={ExportedImages.USERS_ICON} className="icons home" />
              {!isCollapsed && <p className="page-name">User Permission</p>}
              {isCollapsed && (
                <span className="tooltip-text">User Permission</span>
              )}
            </Link>
          )}
          {showMenus && !isCollapsed && (
            <div className={"menuBox"}>
              <CommonCheckbox
                checked={profileData?.dashboard_menu === 3}
                lable={"Both"}
                onChange={(checked) => {
                  handleChangeDashboardMenu(3, checked);
                }}
              />
              <CommonCheckbox
                checked={
                  profileData?.dashboard_menu === 1 ||
                  profileData?.dashboard_menu === 3
                }
                lable={"Power Consumption"}
                onChange={(checked) => {
                  handleChangeDashboardMenu(1, checked);
                }}
              />
              {controllerType !== 2 && (
                <CommonCheckbox
                  checked={
                    profileData?.dashboard_menu === 2 ||
                    profileData?.dashboard_menu === 3
                  }
                  lable={"Water Consumption"}
                  onChange={(checked) => {
                    handleChangeDashboardMenu(2, checked);
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  useEffect(() => {
    if (LoginUserData.user_id && !userpersmission?.data) {
      handleUserPrmission();
    }
    if (userpersmission?.data) {
      if (
        getPermissionDetailsById(userpersmission?.data, 26) ||
        usertype == 1
      ) {
        setControllerTypes(1);
        localStorage.setItem("contollertype", 1);
        handleMotorScreens();
      } else {
        setControllerTypes(2);
        localStorage.setItem("contollertype", 2);
        handleLightScreens();
      }
    }
  }, [LoginUserData.user_id, userpersmission]);

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

  const getPermissionDetailsById = (permissions, id) => {
    if (!Array.isArray(permissions)) return null;

    const item = permissions.find(
      (p) => p.permission_id === id && p.status === 1
    );

    return item
      ? { title: item.title, permission_id: item.permission_id }
      : null;
  };

  console.log(profileData, LoginDatas?.profile_img, "UserPermsdsfsission");

  return (
    <>
      <Loader isLoader={loader} />
      {ShowLogoutModal ? (
        <DeleteConfirmationModal
          Deletekey={10}
          close={() => setShowLogoutModal(false)}
          show={ShowLogoutModal}
        />
      ) : null}

      {/* Main Layout */}
      <div className="dashboard-layout">
        {/* Vertical Sidebar - Always visible but with mobile overlay behavior */}
        <div
          className={`vertical-sidebar ${
            breakPoint ? (ShowSidebar ? "mobile-open" : "mobile-hidden") : ""
          } ${isSidebarCollapsed ? "collapsed" : ""}`}
          style={{ backgroundColor: "#203b57", overflowX: "hidden" }}
        >
          <SidebarLinks isCollapsed={isSidebarCollapsed} />
        </div>

        {/* Mobile Backdrop */}
        {breakPoint && ShowSidebar && (
          <div
            className="mobile-sidebar-backdrop"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Content Area */}
        <div
          className={`main-content ${
            breakPoint ? "" : isSidebarCollapsed ? "collapsed" : ""
          }`}
        >
          {/* Horizontal Navbar */}
          <Navbar
            expand="lg"
            className="horizontal-navbar"
            style={{
              backgroundColor: "#fff",
              borderBottom: "1px solid #0000000d",
              position: "sticky",
              top: 0,
              zIndex: 999
            }}
          >
            <Container fluid>
              <div className="navbar-left">
                <button
                  className="sidebar-toggle"
                  onClick={handleMenuClick}
                  style={{ marginLeft: "10px" }}
                >
                  <FaBars size={"20px"} />
                </button>
                <Navbar.Brand>
                  {/* <img
                    src={ExportedImages.PHOTONIC_LOGO_MAIN}
                    onClick={() => navigate("/dashboard")}
                    className="navbar-logo"
                    alt="Logo"
                  /> */}
                </Navbar.Brand>
              </div>

              <div className="navbar-center">
                {location?.pathname !== "/dashboard/amcreport" &&
                  location.pathname !== "/dashboard/sim" &&
                  location?.pathname !== "/dashboard/payment_history" &&
                  location?.pathname !== "/dashboard/sms_setting" &&
                  location?.pathname !== "/dashboard/production_history" &&
                  location?.pathname !== "/dashboard/mqtt" && (
                    <div
                      className={
                        getPermissionDetailsById(userpersmission?.data, 26) ||
                        usertype === 1 ||
                        getPermissionDetailsById(userpersmission?.data, 27)
                          ? "controllers"
                          : ""
                      }
                    >
                      {getPermissionDetailsById(userpersmission?.data, 26) ||
                      usertype === 1 ? (
                        <Button
                          variant="link"
                          className={`controller-btn ${
                            controllerTypes === 1 ? "active" : "inactive"
                          }`}
                          onClick={handleMotorClick}
                        >
                          <img
                            src={
                              controllerTypes === 1
                                ? ExportedImages.MOTOR_WHITE_ICON
                                : ExportedImages.MOTOR_BLACK_ICON
                            }
                            style={{ width: "20px", marginRight: "8px" }}
                            alt="Motor"
                          />
                          Motor Controllers
                        </Button>
                      ) : null}
                      {getPermissionDetailsById(userpersmission?.data, 27) ||
                      usertype === 1 ? (
                        <Button
                          variant="link"
                          className={`controller-btn ${
                            controllerTypes === 2 ? "active" : "inactive"
                          }`}
                          onClick={handleLightClick}
                        >
                          <img
                            src={
                              controllerTypes === 2
                                ? ExportedImages.LIGHT_WHITE_ICON
                                : ExportedImages.LIGHT_BLACK_ICON
                            }
                            style={{ width: "20px", marginRight: "8px" }}
                            alt="Light"
                          />
                          Light Controllers
                        </Button>
                      ) : null}
                    </div>
                  )}
              </div>

              <div className="navbar-right">
                <div className="webtext-section">
                  {editWebText ? (
                    <>
                      <input
                        type="text"
                        defaultValue={webtest ? webtest : webtextdata}
                        autoFocus
                        maxLength={200}
                        className="webtext"
                        onChange={(e) => {
                          dispatch(Updatewebtest(e.target.value));
                        }}
                        style={{ color: color ? color : "black" }}
                      />
                      {/* Color picker */}
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{
                          width: "20px",
                          height: "20px",
                          padding: 0,
                          border: "none",
                          borderRadius: "5px"
                        }}
                      />
                    </>
                  ) : (
                    <p
                      className="login-name"
                      style={{
                        color: color ? color : LoginDatas?.display_color,
                        margin: 0,
                        fontWeight: 500
                      }}
                    >
                      {webtest ? webtest : webtextdata}
                    </p>
                  )}
                  {(webtest || webtextdata) &&
                  location?.pathname != "/dashboard/profile" ? (
                    <RiEdit2Fill
                      onClick={() => {
                        if (editWebText) {
                          handleEditWebText();
                        } else {
                          setEditWebText(true);
                        }
                      }}
                      style={{ cursor: "pointer", color: "white" }}
                    />
                  ) : null}
                </div>

                <Dropdown>
                  <div className="user-dropdown-container">
                    <Dropdown.Toggle
                      style={{
                        backgroundColor: "transparent",
                        color: "white",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                    >
                      {LoginDatas?.name}
                    </Dropdown.Toggle>
                    <Dropdown.Toggle
                      style={{
                        backgroundColor: "transparent",
                        color: "white",
                        border: "none"
                      }}
                    >
                      {/* <HiOutlineUserCircle
                        className="nameicon"
                        imageRendering={LoginDatas?.img}
                        style={{ color: "white", fontSize: "1.5rem" }}
                      /> */}
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#2d3748"
                        }}
                      >
                        {LoginDatas?.profile_img || profileData?.profile_img ? (
                          <img
                            src={
                              profileData?.profile_img
                                ? profileData?.profile_img
                                : LoginDatas?.profile_img
                            }
                            alt="User"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                          />
                        ) : (
                          <HiOutlineUserCircle
                            style={{
                              color: "white",
                              fontSize: "1.8rem"
                            }}
                          />
                        )}
                      </div>
                    </Dropdown.Toggle>
                  </div>

                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => {
                        handleProfileClick();
                      }}
                    >
                      <div className="user_dropdown">
                        <FaUser style={{ fontSize: "12px" }} />
                        <span>Profile</span>
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setShowLogoutModal(true);
                      }}
                    >
                      <div className="user_dropdown_logout">
                        <FaPowerOff style={{ fontSize: "12px" }} />
                        <span>Log out</span>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Container>
          </Navbar>

          {/* Page Content */}
          <div className="page-content">
            <Outlet />
          </div>

          {/* Mobile Controller Buttons */}
          {breakPoint &&
            location?.pathname !== "/dashboard/amcreport" &&
            location.pathname !== "/dashboard/sim" &&
            location?.pathname !== "/dashboard/payment_history" &&
            location?.pathname !== "/dashboard/sms_setting" &&
            location?.pathname !== "/dashboard/production_history" &&
            location?.pathname !== "/dashboard/mqtt" && (
              <div className="mobile-controllers">
                {getPermissionDetailsById(userpersmission?.data, 26) ||
                usertype === 1 ? (
                  <button
                    type="button"
                    className={controllerType == 1 ? "motor" : "light"}
                    onClick={() => {
                      localStorage.setItem("contollertype", 1);
                      handleMotorScreens();
                    }}
                  >
                    <img
                      src={
                        controllerType === 1
                          ? ExportedImages.MOTOR_WHITE_ICON
                          : ExportedImages.MOTOR_BLACK_ICON
                      }
                      style={{ width: "35px", marginTop: "-3px" }}
                      className="light-img"
                      alt="Motor"
                    />
                    &nbsp;&nbsp; Motor Controllers
                  </button>
                ) : null}
                {getPermissionDetailsById(userpersmission?.data, 27) ||
                usertype === 1 ? (
                  <button
                    type="button"
                    className={controllerType === 2 ? "motor" : "light"}
                    onClick={() => {
                      localStorage.setItem("contollertype", 2);
                      handleLightScreens();
                    }}
                  >
                    <img
                      src={
                        controllerType === 1
                          ? ExportedImages.LIGHT_BLACK_ICON
                          : ExportedImages.LIGHT_WHITE_ICON
                      }
                      style={{ width: "35px", marginTop: "-8px" }}
                      className="light-img"
                      alt="Light"
                    />
                    &nbsp;&nbsp;Light Controllers
                  </button>
                ) : null}
              </div>
            )}
        </div>
      </div>
    </>
  );
}
