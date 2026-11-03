import { useFormik } from "formik";
import { Modal } from "react-bootstrap";
import styles from "../Components/View/profile/profile.module.css";
import * as Yup from "yup";
import classes from "./Modal.module.css";
import { changepasswordapi, resetpasswordapi } from "../Service/ApiService";
import { toast } from "react-hot-toast";
const validate = Yup.object().shape({
  newpassword: Yup.string()
    .required("Password is required")
    .min(5, "Password must have atleast 5 characters"),
  confpassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newpassword"), null], "Password must be same"),
});

export default function Changepassword({ show, close, id }) {
  const {
    handleChange,
    handleSubmit,
    values,
    touched,
    errors,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: {
      newpassword: "",
      confpassword: "",
    },
    validationSchema: validate,
    onSubmit: (values) => {
      tosetpassword();
    },
  });

  const tosetpassword = () => {
    let formdata = new FormData();
    formdata.append("user_id", id);
    formdata.append("password", values?.newpassword);
    resetpasswordapi(formdata)
      .then((res) => {
        toast(res.data, { type: "success" });
        close();
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
          <h2 className="modal-head">Reset Password</h2>
        </Modal.Header>
        <div className={classes.modalflex}>
          <div className="select-div ">
            <label className="modal-label">
              New password<span className="required">*</span>
            </label>
            <input
              type="text"
              className={"filterinput"}
              placeholder="New password"
              id="newpassword"
              name="newpassword"
              onChange={handleChange}
            ></input>

            {errors?.newpassword && touched?.newpassword ? (
              <p className="inputerror">{errors?.newpassword}</p>
            ) : null}
          </div>
          <div className="select-div ">
            <label className="modal-label">
              Confirm password<span className="required">*</span>
            </label>
            <input
              type="text"
              className={"filterinput"}
              placeholder="Confirm password"
              id="confpassword"
              name="confpassword"
              onChange={handleChange}
            ></input>

            {errors?.confpassword && touched?.confpassword ? (
              <p className="inputerror">{errors?.confpassword}</p>
            ) : null}
          </div>
        </div>
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
