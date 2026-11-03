import { Modal } from "react-bootstrap";
import styles from "../Components/View/profile/profile.module.css";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { changepasswordapi } from "../Service/ApiService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

const validate = Yup.object().shape({
  oldpassword: Yup.string().required("Password is required"),
  newpassword: Yup.string()
    .required("Old password is required")
    .min(5, "Password must have atleast 5 characters"),
  confpassword: Yup.string()
    .required("Confirm password is required")
    .oneOf(
      [Yup.ref("newpassword"), null],
      "New password and confirm must be same"
    ),
});
export default function Setpassword({ show, close }) {
  const [showpwdeye, setpwdeye] = useState(true);
  const [showeye1, seteye1] = useState(true);
  const [showeye2, seteye2] = useState(true);
  const { errors, touched, values, setValues, handleSubmit, handleChange } =
    useFormik({
      initialValues: {
        oldpassword: "",
        newpassword: "",
        confpassword: "",
      },
      validationSchema: validate,
      onSubmit: (values) => {
        tosetpassword();
      },
    });
  const tosetpassword = () => {
    let data = {
      current_password: values?.oldpassword,
      new_password: values?.newpassword,
      confirm_password: values?.confpassword,
    };
    changepasswordapi(data)
      .then((res) => {
        setValues({
          ...values,
          oldpassword: "",
          newpassword: "",
          confpassword: "",
        });
        toast(res?.data, { type: "success" });
        close(true);
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

  return (
    <>
      <Modal show={show} onHide={close} className={styles.modalcont}>
        <Modal.Header closeButton>
          <h2 className="modal-head">Change Password</h2>
        </Modal.Header>
        <form className={styles.modalform} onSubmit={(e) => e.preventDefault()}>
          <div className="select-div">
            <label className="modal-label">
              Old password<span className="required">*</span>
            </label>
            <div className="w-100 input-cover">
              <input
                type={showpwdeye ? "password" : "text"}
                className={"filterinput"}
                placeholder="Old password"
                id="oldpassword"
                name="oldpassword"
                onChange={(e) =>
                  setValues({
                    ...values,
                    oldpassword: e.target.value,
                  })
                }
              ></input>{" "}
              {showpwdeye ? (
                <FaEyeSlash
                  className="eye-icon"
                  onClick={() => setpwdeye(false)}
                />
              ) : (
                <FaEye className="eye-icon" onClick={() => setpwdeye(true)} />
              )}
            </div>
            {errors.oldpassword && touched.oldpassword ? (
              <span className="inputerror">{errors.oldpassword}</span>
            ) : null}
          </div>

          <div className="select-div ">
            <label className="modal-label">
              New password<span className="required">*</span>
            </label>
            <div className="w-100 input-cover">
              <input
                type={showeye1 ? "password" : "text"}
                className={"filterinput"}
                placeholder="New password"
                id="newpassword"
                name="newpassword"
                onChange={(e) =>
                  setValues({
                    ...values,
                    newpassword: e.target.value,
                  })
                }
              ></input>
              {showeye1 ? (
                <FaEyeSlash
                  className="eye-icon"
                  onClick={() => seteye1(false)}
                />
              ) : (
                <FaEye className="eye-icon" onClick={() => seteye1(true)} />
              )}
            </div>

            {errors?.newpassword && touched?.newpassword ? (
              <p className="inputerror">{errors?.newpassword}</p>
            ) : null}
          </div>
          <div className="select-div ">
            <label className="modal-label">
              Confirm password<span className="required">*</span>
            </label>
            <div className="w-100 input-cover">
              <input
                type={showeye2 ? "password" : "text"}
                className={"filterinput"}
                placeholder="Confirm Password"
                id="confpassword"
                name="confpassword"
                onChange={(e) =>
                  setValues({
                    ...values,
                    confpassword: e.target.value,
                  })
                }
              ></input>
              {showeye2 ? (
                <FaEyeSlash
                  className="eye-icon"
                  onClick={() => seteye2(false)}
                />
              ) : (
                <FaEye className="eye-icon" onClick={() => seteye2(true)} />
              )}
            </div>

            {errors?.confpassword && touched?.confpassword ? (
              <p className="inputerror">{errors?.confpassword}</p>
            ) : null}
          </div>
        </form>
        <Modal.Footer>
          <button
            type="button"
            className={styles.usersave}
            onClick={handleSubmit}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
