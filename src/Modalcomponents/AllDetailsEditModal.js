import { useFormik } from "formik";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import * as Yup from "yup";
import moment from "moment/moment";
import { editservice } from "../Service/ApiService";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import CommonDateTimePicker from "../Components/CommonComponents/CommonDatePicker";

const validate = Yup.object().shape({
  servicename: Yup.string().required("Service Name is required"),
  servicemanname: Yup.string().required("Service Man Name is required"),
  message: Yup.string().required("Message is required"),
  createdat: Yup.string().required("Created At is required"),
});

export default function AllDetailsEditModal({
  show,
  close,
  handleGetServiceDetails,
  editData,
}) {
  // for current time
  // let time = new Date().getTime();

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
      update_service_id: editData?.service_id || "",
      servicename: editData?.service_name || "",
      servicemanname: editData?.service_man_name || "",
      message: editData?.msg || "",
      createdat:
        moment(editData?.created_at, "DD-MM-YYYY HH:mm:ss").format(
          "YYYY-MM-DD HH:mm:ss"
        ) || "",
      isLoader: false,
    },
    validationSchema: validate,
    onSubmit: (values) => {
      EditServiceDetail(values);
    },
  });

  const EditServiceDetail = (data) => {
    setFieldValue("isLoader", true);
    let formdata = new FormData();
    formdata.append("service_id", data.update_service_id);
    formdata.append("service_name", data.servicename);
    formdata.append("service_man_name", data.servicemanname);
    formdata.append("msg", data.message);
    formdata.append(
      "created_at",
      `${moment(data.createdat).format("YYYY-MM-DD")} ${new Date()
        .toLocaleTimeString("en-US", {
          hour12: false,
        })
        .replace("pm", "")
        .replace("am", "")}`
    );
    editservice(formdata)
      .then((res) => {
        toast(res.data, { type: "success" });
        handleGetServiceDetails();
        close();
      })
      .catch((err) => {
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!!", { type: "error" });
        }
      })
      .finally(() => setFieldValue("isLoader", false));
  };

  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };

  return (
    <>
      {/* {values? */}
      {/* <AllDetails EditedData={values} /> */}
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <h3 className="modal-head">Edit Service</h3>
        </Modal.Header>
        <Modal.Body className="modalbody">
          <div className="w-100">
            <label className="modal-label">
              Service name<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              className="editserviceinput"
              name="servicename"
              id="servicename"
              placeholder="Service name"
              value={values.servicename}
              onChange={handleChange}
            />
          </div>
          {errors.servicename && touched.servicename ? (
            <p className="inputerror">{errors.servicename}</p>
          ) : null}
          <div className="w-100">
            <label className="modal-label">
              Service man name<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              className="editserviceinput"
              name="servicemanname"
              id="servicemanname"
              placeholder="Service man name"
              value={values.servicemanname}
              onChange={handleChange}
            />
          </div>
          {errors.servicemanname && touched.servicemanname ? (
            <p className="inputerror">{errors.servicemanname}</p>
          ) : null}
          <div className="w-100">
            <label className="modal-label">
              message<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              placeholder="message"
              className="editserviceinput"
              name="message"
              id="message"
              value={values.message}
              onChange={handleChange}
            />
          </div>
          {errors.message && touched.message ? (
            <p className="inputerror">{errors.message}</p>
          ) : null}
          <div className="w-100">
            <label className="modal-label">
              creaded at<span className="star">*</span>
            </label>
            <br />

            <CommonDateTimePicker
              value={new Date(values.createdat)}
              onChange={(date) => {
                setValues({ ...values, createdat: new Date(date) });
              }}
              formate={"DD-MM-YYYY"}
              disableDate={true}
              isFuture={true}
              allowClear={false}
              styles={{ width: "100%" }}
            />
          </div>
          {errors.createdat && touched.createdat ? (
            <p className="inputerror">{errors.createdat}</p>
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
