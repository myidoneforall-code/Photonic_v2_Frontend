import { useFormik } from "formik";
import moment from "moment";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import { addlight, addservice } from "../Service/ApiService";

const validate = Yup.object().shape({
  lighttype: Yup.string().required("Light type is required"),
  count: Yup.string().required("Count is required"),
  watt: Yup.string().required("Watt is required"),
});

export default function AddLightModal({
  show,
  close,
  DeviceData,
  controllerid,
}) {
  const { handleChange, handleSubmit, values, touched, errors, setFieldValue } =
    useFormik({
      initialValues: {
        lighttype: "",
        count: "",
        watt: "",
        lightname: "",
        isLoader: false,
      },
      validationSchema: validate,
      onSubmit: (values) => {
        AddLightDetail(values);
      },
    });

  const AddLightDetail = (data) => {
    setFieldValue("isLoader", true);
    let formdata = new FormData();
    formdata.append("controller_id", controllerid);
    formdata.append("light_type", data.lighttype);
    formdata.append("light_name", data.lightname);
    formdata.append("watt", data.watt);
    formdata.append("count", data.count);
    addlight(formdata)
      .then((res) => {
        toast(res.data, { type: "success" });
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
          <h3 className="modal-head">Add Light</h3>
        </Modal.Header>
        <Modal.Body className="modalbody">
          <div className="w-100">
            <label className="modal-label">
              Light Type<span className="star">*</span>
            </label>
            <br />
            <select
              type="text"
              className="editserviceinput"
              name="lighttype"
              id="Lighttype"
              onChange={handleChange}
            >
              <option selected disabled>
                Light type
              </option>
              <option value="1">LED</option>
              <option value="2">CFL</option>
              <option value="3">Tube Light</option>
              <option value="4">Mercury Lamp</option>
              <option value="5">Others</option>
            </select>
          </div>
          {errors.lighttype && touched.lighttype ? (
            <p className="inputerror">{errors.lighttype}</p>
          ) : null}
          {values.lighttype == 5 ? (
            <>
              <div className="w-100">
                <label className="modal-label">
                  Light Name<span className="star">*</span>
                </label>
                <br />
                <input
                  type="text"
                  className="editserviceinput"
                  name="lightname"
                  id="lightname"
                  value={values.lightname}
                  placeholder="light Name"
                  onChange={handleChange}
                />
              </div>
              {errors.lightname && touched.lightname ? (
                <p className="inputerror">{errors.lightname}</p>
              ) : null}
            </>
          ) : null}
          <div className="w-100">
            <label className="modal-label">
              count<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              placeholder="count"
              className="editserviceinput"
              name="count"
              value={values.count > 0 ? values.count : ""}
              id="count"
              onChange={handleChange}
              maxLength={4}
            />
          </div>
          {errors.count && touched.count ? (
            <p className="inputerror">{errors.count}</p>
          ) : null}
          <div className="w-100">
            <label className="modal-label">
              watt<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              placeholder="watt"
              className="editserviceinput"
              name="watt"
              value={values.watt > 0 ? values.watt : ""}
              id="watt"
              onChange={handleChange}
              maxLength={4}
            />
          </div>
          {errors.watt && touched.watt ? (
            <p className="inputerror">{errors.watt}</p>
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
