import classes from "../LandingPages/Landingpage.module.css";
import { ExportedImages } from "../../Utilities/ImageExport";

export default function Contactus() {
  return (
    <>
      {/* <div className={classes.parent_div} style={{ paddingBottom: "50px" }}> */}
      {/* <section>
        <h2
          style={{ textAlign: "center", margin: "0" }}
          className={classes.contact_heading}
        >
          REACH US
        </h2>
      </section> */}
      <section>
        <div className={classes.contact_div}>
          <div>
            <p className={classes.sub_contact_head}>Office and Factory</p>
            <address className={classes.contact_text}>
              32 - D,Thiru.Ve.Ka.Road,
              <br />
              Karunanidhi Nagar,
              <br />
              Sowripalayam,
              <br />
              Coimbatore - 641 028,
              <br />
              Tamilnadu, India
            </address>
          </div>
          <div>
            <p className={classes.sub_contact_head}>Connect with us</p>
            <div className={classes.contact_us_div}>
              <div className={classes.contact_us_sub_div}>
                <img src={ExportedImages.CONTACT_US_CALL_ICON} />
                <div>
                  <p>97150 97150, 94434 89884</p>
                  <p>
                    <strong>Service</strong> : 98422 99884
                  </p>
                </div>
              </div>
              <div className={classes.contact_us_sub_div}>
                <img src={ExportedImages.ENVELOP_ICON} />
                <p>subramani@photonicsystem.in</p>
              </div>
              <div className={classes.contact_us_sub_div}>
                <img src={ExportedImages.WEB_ICON} />
                <div>
                  <p>www.photonicsystem.in</p>
                  <p>www.photonicsystem.net</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <Footer /> */}
      {/* </div> */}
    </>
  );
}
