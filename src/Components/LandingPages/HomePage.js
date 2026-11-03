import classes from "../LandingPages/Landingpage.module.css";
import { useEffect } from "react";
import Footer from "./Footer";
import { ImYelp } from "react-icons/im";
import Contactus from "./ContactUs";
import { Col, Row } from "react-bootstrap";
import { ExportedImages } from "../../Utilities/ImageExport";

export default function Homepage() {
  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const point = <ImYelp className={classes.poin_design} />;

  return (
    <>
      <section>
        <div className={classes.home_banner_images}>
          <div className={classes.banner_container}>
            <p className={classes.pera_margin}>
              PHOTONIC SUPERVISORY DATA ACQUISITION SYSTEM FOR STREET LIGHT &
              WATER MANAGEMENT
            </p>
          </div>
        </div>
      </section>

      <div className={classes.home_container_padding}>
        <div className={classes.home_container_left_right_padding}>
          <div className={classes.parent_div}>
            <section>
              <Row className={classes.container_padding}>
                <Col md={6} className={classes.home_text_containers}>
                  <div>
                    <h3 className={classes.sub_heading}>
                      Welcome To PS DAS-Photonic, Coimbatore T.N.
                    </h3>
                    <p className={classes.sub_pera}>
                      <strong style={{ color: "#3797ed" }}>
                        PS DAS-Photonic Supervisory Data Acquisition System
                      </strong>{" "}
                      is a hardware cum software enabled system which helps to
                      control and monitor the entire street lighting system. If
                      the traditional lighting system is upgraded with{" "}
                      <strong style={{ color: "#3797ed" }}>PSDAS</strong>, the
                      benefits are more. By implementing{" "}
                      <strong style={{ color: "#3797ed" }}>PSDAS</strong>, We
                      can save money, save energy, save time, reduce manpower,
                      increase life span of bulbs, reduce co2 emission and
                      maintain the entire street lighting system efficiently.
                      Due to reduction of co2 emission this product is a{" "}
                      <strong style={{ color: "green" }}>ECO FRIENDLY</strong>.
                    </p>
                  </div>
                </Col>
                <Col md={6} className={classes.home_img_containers}>
                  <img
                    src={ExportedImages.HOMEPAGE_BANNER1}
                    alt="welcome"
                    className={classes.home_images_style}
                  />
                </Col>
              </Row>
            </section>
          </div>
        </div>
        <div className={classes.container_background}>
          <div className={classes.home_container_left_right_padding}>
            <div className={classes.parent_div}>
              <section>
                <Row
                  className={`${classes.container_padding} ${classes.flex_direction}`}
                >
                  <Col md={6} className={classes.home_img_containers}>
                    <img
                      src={ExportedImages.HOMEPAGE_BANNER2}
                      alt="company"
                      className={classes.home_images_style}
                    />
                  </Col>
                  <Col md={6} style={{ flexDirection: "column" }}>
                    <h3 className={classes.sub_heading}>Company Profile</h3>
                    <p className={classes.sub_pera}>
                      Photonic System was Started in the year 1991. It is an ISO
                      9001:2015 Certified Company which has been manufacturing
                      Intelligent Street Light Management System{" "}
                      <strong style={{ color: "#3797ed" }}>PSDAS</strong>,
                      Automatic Street Light Control Switch, Automatic Pumpset
                      Controller, Mobile Starter for Pumpsets, Intelligent Water
                      Management System{" "}
                      <strong style={{ color: "#3797ed" }}>PSDAS</strong>, Water
                      level Controller, Soft Starter for Power Tools and
                      Automatic High Mast Panels. Our Products are installed in
                      many Panchayat and Municipal Corporations of Tamilnadu,
                      Kerala, Karnataka, Andhra, Telangana, Maharashtra and
                      Chattisgarh. Our Customized Products are installed in the
                      private sector also.
                    </p>
                    <p className={classes.sub_pera}>
                      Automatic Street Light Control Switch and Pumpset
                      Controllers are approved by various Collectorate of
                      Tamilnadu. Our Products are installed in many Substations
                      and Power Generating Stations of TNEB. Automatic Motor
                      Pumpset Controllers are installed in Many Water Supply
                      Schemes of Tamilnadu Water Supply and Drainage Board,
                      Kerala Water Authority, PWD Electrical Division of
                      Kozhikode, PWD Electrical Subdivision of Trivandrum and
                      Various Panchayat, Municipalities and Corporations.
                    </p>
                  </Col>
                </Row>
              </section>
            </div>
          </div>
        </div>
        <div className={classes.home_container_left_right_padding}>
          <div className={classes.parent_div}>
            <section>
              <Row className={classes.container_padding}>
                <Col md={6}>
                  <h3 className={classes.sub_heading}>
                    Key benefits of real time monitoring
                  </h3>

                  <div className={classes.sub_pera} style={{ textIndent: 0 }}>
                    <ul className={classes.list}>
                      <li>
                        {point}
                        We can save money,save energy,reduce co2 emission and
                        eco system.
                      </li>
                      <li>
                        {point}
                        By using the monitoring data,we can analyze quality of
                        water,behavior of power supply and performance
                        individual light,group of lights and motors an power
                        variations.
                      </li>
                      <li>
                        {point}
                        By using alert data,we can rectify the specific problem
                        On time.
                      </li>
                      <li>
                        {point}
                        Optimized operation will helps to increase the life span
                        of motors and lights.
                      </li>

                      <li>
                        {point}
                        By the result of analytical reports,we can Optimize the
                        maintance of entire water and light management system.
                      </li>
                      <li>
                        {point}
                        Insightful data is beneficial for corrective action and
                        preventive actionaple plans for the future.
                      </li>
                    </ul>
                  </div>
                </Col>
                <Col md={6} className={classes.home_img_containers}>
                  <img
                    src={ExportedImages.HOMEPAGE_BANNER3}
                    alt="company"
                    className={classes.home_images_style}
                  />
                </Col>
              </Row>
            </section>
            {/* <section>
          <h3 className={classes.sub_heading}>AMR Technology Water Flow Meters</h3>
          <p className={classes.sub_pera}>
            We desire to Introduce Automatic Meter Reading Technology (AMR) to
            our reputed consumers. Usually the meter reader has visit to site to
            take the water flow meter reading periodically to find out the water
            consumption consumed by the consumer to raise the billing and other
            needs. To avoid such man power and accounting error and depending on
            their reports we have implemented the latest technology of AMR
            Systems. So the outcome of the meter reading shall be registered by
            AMR, upload to the server, all Authorised person can monitor and
            download the report in computer system and AMR Tech mobile app
            routinely.
          </p>
        </section> */}
          </div>
        </div>
      </div>

      {/* <div className={classes.privacy_policy_div}>
        <p>
          © Copyright 2021. PS DAS-Photonic Supervisory Data Acquisition System
        </p>
        <p>
          <span>Privacy Policy</span>
          &nbsp;<span className={classes.privacy_policy_line}></span>&nbsp;
          <span>Terms and Conditions</span>
        </p>
      </div> */}
      {/* </div> */}

      <div className={classes.contact_container}>
        <Contactus />
      </div>
      <Footer />
    </>
  );
}
