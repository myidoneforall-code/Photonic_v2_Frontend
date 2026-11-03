import { useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { FaRegUserCircle, FaUser } from "react-icons/fa";
import { HiOutlineUserCircle } from "react-icons/hi";
import { Outlet, useLocation } from "react-router";
import DeleteConfirmationModal from "../Modalcomponents/DeleteConfirmationModal";
import { getCookie } from "../Utilities/Cookie";
import { Link } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { TiArrowBackOutline } from "react-icons/ti";
import { editprofile, profile } from "../Service/ApiService";
import { Updatewebtest } from "../Components/Store/Config/Configuration";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { RiEdit2Fill } from "react-icons/ri";
import { SiMqtt } from "react-icons/si";
import { ExportedImages } from "../Utilities/ImageExport";

export default function Productionlayout() {
  const [modal, setmodal] = useState(false);
  let username = JSON.parse(getCookie("cookiedata"));
  let location = useLocation();
  let webtextdata = sessionStorage.getItem("webtext");
  const [profiledata, setprofiledate] = useState();
  const { webtest } = useSelector((state) => state);
  const [edit, setedit] = useState(false);
  let dispatch = useDispatch();

  useEffect(() => {
    userprofile();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      userprofile();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, []);

  const userprofile = () => {
    profile(username?.user_id)
      .then(({ data }) => {
        setprofiledate(data);
        dispatch(Updatewebtest(data?.web_text));
        sessionStorage.setItem("webtext", data?.web_text);
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
  };

  const toupdate = () => {
    let profiledatas = {
      username: profiledata?.username,
      name: profiledata?.name,
      email: profiledata?.email,
      mobile_no: profiledata?.mobile_no,
      user_type: profiledata?.user_type,
      admin_type: profiledata?.admin_type,
      web_text: webtest,
    };
    editprofile(profiledatas, username?.user_id)
      .then((res) => {
        userprofile();
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
  };
  return (
    <>
      {modal ? (
        <DeleteConfirmationModal
          Deletekey={10}
          close={() => setmodal(false)}
          show={modal}
        />
      ) : null}

      <div className="router-production">
        <div className="productionbar">
          <div className="nav-container">
            <img src={ExportedImages.PHOTONIC_LOGO_SVG} className="app-logo" />
            <br />
            <Link to="/production/mqtt" className="dashbord-pages">
              <SiMqtt className="icons user" />
              <p className="page-name-nav">Mqtt</p>
            </Link>

            <Link
              to="/production/profile"
              state={{ ...location.state, pevpath: location?.pathname }}
              className="dashbord-pages"
            >
              <FaRegUserCircle className="production_icons user" />
              <p className="page-name">Profile</p>
            </Link>
            <Link
              to="/production"
              className="dashbord-pages"
              aria-controls="example-collapse-text"
            >
              <TiArrowBackOutline className="production_icons home" />
              <p className="page-name-nav">Back to test</p>
            </Link>
            <div className="dashbord-pages" onClick={() => setmodal(true)}>
              <MdLogout className="production_icons home" />
              <p className="page-name-nav ">Logout</p>
            </div>
          </div>
        </div>
        <div className="production-topbar" id="production">
          <Navbar bg="light" expand="lg">
            <Container fluid>
              <Navbar.Brand>
                <img src={ExportedImages.PHOTONIC_LOGO_MAIN} />
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Link to="/production/mqtt" className="dashbord-pages">
                    <SiMqtt className="icons user" />
                    <p className="page-name-nav">Mqtt</p>
                  </Link>
                  <Link
                    to="/production/profile"
                    className="dashbord-pages"
                    aria-controls="example-collapse-text"
                  >
                    <FaUser className="production_icons home" />
                    <p className="page-name-nav">Profile</p>
                  </Link>
                  <Link
                    to="/production"
                    className="dashbord-pages"
                    aria-controls="example-collapse-text"
                  >
                    <TiArrowBackOutline className="production_icons home" />
                    <p className="page-name-nav">Back to test</p>
                  </Link>
                  <div
                    className="dashbord-pages"
                    onClick={() => setmodal(true)}
                    aria-controls="example-collapse-text"
                  >
                    <MdLogout className="production_icons home" />
                    <p className="page-name-nav ">Logout</p>
                  </div>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <div className="page-container">
            <div className="productionnav">
              <div className="webtextflex" style={{ margin: "auto" }}>
                {edit ? (
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
                location?.pathname != "/production/profile" ? (
                  <RiEdit2Fill
                    onClick={() => {
                      if (edit) {
                        toupdate();
                        setedit(false);
                      } else {
                        setedit(true);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  />
                ) : null}
              </div>
              <div>
                <span className="login-name">{username?.name}</span>
                <HiOutlineUserCircle
                  className="nameicon"
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
          </div>
          <div className="router-pages">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
