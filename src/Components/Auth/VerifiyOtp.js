import React, { useEffect, useState } from "react";
import "../../Assets/css/Authentication.modules.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetforgotpwdapi, resetotpapi } from "../../Service/ApiService";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { AutoTabProvider } from "react-auto-tab";
import Loader from "../Loader";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { ExportedImages } from "../../Utilities/ImageExport";
import { getCatchMsg } from "../../Utilities/Methods";
const validate = Yup.object().shape({
  otp_one: Yup.string().required("OTP is required"),
  otp_two: Yup.string().required("OTP is required"),
  otp_three: Yup.string().required("OTP is required"),
  otp_four: Yup.string().required("OTP is required"),
  new_password: Yup.string()
    .required("New Password is required")
    .min(5, "Password must contain at least 5 characters"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password"), null], "Password don't match")
    .required("Please confirm your password"),
});

export default function VerifyOtp() {
  let navigate = useNavigate();
  let location = useLocation();
  // let resetkey = location?.state?.reset_key;
  const [error, seterror] = useState(false);
  const [key, setkey] = useState(location?.state?.reset_key);
  const [loader, setloader] = useState(false);
  const [showpwdeye, setpwdeye] = useState(true);
  const [showconfirmpwdeye, setconfirmpwdeye] = useState(true);

  const { handleChange, handleSubmit, values, touched, errors, setFieldValue } =
    useFormik({
      initialValues: {
        otp_one: "",
        otp_two: "",
        otp_three: "",
        otp_four: "",
        new_password: "",
        confirm_password: "",
        // isLoader: false,
      },
      validationSchema: validate,
      onSubmit: (values) => {
        verifyotp();
      },
    });
  const [count, setCount] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      if (count > 0) {
        setCount(count - 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [count]);

  const verifyotp = () => {
    if (
      values.otp_one !== "" &&
      values.otp_two !== "" &&
      values.otp_three !== "" &&
      values.otp_four !== ""
    ) {
      let otp =
        values.otp_one + values.otp_two + values.otp_three + values.otp_four;

      setFieldValue("isLoader", true);
      let resetpwd = {
        otp: otp,
        reset_key: key,
        password: values.new_password,
      };

      resetforgotpwdapi(resetpwd)
        .then(({ data }) => {
          toast(data, { type: "success" });
          navigate("/login");
        })
        .catch((err) => {
          // toast(err?.response?.data?.detail, { type: "error" });
          if (err?.response?.data?.detail?.[0]?.msg) {
            toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
          } else if (err?.response?.data?.detail) {
            toast(err?.response?.data?.detail, { type: "error" });
          } else {
            toast("Something went wrong!!", { type: "error" });
          }
        })
        .finally(() => setFieldValue("isLoader", false));
    }
  };

  const resendotp = () => {
    setFieldValue("isLoader", true);
    let formData = new FormData();
    formData.append("email", location?.state.email);

    resetotpapi(formData)
      .then(({ data }) => {
        toast(data.msg, { type: "success" });

        setkey(data.reset_key);
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setFieldValue("isLoader", false));
  };
  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      const form = event.target.form;
      const index = Array.prototype.indexOf.call(form, event.target);
      form.elements[index + 1].focus();
      event.preventDefault();
    }
  };

  const secondsToMinutesAndSeconds = (millis) => {
    var minutes = Math.floor(millis / 60);
    var seconds = (millis % 60).toFixed(0);
    return (
      (minutes < 10 ? "0" : "") +
      minutes +
      ":" +
      (seconds < 10 ? "0" : "") +
      seconds
    );
  };

  return (
    <>
      <Loader isLoader={values.isLoader} />
      <div className="auth-bg">
        <div className="container h-100">
          <button className="back_to_home_btn" onClick={() => navigate("/")}>
            Home
          </button>
          <div className="row h-100">
            <div className="col-lg-5 col-12 img_section">
              <img className="img-fluid" src={ExportedImages.LOGIN_BANNER} />
            </div>

            <div className="auth-container auth-label col-lg-7 col-12 row m-auto">
              <img
                src={ExportedImages.PHOTONIC_LOGO_MAIN}
                alt="photoniclogo"
                className="photonic-logo img-fluid mx-auto"
              />
              {/* <form onSubmit={formik.handleSubmit}> */}
              <h2 className="login-head text-center vfy_head">
                Enter your OTP
              </h2>
              <AutoTabProvider className="row otp_sections">
                <input
                  type="text"
                  name="otp_one"
                  id="otp_one"
                  value={values.otp_one}
                  onChange={handleChange}
                  className="input-otp col-lg-2 col-2"
                  maxLength={1}
                  tabbable="true"
                  autoFocus
                />

                <input
                  type="text"
                  name="otp_two"
                  id="otp_two"
                  value={values.otp_two}
                  onChange={handleChange}
                  className="input-otp col-lg-2 col-2"
                  maxLength={1}
                  tabbable="true"
                />

                <input
                  type="text"
                  name="otp_three"
                  id="otp_three"
                  value={values.otp_three}
                  onChange={handleChange}
                  tabbable="true"
                  className="input-otp col-lg-2 col-2"
                  maxLength={1}
                />

                <input
                  type="text"
                  name="otp_four"
                  id="otp_four"
                  onKeyDown={handleEnter}
                  value={values.otp_four}
                  onChange={handleChange}
                  tabbable="true"
                  className="input-otp col-lg-2 col-2"
                  maxLength={1}
                />
              </AutoTabProvider>

              <div className="otptimer">
                {error ? (
                  errors.otp_one ||
                  errors.otp_two ||
                  errors.otp_three ||
                  errors.otp_four ? (
                    <p className="inputerror otperror mx-auto">
                      otp is required
                    </p>
                  ) : null
                ) : null}

                {count === 0 ? (
                  <p className=" otp">
                    If you didn't recive OTP?{" "}
                    <span
                      className="resendotp"
                      onClick={() => {
                        setCount(60);
                        resendotp();
                      }}
                    >
                      Resend OTP
                    </span>
                  </p>
                ) : (
                  <p className=" otp">
                    Resend otp in{" "}
                    <span className="inputerror">
                      {secondsToMinutesAndSeconds(count)}
                    </span>
                  </p>
                )}
              </div>
              <div className="row input-sections mb-0">
                <div className="position padding_right col-lg-5 col-12">
                  <label className="auth-password">
                    New Password<span className="star">*</span>
                  </label>
                  <br />
                  <input
                    type={showpwdeye ? "password" : "text"}
                    name="new_password"
                    id="new_password"
                    placeholder="enter password"
                    className="auth-input"
                    // onKeyDown={handleEnter}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        if (e.key === "Enter") {
                          const form = e.target.form;
                          const index = Array.prototype.indexOf.call(
                            form,
                            e.target
                          );
                          form.elements[index + 1].focus();
                          e.preventDefault();
                        } else if (e.key === " ") e.preventDefault();
                      }
                    }}
                    value={values.new_password}
                    onChange={handleChange}
                  />
                  {showpwdeye ? (
                    <FaEyeSlash
                      className="eye-icon pword-icon icon-position"
                      onClick={() => setpwdeye(false)}
                    />
                  ) : (
                    <FaEye
                      className="eye-icon pword-icon icon-position"
                      onClick={() => setpwdeye(true)}
                    />
                  )}
                  {errors.new_password && touched.new_password ? (
                    <p className="inputerror">{errors.new_password}</p>
                  ) : null}
                </div>
                <div className="position padding_left col-lg-5 col-12">
                  <label className="auth-password">
                    Confirm Password<span className="star">*</span>
                  </label>
                  <br />
                  <input
                    type={showconfirmpwdeye ? "password" : "text"}
                    name="confirm_password"
                    id="confirm_password"
                    placeholder="enter password"
                    className="auth-input"
                    value={values.confirm_password}
                    // onKeyDown={handleEnter}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          document.getElementById("myBtn").click();
                        } else if (e.key === " ") e.preventDefault();
                      }
                    }}
                    onChange={handleChange}
                  />
                  {showconfirmpwdeye ? (
                    <FaEyeSlash
                      className="eye-icon cpword-icon icon-position"
                      onClick={() => setconfirmpwdeye(false)}
                    />
                  ) : (
                    <FaEye
                      className="eye-icon icon-position"
                      onClick={() => setconfirmpwdeye(true)}
                    />
                  )}
                  {errors.confirm_password && touched.confirm_password ? (
                    <p className="inputerror">{errors.confirm_password}</p>
                  ) : null}
                </div>
              </div>

              <div className="login-div resend">
                <button
                  type="button"
                  className="login-button otp_btn mt-4"
                  onClick={() => {
                    handleSubmit();
                    seterror(true);
                  }}
                >
                  Submit
                </button>
                <div>
                  <Link
                    to="/login"
                    style={{ textDecoration: "none", color: "#443c3c87" }}
                  >
                    <p>Back to Login</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
