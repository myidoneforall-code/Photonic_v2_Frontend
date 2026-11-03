import React, { useState } from "react";
import * as Yup from "yup";
import "../../Assets/css/Authentication.modules.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import { registerapi } from "../../Service/ApiService";
import Loader from "../Loader";
import { toast } from "react-hot-toast";
import { ExportedImages } from "../../Utilities/ImageExport";
import { getCatchMsg } from "../../Utilities/Methods";

const validate = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .min(5, "Password must contain at least 5 characters")
    .required("Password is required"),
  confirm_password: Yup.string()
    .oneOf(
      [Yup.ref("password"), null],
      "Password and confirm password must be same"
    )
    .required("Please confirm your password"),
  mobile: Yup.string().matches(
    /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/gm,
    "Mobile number is not valid"
  ),
  // .required("Mobile number is required"),

  email: Yup.string().matches(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    "Email is not valid"
  ),
  // .required("Email is required"),
});

export default function Register() {
  let navigate = useNavigate();
  const [showpwdeye, setpwdeye] = useState(true);
  const [loader, setloader] = useState(false);
  const [showconfirmpwdeye, setconfirmpwdeye] = useState(true);

  let formik = useFormik({
    initialValues: {
      name: "",
      username: "",
      password: "",
      confirm_password: "",
      mobile: "",
      email: "",
    },
    validationSchema: validate,
    onSubmit: (values) => {
      Tologin();
    },
  });

  const Showpwd = () => {
    setpwdeye(false);
  };
  const hidepwd = () => {
    setpwdeye(true);
  };

  const Showconfirmpwd = () => {
    setconfirmpwdeye(false);
  };
  const hideconfirmpwd = () => {
    setconfirmpwdeye(true);
  };

  const Tologin = () => {
    setloader(true);
    let register = {
      username: formik.values.username,
      name: formik.values.name,
      email: formik.values.email,
      mobile_no: formik.values.mobile,
      user_type: 2,
      admin_type: 1,
      password: formik.values.password,
    };
    registerapi(register)
      .then(({ data }) => {
        toast("Registered Successfully!!", { type: "success" });
        navigate("/login");
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };

  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      const form = event.target.form;
      const index = Array.prototype.indexOf.call(form, event.target);
      form.elements[index + 1].focus();
      event.preventDefault();
    }
  };

  return (
    <>
      <Loader isLoader={loader} />
      <div className="auth-bg auth-label">
        <div className="container h-100">
          <button className="back_to_home_btn" onClick={() => navigate("/")}>
            Home
          </button>
          <div className="row h-100">
            <div className="col-lg-5 col-12 img_section">
              <img className="img-fluid" src={ExportedImages.FORGOT_PWD_IMG} />
            </div>
            <div className="auth-container auth-label col-lg-7 col-12 row m-auto">
              <img
                src={ExportedImages.PHOTONIC_LOGO_MAIN}
                alt="photoniclogo"
                className="photonic-logo img-fluid mx-auto"
              />
              <form className="auth-form" onSubmit={formik.handleSubmit}>
                <h2 className="login-head text-center">Create an Account</h2>
                <div className="row input-sections">
                  <div className="col-lg-6 col-md-12 col-sm-12 mt">
                    <label className="auth-password">
                      name<span className="star">*</span>
                    </label>
                    <br />
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="enter name"
                      className="auth-input"
                      maxLength={50}
                      onKeyDown={handleEnter}
                      onChange={(e) =>
                        formik.setValues({
                          ...formik.values,
                          name: e.target.value,
                        })
                      }
                    />
                    {formik.errors.name && formik.touched.name ? (
                      <p className="inputerror regerror">
                        {formik.errors.name}
                      </p>
                    ) : null}
                    <br />
                  </div>
                  <div className="col-lg-6 col-md-12 col-sm-12 mt">
                    <label className="auth-password">
                      username<span className="star">*</span>
                    </label>
                    <br />
                    <input
                      type="text"
                      name="username"
                      id="username"
                      placeholder="enter username"
                      className="auth-input"
                      maxLength={50}
                      onKeyDown={handleEnter}
                      onChange={(e) =>
                        formik.setValues({
                          ...formik.values,
                          username: e.target.value,
                        })
                      }
                    />
                    {formik.errors.username && formik.touched.username ? (
                      <p className="inputerror regerror">
                        {formik.errors.username}
                      </p>
                    ) : null}
                    <br />
                  </div>

                  <div className="col-lg-6 col-md-12 col-sm-12 mt">
                    <label className="auth-password">
                      email ID
                      {/* <span className="star">*</span> */}
                    </label>
                    <br />
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Enter email"
                      className="auth-input"
                      onKeyDown={handleEnter}
                      onChange={(e) =>
                        formik.setValues({
                          ...formik.values,
                          email: e.target.value,
                        })
                      }
                    />
                    {formik.errors.email && formik.touched.email ? (
                      <p className="inputerror regerror">
                        {formik.errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="col-lg-6 col-md-12 col-sm-12 mt">
                    <label className="auth-password">
                      mobile number
                      {/* <span className="star">*</span> */}
                    </label>
                    <br />
                    <input
                      type="text"
                      name="mobile"
                      id="mobile"
                      onKeyDown={handleEnter}
                      maxLength={10}
                      onKeyPress={avoidletters}
                      placeholder="enter mobile number"
                      className="auth-input"
                      minLength={10}
                      onChange={(e) =>
                        formik.setValues({
                          ...formik.values,
                          mobile: e.target.value,
                        })
                      }
                    />
                    {formik.errors.mobile && formik.touched.mobile ? (
                      <p className="inputerror regerror">
                        {formik.errors.mobile}
                      </p>
                    ) : null}
                    <br />
                  </div>

                  <div className="position col-lg-6 col-md-12 col-sm-12 mt">
                    <label className="auth-password">
                      password<span className="star">*</span>
                    </label>
                    <br />
                    <div className="w-100 input-cover">
                      <input
                        type={showpwdeye ? "password" : "text"}
                        name="password"
                        id="password"
                        placeholder="enter password"
                        className="auth-input"
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
                        onChange={(e) => {
                          formik.setValues({
                            ...formik.values,
                            password: e.target.value,
                          });
                        }}
                      />
                      {showpwdeye ? (
                        <FaEyeSlash
                          className="eye-icon pword-icon"
                          onClick={() => Showpwd()}
                        />
                      ) : (
                        <FaEye
                          className="eye-icon pword-icon"
                          onClick={() => hidepwd()}
                        />
                      )}
                      {formik.errors.password && formik.touched.password ? (
                        <p className="inputerror regerror">
                          {formik.errors.password}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="position col-lg-6 col-md-12 col-sm-12 mt">
                    <label className="auth-password">
                      confirm password<span className="star">*</span>
                    </label>
                    <br />
                    <div className="w-100 input-cover">
                      <input
                        type={showconfirmpwdeye ? "password" : "text"}
                        name="confirm_password"
                        id="confirm_password"
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document.getElementById("myBtn").click();
                            } else if (e.key === " ") e.preventDefault();
                          }
                        }}
                        placeholder="enter password"
                        className="auth-input"
                        onChange={(e) =>
                          formik.setValues({
                            ...formik.values,
                            confirm_password: e.target.value,
                          })
                        }
                      />
                      {showconfirmpwdeye ? (
                        <FaEyeSlash
                          className="eye-icon cpword-icon"
                          onClick={() => Showconfirmpwd()}
                        />
                      ) : (
                        <FaEye
                          className="eye-icon cpword-icon"
                          onClick={() => hideconfirmpwd()}
                        />
                      )}
                      {formik.errors.confirm_password &&
                      formik.touched.confirm_password ? (
                        <p className="inputerror regerror">
                          {formik.errors.confirm_password}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </form>
              <div className="login-div">
                <button
                  id="myBtn"
                  type="button"
                  className="login-button"
                  onClick={() => formik.handleSubmit()}
                >
                  register
                </button>
                <p>
                  Already have an account?{" "}
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <span>Login</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
