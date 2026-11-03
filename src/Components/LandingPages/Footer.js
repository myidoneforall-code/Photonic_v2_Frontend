import React from "react";
import classes from "../LandingPages/Landingpage.module.css";
import { useNavigate } from "react-router";

function Footer() {
  const navigate = useNavigate();
  return (
    <section>
      <div className={`${classes.footer_div}`}>
        <div className={`${classes.parent_div}  ${classes.privacy_policy_div}`}>
          <p className={classes.textalign}>
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
    </section>
  );
}

export default Footer;
