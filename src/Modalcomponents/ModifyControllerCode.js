import React from "react";
import { Modal } from "react-bootstrap";
import classes from "./Modal.module.css";
import { useForm } from "antd/es/form/Form";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "../Components/View/profile/profile.module.css";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required("Password is required")
    .min(5, "Password must have atleast 5 characters"),
});

function ModifyControllerCode({ show, onSuccess, close, onCancel }) {
  const { values, errors, handleChange, setFieldValue, handleSubmit, touched } =
    useFormik({
      initialValues: {
        password: "",
      },
      validationSchema,
      onSubmit: (values) => {
        onSuccess();
      },
    });

  return (
    <Modal show={show} onHide={close} className={styles.modalcont}>
      <Modal.Header closeButton>
        <h2 className="modal-head">Confirmation</h2>
      </Modal.Header>

      <div className={classes.modalflex}>
        Are you sure want to update the controller code?
        {/* <div className="select-div ">
          <label className="modal-label">
            Password<span className="required">*</span>
          </label>
          <input
            type="text"
            className={"filterinput"}
            placeholder="New password"
            id="password"
            name="password"
            onChange={handleChange}
          ></input>

          {errors?.password && touched?.password ? (
            <p className="inputerror">{errors?.password}</p>
          ) : null}
        </div> */}
      </div>
      <Modal.Footer>
        <button
          type="button"
          className={styles.usersave}
          style={{ background: "green" }}
          onClick={onSuccess}
        >
          Yes
        </button>
        <button
          type="button"
          className={styles.usersave}
          style={{ background: "red" }}
          onClick={close}
        >
          No
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModifyControllerCode;
