import React, { useEffect, useState } from "react";
import "./Dashboard.modules.css";
import { MdLogout } from "react-icons/md";
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
import { ChangeUserMenu, editprofile, profile } from "../../Service/ApiService";
import { FaPowerOff } from "react-icons/fa";
import MobileNotificationModal from "../../Modalcomponents/MobileNotificationModal";
import { getCatchMsg, JSONtoformdata } from "../../Utilities/Methods";
import { ExportedImages } from "../../Utilities/ImageExport";
import { Checkbox } from "antd";
import CommonCheckbox from "../../Components/CommonComponents/CommonCheckbox";

export default function Header() {
  let navigate = useNavigate();
  let location = useLocation();
  let dispatch = useDispatch();

  let controllerType = JSON.parse(localStorage?.getItem("contollertype"));
  let LoginDatas = JSON?.parse(getCookie?.("cookiedata"));
  let webtextdata = sessionStorage.getItem("webtext");
  const { webtest } = useSelector((state) => state);
  let usertype = LoginDatas?.user_type;

  const [loader, setloader] = useState(false);
  const [ShowSidebar, setShowSidebar] = useState(false);
  const [editWebText, setEditWebText] = useState(false);
  const [ShowLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenus, setShowMenus] = useState(false);
  const [profileData, setProfiledata] = useState();
  const [notificationModal, setNotificationModal] = useState({
    show: false
  });

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

  const getUserProfileData = () => {
    setloader(true);
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
      web_text: webtest
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

  // show modile notification
  // const handleMobileNotification = () => {
  //   setNotificationModal((pre) => ({ ...pre, show: true }));
  // };

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

  useEffect(() => {
    getUserProfileData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getUserProfileData();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Loader isLoader={loader} />
      {/* {notificationModal.show && (
        <MobileNotificationModal
          show={notificationModal.show}
          close={(type) => {
            setNotificationModal({ show: false });
            if (type) {
              getUserProfileData();
            }
          }}
          notification_access={profileData?.notification_access || []}
        />
      )} */}
      {ShowLogoutModal ? (
        <DeleteConfirmationModal
          Deletekey={10}
          close={() => setShowLogoutModal(false)}
          show={ShowLogoutModal}
        />
      ) : null}

      <Offcanvas
        show={ShowSidebar}
        onHide={() => setShowSidebar(false)}
        className="side-bar"
      >
        <Offcanvas.Header>
          <Offcanvas.Title>
            <img src={ExportedImages.PHOTONIC_LOGO_SVG} className="app-logo" />
          </Offcanvas.Title>
        </Offcanvas.Header>
        <div className="side-bar">
          <div className="nav-container">
            <img src={ExportedImages.PHOTONIC_LOGO_SVG} className="app-logo" />
            <br />
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
                    setShowSidebar(false);
                    ClearGroupFilters();
                  }}
                >
                  <FaUsers className="icons user" />
                  <p className="page-name">Groups</p>
                </Link>
                <Link
                  className="dashbord-pages"
                  onClick={() => {
                    setShowMenus((pre) => !pre);
                  }}
                >
                  <BiSolidCategory
                    className="icons user"
                    style={{ width: "30px", height: "28px" }}
                  />
                  <p className="page-name">Report View</p>
                </Link>
                {showMenus && (
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
                    setShowSidebar(false);
                  }}
                >
                  <img
                    src={ExportedImages.DASHBOARD_ICON}
                    className="icons home"
                  />
                  <p className="page-name">Dashboard</p>
                </Link>
                <div
                  className="dashbord-pages"
                  onClick={() => {
                    HandleClickController();
                    setShowSidebar(false);
                  }}
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

                  <p className="page-name ">Controller</p>
                </div>

                {usertype === 1 ? (
                  <Link
                    to="/dashboard/controllerdevice"
                    className="dashbord-pages"
                    onClick={() => {
                      setShowSidebar(false);
                      handleClearDeviceFilters();
                    }}
                  >
                    <img
                      src={ExportedImages.DEVICE_ICON}
                      className="icons home"
                    />
                    <p className="page-name">Device</p>
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
                    setShowSidebar(false);
                    handleClearUserFilters();
                  }}
                >
                  <img src={ExportedImages.USERS_ICON} className="icons home" />
                  <p className="page-name">User Details</p>
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
                    setShowSidebar(false);
                    ClearGroupFilters();
                  }}
                >
                  <img
                    src={ExportedImages.GROUPS_ICON}
                    className="icons home"
                  />
                  <p className="page-name">Groups</p>
                </Link>
                <Link
                  to="/dashboard/report"
                  className="dashbord-pages"
                  onClick={() => {
                    setShowSidebar(false);
                  }}
                >
                  <RiFileExcel2Fill className="icons user" />
                  <p className="page-name">report</p>
                </Link>
                {usertype === 1 && (
                  <>
                    <Link
                      to="/dashboard/production_history"
                      className="dashbord-pages"
                      onClick={() => {
                        setShowSidebar(false);
                      }}
                    >
                      <img
                        src={ExportedImages.PRODUCTION_HISTORY_ICON}
                        className="icons user"
                      />
                      <p className="page-name">History</p>
                    </Link>
                    {/* <Link
                      to="/dashboard/monitoring"
                      className="dashbord-pages"
                      onClick={() => {
                        setShowSidebar(false);
                      }}
                    >
                      <img
                        src={ExportedImages.PRODUCTION_HISTORY_ICON}
                        className="icons user"
                      />
                      <p className="page-name">Monitoring</p>
                    </Link> */}
                    <Link
                      to="/dashboard/amcreport"
                      className="dashbord-pages"
                      onClick={() => {
                        setShowSidebar(false);
                      }}
                    >
                      <img
                        src={ExportedImages.AMC_ICON}
                        className="icons user"
                      />

                      <p className="page-name">AMC Report</p>
                    </Link>
                    <Link
                      to="/dashboard/sim"
                      className="dashbord-pages"
                      onClick={() => {
                        setShowSidebar(false);
                      }}
                    >
                      <img
                        src={ExportedImages.SIM_ICON}
                        className="icons user"
                      />
                      <p className="page-name">SIM</p>
                    </Link>
                    <Link
                      to="/dashboard/mqtt"
                      className="dashbord-pages"
                      onClick={() => {
                        setShowSidebar(false);
                      }}
                    >
                      <SiMqtt
                        className="icons user"
                        style={{ width: "30px", height: "28px" }}
                      />
                      <p className="page-name">Mqtt</p>
                    </Link>

                    <Link
                      to="/dashboard/payment_history"
                      className="dashbord-pages"
                      onClick={() => {
                        setShowSidebar(false);
                      }}
                    >
                      <img
                        src={ExportedImages.PAYMENT_ICON}
                        className="icons user"
                      />
                      <p className="page-name">Payment History</p>
                    </Link>
                    <Link
                      to="/dashboard/sms_setting"
                      className="dashbord-pages"
                      onClick={() => {
                        setShowSidebar(false);
                      }}
                    >
                      <img
                        src={ExportedImages.SMS_ICON}
                        className="icons user"
                      />
                      <p className="page-name">SMS Setting</p>
                    </Link>
                  </>
                )}
                <Link
                  className="dashbord-pages"
                  onClick={() => {
                    setShowMenus((pre) => !pre);
                  }}
                >
                  <BiSolidCategory
                    className="icons user"
                    style={{ width: "30px", height: "28px" }}
                  />
                  <p className="page-name">Report View</p>
                </Link>
                {usertype === 1 && (
                  <Link
                    to={"/dashboard/permission"}
                    className="dashbord-pages"
                    onClick={() => {
                      setShowSidebar(false);
                      handleClearUserFilters();
                    }}
                  >
                    <img
                      src={ExportedImages.USERS_ICON}
                      className="icons home"
                    />
                    <p className="page-name">User Permission</p>
                  </Link>
                )}
                {showMenus && (
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
        </div>
      </Offcanvas>

      <div className="dashbord">
        <div className="top-bar">
          <Navbar bg="light" expand="lg">
            <Container fluid>
              <Navbar.Brand>
                <img
                  src={ExportedImages.PHOTONIC_LOGO_MAIN}
                  onClick={() => navigate("/dashboard")}
                />
              </Navbar.Brand>
              <div className="responsiveToggleContainer">
                {/* {(usertype === 1 || usertype === 2) && (
                  <img
                    src={ExportedImages.NOTIFICATION_ICON}
                    onClick={() => {
                      handleMobileNotification();
                    }}
                    className="notificationIcon"
                  />
                )} */}
                <Navbar.Toggle
                  aria-controls="basic-navbar-nav"
                  // onClick={() => setShowSidebar((pre) => !pre)}
                />
              </div>

              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
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
                          setShowSidebar(false);
                          ClearGroupFilters();
                        }}
                      >
                        <FaUsers className="icons user" />
                        <p className="page-name-nav">Groups</p>
                      </Link>
                      <Link
                        className="dashbord-pages"
                        onClick={() => {
                          setShowMenus((pre) => !pre);
                        }}
                      >
                        <BiSolidCategory
                          className="icons user"
                          style={{ width: "28px", height: "28px" }}
                        />

                        <p className="page-name">Report View</p>
                      </Link>
                      {showMenus && (
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
                          setShowSidebar(false);
                        }}
                      >
                        <img
                          src={ExportedImages.DASHBOARD_ICON}
                          className="icons home"
                        />
                        <p className="page-name-nav">Dashboard</p>
                      </Link>
                      <div
                        className="dashbord-pages"
                        onClick={() => {
                          HandleClickController();
                          setShowSidebar(false);
                        }}
                      >
                        <img
                          src={
                            controllerType === 1
                              ? ExportedImages.MOTOR_ICON
                              : ExportedImages.LIGHTS_ICON
                          }
                          style={{
                            width: "31px",
                            marginTop: "-8px",
                            height: "31px"
                          }}
                          className="icons home"
                        />
                        <p className="page-name-nav ">Controller</p>
                      </div>

                      {usertype === 1 ? (
                        <Link
                          to="/dashboard/controllerdevice"
                          className="dashbord-pages"
                          onClick={() => {
                            setShowSidebar(false);
                            handleClearDeviceFilters();
                          }}
                        >
                          <img
                            src={ExportedImages.DEVICE_ICON}
                            className="icons home"
                          />
                          <p className="page-name">Device</p>
                        </Link>
                      ) : null}
                      <Link
                        className="dashbord-pages"
                        to={
                          usertype === 2
                            ? "/dashboard/user/viewuser/subuser"
                            : "/dashboard/user/viewuser/admin"
                        }
                        onClick={() => {
                          setShowSidebar(false);
                          handleClearUserFilters();
                        }}
                      >
                        <img
                          src={ExportedImages.USERS_ICON}
                          className="icons home"
                        />
                        <p className="page-name-nav">User Details</p>
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
                          setShowSidebar(false);
                          ClearGroupFilters();
                        }}
                      >
                        <img
                          src={ExportedImages.GROUPS_ICON}
                          className="icons home"
                        />
                        <p className="page-name-nav">Groups</p>
                      </Link>
                      <Link
                        to="/dashboard/report"
                        className="dashbord-pages"
                        onClick={() => {
                          setShowSidebar(false);
                        }}
                      >
                        <FaUsers className="icons user" />
                        <p className="page-name">report</p>
                      </Link>
                      {usertype === 1 && (
                        <>
                          <Link
                            to="/dashboard/production_history"
                            className="dashbord-pages"
                            onClick={() => {
                              setShowSidebar(false);
                            }}
                          >
                            <img
                              src={ExportedImages.PRODUCTION_HISTORY_ICON}
                              className="icons user"
                              style={{ width: "30px" }}
                            />
                            <p className="page-name">History</p>
                          </Link>
                          {/* <Link
                            to="/dashboard/monitoring"
                            className="dashbord-pages"
                            onClick={() => {
                              setShowSidebar(false);
                            }}
                          >
                            <img
                              src={ExportedImages.PRODUCTION_HISTORY_ICON}
                              className="icons user"
                              style={{ width: "30px" }}
                            />
                            <p className="page-name">Monitoring</p>
                          </Link> */}
                          <Link
                            to="/dashboard/amcreport"
                            className="dashbord-pages"
                            onClick={() => {
                              setShowSidebar(false);
                            }}
                          >
                            <img
                              src={ExportedImages.AMC_ICON}
                              className="icons user"
                            />

                            <p className="page-name">AMC Report</p>
                          </Link>
                          <Link
                            to="/dashboard/sim"
                            className="dashbord-pages"
                            onClick={() => {
                              setShowSidebar(false);
                            }}
                          >
                            <img
                              src={ExportedImages.SIM_ICON}
                              className="icons user"
                            />

                            <p className="page-name">SIM</p>
                          </Link>
                          <Link
                            to="/dashboard/payment_history"
                            className="dashbord-pages"
                            onClick={() => {
                              setShowSidebar(false);
                            }}
                          >
                            <img
                              src={ExportedImages.PAYMENT_ICON}
                              className="icons user"
                            />
                            <p className="page-name">Payment History</p>
                          </Link>
                          <Link
                            to="/dashboard/sms_setting"
                            className="dashbord-pages"
                            onClick={() => {
                              setShowSidebar(false);
                            }}
                          >
                            <img
                              src={ExportedImages.SMS_ICON}
                              className="icons user"
                            />
                            <p className="page-name">SMS Setting</p>
                          </Link>
                        </>
                      )}

                      {usertype === 1 && (
                        <Link
                          to="/dashboard/mqtt"
                          className="dashbord-pages"
                          onClick={() => {
                            setShowSidebar(false);
                          }}
                        >
                          <SiMqtt
                            className="icons user"
                            style={{ width: "28px", height: "28px" }}
                          />
                          <p className="page-name">Mqtt</p>
                        </Link>
                      )}

                      <Link
                        className="dashbord-pages"
                        onClick={() => {
                          setShowMenus((pre) => !pre);
                        }}
                      >
                        <BiSolidCategory
                          className="icons user"
                          style={{ width: "28px", height: "28px" }}
                        />

                        <p className="page-name">Report View</p>
                      </Link>
                      {showMenus && (
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
                      <Link
                        to="/dashboard/profile"
                        className="dashbord-pages"
                        onClick={() => {
                          setShowSidebar(false);
                        }}
                      >
                        <FaUser className="icons home" />
                        <p className="page-name-nav">Profile</p>
                      </Link>
                      <div
                        className="dashbord-pages"
                        onClick={() => setShowLogoutModal(true)}
                      >
                        <MdLogout className="icons home" />
                        <p className="page-name-nav ">Logout</p>
                      </div>
                    </>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          {/* Top BAR MAIN   -- It will disappear when the responsive size comes*/}
          <div className="page-container">
            <div className="top-nav">
              <div className="navbar-logo">
                {/* TOGGLE FOR SHOW CANVAS */}
                <Button
                  className="canvasbtn"
                  onClick={() => setShowSidebar(true)}
                >
                  <FaBars />
                </Button>
                <img
                  src={ExportedImages.PHOTONIC_LOGO_MAIN}
                  className="navimg"
                  onClick={() => navigate("/dashboard")}
                />
              </div>
              <div className="webtextflex">
                {editWebText ? (
                  <input
                    type="text"
                    defaultValue={webtest ? webtest : webtextdata}
                    autoFocus
                    maxLength={200}
                    className="webtext"
                    onChange={(e) => {
                      dispatch(Updatewebtest(e.target.value));
                    }}
                  ></input>
                ) : (
                  <p className="login-name">
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
                    style={{ cursor: "pointer" }}
                  />
                ) : null}
              </div>
              <Dropdown>
                <div>
                  {/* {(usertype === 1 || usertype === 2) && (
                    <img
                      src={ExportedImages.NOTIFICATION_ICON}
                      className="notificationIcon"
                      onClick={() => {
                        handleMobileNotification();
                      }}
                    />
                  )} */}
                  <Dropdown.Toggle className="login-name">
                    {LoginDatas?.name}
                  </Dropdown.Toggle>
                  <Dropdown.Toggle className="login-name">
                    <HiOutlineUserCircle className="nameicon" />
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
          </div>

          <Outlet />

          {location?.pathname !== "/dashboard/amcreport" &&
            location.pathname !== "/dashboard/sim" &&
            location?.pathname !== "/dashboard/payment_history" &&
            location?.pathname !== "/dashboard/sms_setting" &&
            location?.pathname !== "/dashboard/production_history" &&
            location?.pathname !== "/dashboard/mqtt" && (
              <div className="controllers">
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
                  />
                  &nbsp;&nbsp; Motor Controllers
                </button>
                {usertype !== 1 && (
                  <button
                    type="button"
                    className={controllerType == 2 ? "motor" : "light"}
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
                    />
                    &nbsp;&nbsp;Light Controllers
                  </button>
                )}
              </div>
            )}
        </div>
      </div>
    </>
  );
}
