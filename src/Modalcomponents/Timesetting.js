import { useFormik } from "formik";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Updatemotorscheduleedit } from "../Components/Store/Config/Configuration";
import classes from "./Modal.module.css";
import { timePickerToolbarTitle } from "../Utilities/Constants";
import CommonClockTimePicker from "../Components/CommonComponents/CommonClockTimePicker";
import dayjs from "dayjs";

const validate = Yup.object().shape({
  start: Yup.string().required("Start time is required"),
  end: Yup.string().required("Run time is required"),
});
export default function Timesetting({ show, close, motormode }) {
  let dispatch = useDispatch();
  const { motorscheduleedit } = useSelector((state) => state);

  const { values, setValues, handleSubmit, errors, touched } = useFormik({
    initialValues: { start: "", end: "" },
    validationSchema: validate,
    onSubmit: (values) => {
      toaddtime();
    },
  });

  const toaddtime = () => {
    dispatch(
      Updatemotorscheduleedit([
        ...motorscheduleedit,
        {
          time1: values?.start,
          time2: values?.end,
        },
      ])
    );
    close();
  };
  return (
    <>
      <Modal
        show={show}
        centered
        size="md"
        onHide={close}
        className="modal-timer"
      >
        <div className="modalcontainer">
          <Modal.Header closeButton>
            <h3 className="modalhead">Add Time Schedule</h3>
          </Modal.Header>

          <div className="modal-container w-100">
            <div className="select-div m-auto">
              <label className="modal-label">
                {motormode == 0 || motormode == 1 || motormode == 2
                  ? "Start at"
                  : "On Time"}
                <span className="required">*</span>
              </label>
              <CommonClockTimePicker
                onChange={(e) => {
                  setValues({ ...values, start: dayjs(e).format("HH:mm:00") });
                }}
                value={
                  values?.start
                    ? dayjs("2220-08-05 " + values?.start)
                    : ""
                }
                // showSecond={false}
              />
              {/* <TimePicker
                onChange={(e) => {
                  setValues({ ...values, start: moment(e).format("HH:mm:00") });
                }}
                showSecond={false}
              /> */}
              {errors?.start && touched?.start ? (
                <p className="required">{errors?.start}</p>
              ) : null}
            </div>
            <div className=" select-div m-auto">
              <label className="modal-label">
                {motormode == 0 || motormode == 1 || motormode == 2
                  ? "Run for"
                  : "Off Time"}
                <span className="required">*</span>
                {motormode == 0 || motormode == 1 || motormode == 2 ? (
                  <span className={classes.subLableStyle}>
                    ({timePickerToolbarTitle("motor")})
                  </span>
                ) : (
                  ""
                )}
              </label>
              <CommonClockTimePicker
                onChange={(e) => {
                  setValues({ ...values, end: dayjs(e).format("HH:mm:00") });
                }}
                value={
                  values?.end ? dayjs("2220-08-05 " + values?.end) : ""
                }
                ampm={
                  motormode == 0 || motormode == 1 || motormode == 2
                    ? false
                    : true
                }

                // showSecond={false}
              />
              {/* <TimePicker
                onChange={(e) => {
                  setValues({ ...values, end: moment(e).format("HH:mm:00") });
                }}
                showSecond={false}
              /> */}
              {touched?.end && errors?.end ? (
                <p className="required">{errors?.end}</p>
              ) : null}
            </div>
          </div>
        </div>
        <Modal.Footer>
          <button onClick={handleSubmit}>Save</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
