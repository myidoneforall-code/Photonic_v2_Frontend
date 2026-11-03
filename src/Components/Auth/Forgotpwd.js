import { useFormik } from "formik";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";
import { forgotpasswordapi } from "../../Service/ApiService";
import "../../Assets/css/Authentication.modules.css";
import { toast } from "react-hot-toast";
import Loader from "../Loader";
import { Link } from "react-router-dom";
import { ExportedImages } from "../../Utilities/ImageExport";
import { getCatchMsg } from "../../Utilities/Methods";
const validate = Yup.object().shape({
  email: Yup.string()
    .matches(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    )
    .required("Email is required"),
});

export default function Forgotpwd() {
  const [loader, setloader] = useState(false);
  let navigate = useNavigate();
  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: validate,
    onSubmit: (values) => {
      getotp();
    },
  });

  const getotp = () => {
    setloader(true);
    let formData = new FormData();
    formData.append("email", formik.values.email);

    forgotpasswordapi(formData)
      .then(({ data }) => {
        toast(data.msg, { type: "success" });
        navigate("/verifyotp", {
          state: { reset_key: data.reset_key, email: formik.values.email },
        });
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };

  return (
    <>
      <Loader isLoader={loader} />
      <div className="auth-bg">
        <div className="container h-100">
          <button className="back_to_home_btn" onClick={() => navigate("/")}>
            Home
          </button>
          <div className="row h-100">
            <div className="col-lg-5 col-md-12 img_section">
              <img className="img-fluid" src={ExportedImages.FORGOT_PWD_IMG} />
            </div>
            <div className="auth-container auth-label col-lg-7 col-md-12 row m-auto">
              <img
                src={ExportedImages.PHOTONIC_LOGO_MAIN}
                alt="photoniclogo"
                className="photonic-logo img-fluid mx-auto"
              />
              <form onSubmit={formik.onSubmit}>
                <h2 className="login-head text-center">Forgot password?</h2>

                <div className="col-lg-6 col-12 m-auto">
                  <label className="auth-password">
                    email ID<span className="star">*</span>
                  </label>
                  <br />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter email"
                    className="auth-input"
                    onChange={(e) =>
                      formik.setValues({
                        ...formik.values,
                        email: e.target.value,
                      })
                    }
                  />
                  {formik.errors.email && formik.touched.email ? (
                    <p className="inputerror regerror">{formik.errors.email}</p>
                  ) : null}
                </div>
              </form>

              <div className="login-div">
                <button
                  id="myBtn"
                  type="button"
                  className="login-button otp_btn fgt_btn"
                  onClick={() => formik.handleSubmit()}
                >
                  Send OTP
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
