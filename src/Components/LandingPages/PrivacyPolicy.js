import { Col, Row } from "react-bootstrap";
import classes from "../LandingPages/Landingpage.module.css";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import Footer from "./Footer";

export default function Privacypolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  return (
    <>
      <section>
        <div className={classes.privacypolicy_banner_images}>
          <div className={classes.banner_container}>
            <h2 className={classes.heading}>PRIVACY POLICY</h2>
          </div>
        </div>
      </section>
      <div className={`${classes.parent_div} ${classes.parent_container}`}>
        <section>
          <p className={classes.sub_pera}>
            Thank you for visiting our web site. This privacy policy tells you
            how we use personal information collected at this site. Please read
            this privacy policy before using the site or submitting any personal
            information. By using the site, you are accepting the practices
            described in this privacy policy. These practices may be changed,
            but any changes will be posted and changes will only apply to
            activities and information on a going forward, not retroactive
            basis. You are encouraged to review the privacy policy whenever you
            visit the site to make sure that you understand how any personal
            information you provide will be used. Note: The privacy practices
            set forth in this privacy policy are for this web site only. If you
            link to other web sites, please review the privacy policies posted
            at those sites.
          </p>
        </section>
        <section>
          <h2 className={classes.sub_heading}>Collection Of Information</h2>
          <p className={classes.sub_pera}>
            We collect personally identifiable information, like names, postal
            addresses, email addresses, etc., when you register with us. The
            information you provide is used to fulfil your specific request.
            This information is only used to fulfil your specific request,
            unless you give us permission to use it in another manner, for
            example to add you to one of our mailing lists.
          </p>
        </section>
        <section>
          <h2 className={classes.sub_heading}>
            Cookies And Browser Information
          </h2>
          <p className={classes.sub_pera}>
            The site may use cookies and tracking technology depending on the
            features offered. Cookies and tracking technology are useful for
            gathering information such as browser type and operating system,
            tracking the number of visitors to the site, and understanding how
            visitors use the site. Cookies can also help customise the site for
            visitors. Personal information cannot be collected via cookies and
            other tracking technology, however, if you previously provided
            personally identifiable information, cookies may be tied to such
            information. Aggregate cookies and tracking information may be
            shared with third parties. Cookies are small files that reside on
            your computer and allow us to recognise you on your next visit or
            store your shopping cart contents. We use them only to track this
            information. We place both temporary and permanent cookies in your
            hard drive.
          </p>
        </section>
        <section>
          <h2 className={classes.sub_heading}>Distribution Of Information</h2>
          <p className={classes.sub_pera}>
            Your information is only used to fill your order. We do not sell or
            redistribute your information to anyone. We may share information
            with governmental agencies or other companies assisting us in fraud
            prevention or investigation. We may do so when: (1) permitted or
            required by law or (2) trying to protect against or prevent actual
            or potential fraud or unauthorised transactions or (3) investigating
            fraud which has already taken place. The information is not provided
            to these companies for marketing purposes.
          </p>
        </section>
        <section>
          <h2 className={classes.sub_heading}>Security And Storage</h2>
          <p className={classes.sub_pera}>
            Only your order data billing, shipping, and order contents data is
            stored on our server. This information is encrypted using a Secure
            Sockets Layer before it is transmitted over a web server. We do not
            store your Credit Card data. Your personally identifiable
            information is kept secure. Only authorised employees, have access
            to this information. All emails and newsletters from this site allow
            you to opt out of further mailings.
          </p>
        </section>
        <section>
          <h2 className={classes.sub_heading}>Privacy Contact Information</h2>
          <p className={classes.sub_pera} style={{ textIndent: 0 }}>
            If you have any questions, concerns, or comments about our privacy
            policy you may contact us using the information below:
          </p>
          <p className={classes.sub_pera} style={{ textIndent: 0 }}>
            By E-mail:
            <strong style={{ color: "#fc6563" }}>
              subramani@photonicsystem.in
            </strong>
          </p>
          <p className={classes.sub_pera} style={{ textIndent: 0 }}>
            We reserve the right to make changes to this policy. Any changes to
            the policy will be applicable immediately
          </p>
        </section>
        <Footer />
      </div>
    </>
  );
}
