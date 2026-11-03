import React, { useState } from "react";
import * as Yup from "yup";
import "../../Assets/css/Authentication.modules.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useFormik } from "formik";
import setCookie from "../../Utilities/Cookie";
import { loginapi } from "../../Service/ApiService";
import Loader from "../Loader";
import { toast } from "react-hot-toast";
import { ExportedImages } from "../../Utilities/ImageExport";
import { getCatchMsg } from "../../Utilities/Methods";

const validate = Yup.object().shape({
  username: Yup.string().required("User name is required"),
  password: Yup.string()
    .min(5, "Password must have atleast 5 characters")
    .required("Password is required"),
});

export default function Login() {
  const [showpwdeye, setpwdeye] = useState(true);
  let navigate = useNavigate();

  const { handleChange, handleSubmit, values, touched, errors, setFieldValue } =
    useFormik({
      initialValues: { username: "", password: "", isLoader: false },
      validationSchema: validate,
      onSubmit: (values) => {
        Todashboard();
      },
    });

  const Showtext = () => {
    setpwdeye(false);
  };
  const hidetext = () => {
    setpwdeye(true);
  };

  const Todashboard = () => {
    setFieldValue("isLoader", true);

    let formData = new FormData();
    formData.append("username", values.username);
    formData.append("password", values.password);
    formData.append("device_type", 3);

    loginapi(formData)
      .then(({ data }) => {
        setCookie("cookiedata", JSON.stringify(data));
        toast("Login successfully", { type: "success" });
        if (data?.user_type === 3) {
          localStorage.setItem("contollertype", 1);

          navigate("/dashboard");
        } else if (data?.user_type === 4) {
          navigate("/production");
        } else {
          navigate("/dashboard");
          localStorage.setItem("contollertype", 1);
        }
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
    }
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
            <div className="col-lg-5 col-md-12 img_section">
              <img className="img-fluid" src={ExportedImages.LOGIN_BANNER} />
            </div>
            <div className="auth-container auth-label col-lg-7 col-md-12 row m-auto">
              <img
                src={ExportedImages.PHOTONIC_LOGO_MAIN}
                alt="photoniclogo"
                className="img-fluid photonic-logo mx-auto"
              />
              <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                <h2 className="login-head text-center">Hello! Welcome Back</h2>
                <div className="row">
                  <div className="u_name-section col-lg-6 col-md-12 mb-4">
                    <label className="auth-password">
                      user Name<span className="star">*</span>
                    </label>
                    <br />
                    <input
                      type="text"
                      onKeyDown={handleEnter}
                      name="username"
                      id="username"
                      autoFocus
                      maxLength={50}
                      value={values.username}
                      placeholder="Enter user name"
                      className="auth-input"
                      onChange={handleChange}
                    />

                    {errors.username && touched.username ? (
                      <p className="inputerror">{errors.username}</p>
                    ) : null}
                  </div>
                  <div className="pword_section col-lg-6 col-md-12 col-sm-12">
                    <label className="auth-password">
                      password<span className="star">*</span>
                    </label>
                    <br />
                    <div className="w-100 input-cover">
                      <input
                        type={showpwdeye ? "password" : "text"}
                        name="password"
                        id="password"
                        value={values.password}
                        placeholder="Enter password"
                        className="auth-input"
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document.getElementById("myBtn").click();
                            } else if (e.key === " ") e.preventDefault();
                          }
                        }}
                      />

                      {showpwdeye ? (
                        <FaEyeSlash
                          className="eye-icon"
                          onClick={() => Showtext()}
                        />
                      ) : (
                        <FaEye
                          className="eye-icon"
                          onClick={() => hidetext()}
                        />
                      )}
                      {errors.password && touched.password ? (
                        <span className="inputerror">{errors.password}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="mt-1">
                  <Link to="/forgotpwd">
                    <span className="forgot-password">forgot password?</span>
                  </Link>
                </div>
              </form>

              <div className="login-div">
                <button
                  id="myBtn"
                  type="submit"
                  className="login-button"
                  onClick={handleSubmit}
                >
                  login
                </button>
                <p>
                  Don't have an account?{" "}
                  <Link to="/register" className="link-underline">
                    <span>Register</span>
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
