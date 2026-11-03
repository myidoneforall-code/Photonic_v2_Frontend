import { useFormik } from "formik";
import moment from "moment";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import { addservice } from "../Service/ApiService";
import DatePicker from "react-datepicker";
import CommonDateTimePicker from "../Components/CommonComponents/CommonDatePicker";

const validate = Yup.object().shape({
  servicename: Yup.string().required("Service Name is required"),
  servicemanname: Yup.string().required("Service Man Name is required"),
  message: Yup.string().required("Message is required"),
  createdat: Yup.string().required("Created At is required"),
});

export default function AllDetailsAddModal({
  show,
  close,
  controllerId,
  handleGetServiceDetails,
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
      servicename: "",
      servicemanname: "",
      message: "",
      createdat: "",
      isLoader: false,
    },
    validationSchema: validate,
    onSubmit: (values) => {
      AddServiceDetail(values);
    },
  });

  const AddServiceDetail = (data) => {
    setFieldValue("isLoader", true);

    let formdata = new FormData();
    formdata.append("controller_id", controllerId);
    formdata.append("service_name", data?.servicename);
    formdata.append("service_man_name", data?.servicemanname);
    formdata.append("msg", data?.message);
    formdata.append(
      "created_at",
      `${moment(data?.createdat).format("YYYY-MM-DD")} ${new Date()
        .toLocaleTimeString("en-US", {
          hour12: false,
        })
        .replace("pm", "")
        .replace("am", "")}`
    );

    addservice(formdata)
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
          toast("Something went wrong!!", { type: "error" });
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
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <h3 className="modal-head">Add Service</h3>
        </Modal.Header>
        <Modal.Body className="modalbody">
          <div className="w-100">
            <label className="modal-label">
              Type of Service<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              className="editserviceinput"
              name="servicename"
              id="servicename"
              value={values.servicename}
              placeholder="Type of Service"
              onChange={handleChange}
            />
          </div>
          {errors.servicename && touched.servicename ? (
            <p className="inputerror">{errors.servicename}</p>
          ) : null}
          <div className="w-100">
            <label className="modal-label">
              Serviced By<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              className="editserviceinput"
              name="servicemanname"
              id="servicemanname"
              value={values.servicemanname}
              placeholder="Serviced By"
              onChange={handleChange}
            />
          </div>
          {errors.servicemanname && touched.servicemanname ? (
            <p className="inputerror">{errors.servicemanname}</p>
          ) : null}
          <div className="w-100">
            <label className="modal-label">
              Message<span className="star">*</span>
            </label>
            <br />
            <input
              type="text"
              placeholder="Message"
              className="editserviceinput"
              name="message"
              value={values.message}
              id="message"
              onChange={handleChange}
            />
          </div>
          {errors.message && touched.message ? (
            <p className="inputerror">{errors.message}</p>
          ) : null}
          <div className="w-100">
            <label className="modal-label">
              Attend At<span className="star">*</span>
            </label>
            <br />

            <CommonDateTimePicker
              placeholder="Attend At"
              value={values.createdat}
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
