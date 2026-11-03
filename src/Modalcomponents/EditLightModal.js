import { useFormik } from "formik";
import React, { useRef } from "react";
import { Button, Modal } from "react-bootstrap";
import * as Yup from "yup";
import dateFormat, { masks } from "dateformat";
import moment from "moment/moment";
import { editlight, editservice } from "../Service/ApiService";
import { toast } from "react-hot-toast";

const validate = Yup.object().shape({
  count_data: Yup.string().required("Count is required"),
  watt_data: Yup.string().required("Watt is required"),
});

export default function EditLightModal({ show, close, DeviceData, editData }) {
  const { handleChange, handleSubmit, values, touched, errors, setFieldValue } =
    useFormik({
      initialValues: {
        count_data: editData?.count || "",
        watt_data: editData?.watt || "",
        lightid: editData?.light_id || "",
        lightname: editData?.light_name || "",
        isLoader: false,
      },
      validationSchema: validate,
      onSubmit: (values) => {
        EditLightDetail(values);
      },
    });

  const EditLightDetail = (data) => {
    setFieldValue("isLoader", true);
    let formdata = new FormData();
    formdata.append("light_id", data.lightid);
    formdata.append("watt", data.watt_data);
    formdata.append("count", data.count_data);
    formdata.append("status", 1);
    formdata.append("light_name", data.lightname);

    editlight(formdata)
      .then((res) => {
        toast("Success!!", { type: "success" });
        DeviceData();
        close();
      })
      .catch((err) => {
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      })
      .finally(() => setFieldValue("isLoader", false));
  };

  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]./.test(ch)) {
      letters.preventDefault();
    }
  };

  return (
    <>
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <h3 className="modal-head">Edit Light</h3>
        </Modal.Header>
        <Modal.Body className="modalbody">
          <div>
            <label className="modal-label">
              count<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              className="editserviceinput"
              name="count_data"
              id="count_data"
              placeholder="count"
              value={values.count_data > 0 ? values.count_data : ""}
              onChange={handleChange}
              maxLength={4}
            />
          </div>
          {errors.count_data && touched.count_data ? (
            <p className="inputerror">{errors.count_data}</p>
          ) : null}

          <div>
            <label className="modal-label">
              watt<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              placeholder="watt"
              className="editserviceinput"
              name="watt_data"
              id="watt_data"
              value={values.watt_data > 0 ? values.watt_data : ""}
              onChange={handleChange}
              maxLength={4}
            />
          </div>
          {errors.watt_data && touched.watt_data ? (
            <p className="inputerror">{errors.watt_data}</p>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>
            save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
