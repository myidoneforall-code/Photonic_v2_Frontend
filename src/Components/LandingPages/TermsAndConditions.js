import { useNavigate } from "react-router";
import classes from "../LandingPages/Landingpage.module.css";
import { useEffect } from "react";
import Footer from "./Footer";
import { ImFlattr, ImYelp } from "react-icons/im";

export default function Termsandconditions(second) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const point = <ImYelp className={classes.poin_design} />;
  const style = { textIndent: 0 };

  return (
    <>
      <section>
        <div className={classes.tearmsandconditions_banner_images}>
          <div className={classes.banner_container}>
            <h2 className={classes.heading}>TEARMS & CONDITIONS</h2>
          </div>
        </div>
      </section>
      <div className={`${classes.parent_div} ${classes.parent_container}`}>
        <section>
          {/* <h2
            className={classes.heading}
            style={{ textAlign: "center", margin: "32px" }}
          >
            TEARMS & CONDITIONS
          </h2> */}
          <p className={classes.sub_pera}>
            Welcome to PSDAS. If you continue to browse and use this website you
            are agreeing to comply with and be bound by the following terms and
            conditions of use, which together with our privacy policy govern
            PSDAS relationship with you in relation to this website. The term
            <strong style={{ color: "#3797ed" }}> 'PSDAS' </strong> or 'us' or
            'we' refers to the owner of the website whose registered office is
            #32 – D, Thiru. Ve. Ka. Road,Karunanidhi
            Nagar,Sowripalayam,Coimbatore – 641 028.Tamilnadu, India. The term
            'you' refers to the user or viewer of our website.
          </p>
        </section>
        <section>
          <h2 className={classes.sub_heading} style={{ marginBottom: "15px" }}>
            The use of this website is subject to the following terms of use:
          </h2>

          <p className={classes.sub_pera} style={style}>
            {point}
            All claims are subject to the jurisdiction of Coimbatore District
            Court, Coimbatore, Tamilnadu, India only.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            The content of the pages of this website is for your general
            information and use only. It is subject to change without notice.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            Neither we nor any third parties provide any warranty or guarantee
            as to the accuracy, timeliness, performance, completeness or
            suitability of the information and materials found or offered on
            this website for any particular purpose. You acknowledge that such
            information and materials may contain inaccuracies or errors and we
            expressly exclude liability for any such inaccuracies or errors to
            the fullest extent permitted by law.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            Your use of any information or materials on this website is entirely
            at your own risk, for which we shall not be liable. It shall be your
            own responsibility to ensure that any products, services or
            information available through this website meet your specific
            requirements.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            This website contains material which is owned by or licensed to us.
            This material includes, but is not limited to, the design, layout,
            look, appearance and graphics. Reproduction is prohibited other than
            in accordance with the copyright notice, which forms part of these
            terms and conditions.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            Unauthorised use of this website may give rise to a claim for
            damages and/or be a criminal offence.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            From time to time this website may also include links to other
            websites. These links are provided for your convenience to provide
            further information. They do not signify that we endorse the
            website(s). We have no responsibility for the content of the linked
            website(s).
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            You may not create a link to this website from another website or
            document without AMR Tech's prior written consent.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            Your use of this website and any dispute arising out of such use of
            the website is subject to the laws of India or other regulatory
            authority.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            Quantities / Sizes specified on the site are indicative in nature
            and hence there can be slight variations in the delivered item,
            depending on the availability of the Products.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            The owner of the site retains the right to refuse any order
            unconditionally.
          </p>
          <p className={classes.sub_pera} style={style}>
            {point}
            Regardless of payment has been confirmed or received; we reserve the
            right to cancel any order without giving any reason. Refusal of item
            by the recipient is considered as a complete delivery. No refund
            will be made.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
