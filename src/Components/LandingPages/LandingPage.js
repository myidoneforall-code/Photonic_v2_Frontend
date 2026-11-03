import classes from "../LandingPages/Landingpage.module.css";
import { Container, Nav, Navbar } from "react-bootstrap";
import "../../Assets/css/Dashboard.modules.css";
import { Outlet, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { ExportedImages } from "../../Utilities/ImageExport";

export default function Landingpage() {
  const location = useLocation();
  const { pathname } = location;

  return (
    <>
      {pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgotpwd" ||
      pathname === "/verifyotp" ? null : (
        <div
          className={`${classes.headr_container}  ${classes.landing_page_navbar}`}
        >
          <div
            className={` ${classes.nav_container}  ${classes.landing_page_navbar}`}
          >
            {/* bg-body-tertiary removed — .headr_container above already
            supplies the background color (#EFF1F6) for this whole bar.
            That Bootstrap class happened to resolve to transparent in
            production but an opaque #F8F9FA locally, sitting on top of
            .headr_container only in this centered content area and
            creating a visible color seam against the outer margins. */}
            <Navbar expand="lg">
              <Container fluid>
                <Navbar.Brand as={Link} to="/">
                  <img
                    src={ExportedImages.PHOTONIC_LOGO_MAIN}
                    style={{ width: "140px" }}
                  />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="ms-auto">
                    {/* <Nav.Link
                      as={Link}
                      to="/"
                      className={
                        pathname === "/"
                          ? classes.contact_us_button_active
                          : classes.contact_us_button
                      }
                    >
                      HOME
                    </Nav.Link>
                    <Nav.Link
                      as={Link}
                      to="/contact"
                      className={
                        pathname === "/contact"
                          ? classes.contact_us_button_active
                          : classes.contact_us_button
                      }
                    >
                      CONTACT US
                    </Nav.Link> */}
                    <Nav.Link
                      as={Link}
                      to="/login"
                      className={classes.login_button}
                    >
                      LOGIN
                    </Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          </div>
        </div>
      )}

      <Outlet />
      {/* 
      {pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgotpwd" ||
      pathname === "/verifyotp" ? null : (
        <div className={`${classes.parent_div} ${classes.footer_div}`}>
          <div className={classes.privacy_policy_div}>
            <p>
              © Copyright 2023. PS DAS-Photonic Supervisory Data Acquisition
              System
            </p>
            <p className={classes.footer}>
              <span onClick={() => navigate("/privacypolicy")}>
                Privacy Policy
              </span>
              &nbsp;<span className={classes.privacy_policy_line}></span>
              &nbsp;
              <span onClick={() => navigate("/termsandconditions")}>
                Terms and Conditions
              </span>
            </p>
          </div>
        </div>
      )} */}
    </>
  );
}
