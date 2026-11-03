import { useFormik } from "formik";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import emailstyles from "../Modalcomponents/Modal.module.css";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import moment from "moment";
import { getCookie } from "../Utilities/Cookie";
import { useDispatch, useSelector } from "react-redux";
import { UpdateCCMail } from "../Components/Store/Config/Configuration";
import { RxCross2 } from "react-icons/rx";
import { mailreport } from "../Service/ApiService";
import Loader from "../Components/Loader";
import CommonDateTimePicker from "../Components/CommonComponents/CommonDatePicker";

const validate = Yup.object().shape({
  startDate: Yup.date().default(() => new Date()),
  endDate: Yup.date().min(
    Yup.ref("startDate"),
    "End date can't be before Start date"
  ),
  to_mail: Yup.string()
    .matches(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email is not valid"
    )
    .required("To Mail is required"),
  cc_mail: Yup.string().matches(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    "Email is not valid"
  ),
});

export default function EmailModal({ show, close }) {
  let controllertype = parseInt(localStorage.getItem("contollertype"));
  let CookieData = JSON.parse(getCookie("cookiedata"));
  const { CCMailStore } = useSelector((state) => state);
  let dispatch = useDispatch();

  const {
    values,
    errors,
    touched,
    setValues,
    handleSubmit,
    handleChange,
    setFieldValue,
  } = useFormik({
    initialValues: {
      startDate: new Date(
        moment().subtract(7, "d").format("YYYY-MM-DD 00:00:00")
      ),
      endDate: new Date(),
      to_mail: CookieData?.email || "",
      cc_mail: "",
      isLoader: false,
      from_date_format: "",
      to_date_format: "",
    },
    validationSchema: validate,
    onSubmit: (values) => {
      Sendmail();
    },
  });

  const Showccmail = () => {
    if (values.cc_mail != "" && !errors.cc_mail) {
      dispatch(UpdateCCMail([...CCMailStore, values.cc_mail]));
      setValues({ ...values, cc_mail: "" });
    }
  };

  const DeleteccMail = (index) => {
    let maildata = [...CCMailStore];
    let splicedata = maildata.splice(index, 1);
    dispatch(UpdateCCMail(maildata));
  };

  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };

  const Sendmail = () => {
    setFieldValue("isLoader", true);
    let formData = new FormData();
    formData.append("user_id", CookieData.user_id);
    formData.append(
      "from_date",
      moment(values.startDate).format("YYYY-MM-DD 00:00:00")
    );
    formData.append(
      "to_date",
      moment(values.endDate).format("YYYY-MM-DD 23:59:59")
    );
    formData.append("controller_type", controllertype);
    formData.append("report", 1);
    formData.append("for_web", 1);
    formData.append("for_mail", 1);
    formData.append("to_mail", values.to_mail);
    if (values?.from_date_format) {
      formData.append("from_date_format", values?.from_date_format);
    }
    if (values?.to_date_format) {
      formData.append("to_date_format", values?.to_date_format);
    }

    formData.append(
      "cc_mail",
      CCMailStore?.length > 0 ? CCMailStore.toString() : values.cc_mail
    );
    mailreport(formData)
      .then(({ data }) => {
        close();
        dispatch(UpdateCCMail([]));
      })
      .catch((err) => {
        close();
        dispatch(UpdateCCMail([]));
      })
      .finally(() => setFieldValue("isLoader", false));
  };
  return (
    <>
      <Loader isLoader={values.isLoader} />
      <Modal
        show={show}
        onHide={() => {
          close();
          dispatch(UpdateCCMail([]));
        }}
        // backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className={emailstyles.send_mail}>
            Send Email
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={emailstyles.email_div}>
            <div>
              <label className={emailstyles.email_label}>From Time</label>

              <div className={emailstyles.emailTimeDov}>
                <CommonDateTimePicker
                  value={new Date(values.startDate)}
                  onChange={(date) => {
                    setValues({ ...values, startDate: new Date(date) });
                  }}
                  styles={{ width: "100%" }}
                  formate={"DD-MM-YYYY"}
                  disableDate={true}
                  isFuture={true}
                  allowClear={false}
                />
                <div>
                  <Form.Check
                    inline
                    label="AM"
                    name="time1"
                    type={"radio"}
                    checked={values.from_date_format == 1 ? true : false}
                    onClick={() => {
                      setValues({ ...values, from_date_format: 1 });
                    }}
                  />
                  <Form.Check
                    inline
                    label="PM"
                    name="time1"
                    type={"radio"}
                    checked={values.from_date_format == 2 ? true : false}
                    onClick={() => {
                      setValues({ ...values, from_date_format: 2 });
                    }}
                  />
                </div>
              </div>

              {errors?.startDate && touched?.startDate ? (
                <p className="inputerror">{errors?.startDate}</p>
              ) : null}
            </div>
            <div>
              <label className={emailstyles.email_label}>To Time</label>
              <div className={emailstyles.emailTimeDov}>
                <CommonDateTimePicker
                  value={new Date(values.endDate)}
                  onChange={(date) => {
                    setValues({ ...values, endDate: new Date(date) });
                  }}
                  styles={{ width: "100%" }}
                  formate={"DD-MM-YYYY"}
                  disableDate={true}
                  isFuture={true}
                  allowClear={false}
                />
                <div>
                  <Form.Check
                    inline
                    label="AM"
                    name="time2"
                    type={"radio"}
                    checked={values.to_date_format == 1 ? true : false}
                    onClick={() => {
                      setValues({ ...values, to_date_format: 1 });
                    }}
                  />
                  <Form.Check
                    inline
                    label="PM"
                    name="time2"
                    type={"radio"}
                    checked={values.to_date_format == 2 ? true : false}
                    onClick={() => {
                      setValues({ ...values, to_date_format: 2 });
                    }}
                  />
                </div>
              </div>
              <br />
              {errors?.endDate && touched?.endDate ? (
                <p className="inputerror">{errors?.endDate}</p>
              ) : null}
            </div>

            <div>
              <label className={emailstyles.email_label}>
                To Mail<span className="star">*</span>
              </label>

              <input
                type="text"
                name="to_mail"
                id="to_mail"
                value={values.to_mail}
                onChange={handleChange}
                className={emailstyles.emailinput}
              />
              <br />
              {errors?.to_mail && touched?.to_mail ? (
                <p className="inputerror">{errors?.to_mail}</p>
              ) : null}
            </div>
            <div>
              <label className={emailstyles.email_label}>cc</label>
              <div className={emailstyles.cc_mail_div}>
                <input
                  type="text"
                  name="cc_mail"
                  id="cc_mail"
                  value={values.cc_mail}
                  onChange={handleChange}
                  className={emailstyles.emailinput}
                />
                <button
                  className={emailstyles.cc_email_add_button}
                  onClick={() => Showccmail()}
                >
                  +
                </button>
              </div>
              {errors?.cc_mail ? (
                <p className="inputerror">{errors?.cc_mail}</p>
              ) : null}
            </div>
            <p className={emailstyles.cc_email_list}>
              {CCMailStore?.map((d, index) => {
                return (
                  <span className={emailstyles.cc_email_list_data_style}>
                    {d}{" "}
                    <RxCross2
                      className={emailstyles.cross_icon}
                      onClick={() => DeleteccMail(index)}
                    />
                  </span>
                );
              })}
            </p>

            <button
              type="submit"
              className={emailstyles.mail_submit}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
