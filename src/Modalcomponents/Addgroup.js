import { useFormik, yupToFormErrors } from "formik";
import { useState } from "react";
import { Modal, ModalFooter, ModalHeader } from "react-bootstrap";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import Loader from "../Components/Loader";
import styles from "../Components/View/profile/profile.module.css";
import { Addgroupapi } from "../Service/ApiService";

const validate = Yup.object().shape({
  group: Yup.string().required("Group name is required"),
});

export default function Addgroup({ show, close, grouplist }) {
  const {
    handleChange,
    handleSubmit,
    values,
    setFieldValue,
    setValues,
    errors,
    touched,
  } = useFormik({
    initialValues: { group: "", load: false },
    validationSchema: validate,
    onSubmit: (values) => {
      save();
    },
  });

  const save = () => {
    setValues({ ...values, load: true });
    let fromdata = new FormData();
    fromdata.append("group_name", values?.group);
    Addgroupapi(fromdata)
      .then((res) => {
        toast(res.data?.msg, { type: "success" });
        close();
        grouplist();
      })
      .catch((err) => {
        // if (err?.response?.data?.detail) {
        //   toast(err.response.data.detail, { type: "error" });
        // }
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      })
      .finally(() => setValues({ ...values, load: false }));
  };

  return (
    <>
      <Loader isLoaser={values.load} />
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <h3 className="modal-head">Add Group</h3>
        </Modal.Header>
        <div>
          <div className="select-div">
            <label className="modal-label">
              group name<span className="required">*</span>
            </label>
            <input
              type="text"
              className={"input-field"}
              placeholder="group name"
              id="group"
              name="group"
              value={values?.group}
              onChange={handleChange}
            />
            {errors?.group && touched?.group ? (
              <div className="inputerror">{errors?.group}</div>
            ) : null}
          </div>
        </div>
        <ModalFooter>
          <button
            type="button"
            className={styles.usersave}
            onClick={handleSubmit}
          >
            Save
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
