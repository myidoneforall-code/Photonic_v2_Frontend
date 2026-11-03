import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "../profile/profile.module.css";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router";
import { createuser } from "../../../Service/ApiService";
import { getCookie } from "../../../Utilities/Cookie";
import { toast } from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { UpdateUserFilters } from "../../Store/Config/Configuration";
import { useDispatch, useSelector } from "react-redux";
import { NavigateToPreviousScreen } from "../../../Utilities/Methods";

const validate = Yup.object().shape({
  Name: Yup.string().required("Name is required"),
  userName: Yup.string().required("User Name is required"),
  Password: Yup.string().required("Password is required"),
  Mobile: Yup.string().matches(/^[6-9]\d{9}$/, "Mobile number is not valid"),
  Email: Yup.string().email(),
  Usertype: Yup.string().required("User Type is required"),
  Admintype: Yup.string().required("Admin Type is required"),
});
export default function Adduser() {
  const [showpwdeye, setpwdeye] = useState(true);
  const { state } = useLocation();
  let dispatch = useDispatch();
  const { UserFilters } = useSelector((state) => state);
  let Cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = Cookie.user_type;
  const formik = useFormik({
    initialValues: {
      Name: "",
      userName: "",
      Password: "",
      Mobile: "",
      Email: "",
      Usertype: usertype === 2 ? "2" : "",
      Admintype: 0,
    },
    validationSchema: validate,
    onSubmit: (values) => {
      save();
    },
  });

  const Showtext = () => {
    setpwdeye(false);
  };
  const hidetext = () => {
    setpwdeye(true);
  };

  let navigate = useNavigate();
  const todashboard = () => {
    navigate(NavigateToPreviousScreen(usertype, UserFilters?.values?.usertype));
  };
  const save = () => {
    let formdata = {
      username: formik.values.userName,
      name: formik.values.Name,
      email: formik.values.Email,
      mobile_no: formik.values.Mobile,
      user_type: usertype == 2 ? 3 : JSON.parse(formik.values.Usertype),
      admin_type:
        formik.values.Usertype == 2
          ? JSON.parse(formik.values.Admintype)
          : null,
      password: formik.values.Password,
    };
    if (!formik.values.Mobile) {
      delete formdata.mobile_no;
    }
    if (!formik.values.Email) {
      delete formdata.email;
    }
    createuser(formdata)
      .then((res) => {
        toast(res?.data, { type: "success" });
        navigate(-1);
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
      });
  };

  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };
  useEffect(() => {
    if (state?.UserFilters) {
      dispatch(UpdateUserFilters(state?.UserFilters));
    }
  }, [state]);

  return (
    <>
      <div className="router-pages">
        <div className="controller-head">
          <div className="pre-page">
            <FaArrowLeft className="arrow" onClick={() => todashboard()} />
            <p className="controller-name">Add User</p>
          </div>
        </div>
        <div className="view-page">
          <div
            className="add-form row justify-content-left"
            onSubmit={formik.handleSubmit}
          >
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                Name<span className="required">*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Name"
                id="Name"
                name="Name"
                onChange={(e) =>
                  formik.setValues({ ...formik.values, Name: e.target.value })
                }
              ></input>
              {formik.touched.Name && formik.errors.Name ? (
                <div className="required">{formik.errors.Name}</div>
              ) : null}
            </div>
            {usertype === 2 ? null : (
              <div className="select-div col-md-5 col-sm-12">
                <label className="modal-label">
                  User Type<span className="required">*</span>
                </label>
                <select
                  type="text"
                  className="modal-input"
                  placeholder="Usertype"
                  id="Usertype"
                  name="Usertype"
                  onChange={(e) =>
                    formik.setValues({
                      ...formik.values,
                      Usertype: e.target.value,
                    })
                  }
                >
                  <option selected disabled hidden>
                    User Type
                  </option>
                  {usertype == 1 ? <option value={2}>Admin</option> : null}
                  <option value={4}>Production unit</option>
                </select>
                {formik.touched.Usertype && formik.errors.Usertype ? (
                  <div className="required">{formik.errors.Usertype}</div>
                ) : null}
              </div>
            )}
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                User Name<span className="required">*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="user Name"
                id="userName"
                name="userName"
                onChange={(e) =>
                  formik.setValues({
                    ...formik.values,
                    userName: e.target.value,
                  })
                }
              />
              {formik.touched.userName && formik.errors.userName ? (
                <div className="required">{formik.errors.userName}</div>
              ) : null}
            </div>
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                Mobile
                {/* <span className="required">*</span> */}
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Mobile"
                id="Mobile"
                name="Mobile"
                maxLength={10}
                minLength={10}
                onKeyPress={avoidletters}
                onChange={(e) =>
                  formik.setValues({ ...formik.values, Mobile: e.target.value })
                }
              />
              {formik.touched.Mobile && formik.errors.Mobile ? (
                <div className="required">{formik.errors.Mobile}</div>
              ) : null}
            </div>
            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                Password<span className="required">*</span>
              </label>
              <input
                type={showpwdeye ? "password" : "text"}
                className="input-field"
                placeholder="Password"
                id="Password"
                name="Password"
                onChange={(e) =>
                  formik.setValues({
                    ...formik.values,
                    Password: e.target.value,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === " ") e.preventDefault();
                }}
              />
              {showpwdeye ? (
                <FaEyeSlash
                  className={styles.adduser_eye_icon}
                  onClick={() => Showtext()}
                />
              ) : (
                <FaEye
                  className={styles.adduser_eye_icon}
                  onClick={() => hidetext()}
                />
              )}
              {formik.touched.Password && formik.errors.Password ? (
                <div className="required">{formik.errors.Password}</div>
              ) : null}
            </div>

            <div className="select-div col-md-5 col-sm-12">
              <label className="modal-label">
                Email
                {/* <span className="required">*</span> */}
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="Email"
                id="Email"
                name="Email"
                onChange={(e) =>
                  formik.setValues({ ...formik.values, Email: e.target.value })
                }
              />
              {formik.touched.Email && formik.errors.Email ? (
                <div className="required">{formik.errors.Email}</div>
              ) : null}
            </div>

            {usertype == 1 && formik?.values?.Usertype == 2 ? (
              <div className="select-div col-md-5 col-sm-12">
                <label className="modal-label">
                  Admin Type<span className="required">*</span>
                </label>
                <select
                  type="text"
                  className="modal-input"
                  placeholder="Admintype"
                  id="Admintype"
                  name="Admintype"
                  onChange={(e) =>
                    formik.setValues({
                      ...formik.values,
                      Admintype: e.target.value,
                    })
                  }
                >
                  <option selected disabled hidden>
                    User Type
                  </option>
                  <option value={1}>level 1 Admin</option>
                  <option value={2}>level 2 Admin</option>
                </select>
                {formik.touched.Usertype && formik.errors.Usertype ? (
                  <div className="required">{formik.errors.Usertype}</div>
                ) : null}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.usersave}
            onClick={() => formik.handleSubmit()}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
