import { useFormik } from "formik";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Updatevalvescheduleedit } from "../Components/Store/Config/Configuration";
import * as Yup from "yup";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";

import moment from "moment";
import dayjs from "dayjs";
import CommonClockTimePicker from "../Components/CommonComponents/CommonClockTimePicker";
import { timePickerToolbarTitle } from "../Utilities/Constants";
import classes from "./Modal.module.css";

const validate = Yup.object().shape({
  start: Yup.string().required("Start time is required"),
  end: Yup.string().required("End time is required"),
  valve: Yup.string().required("Valve is required"),
});
export default function AddValvetime({ show, close, motormode, valvedatas }) {
  const { values, handleChange, handleSubmit, errors, touched, setValues } =
    useFormik({
      initialValues: { start: "", end: "", valve: "" },
      validationSchema: validate,
      onSubmit: (values) => {
        toaddvalve();
      },
    });
  const [addvalve, setvalve] = useState({ start: "", end: "", valve: "" });
  const { valvescheduleedit } = useSelector((state) => state);
  let dispatch = useDispatch();
  const toaddvalve = () => {
    let parsedata = JSON.parse(addvalve?.valve);
    dispatch(
      Updatevalvescheduleedit([
        ...valvescheduleedit,
        {
          time1: values?.start,
          time2: values?.end,
          device_name: parsedata?.name,
          valve_mode: parsedata?.mode,
          device_id: parsedata?.id,
        },
      ])
    );

    close();
  };

  return (
    <>
      <Modal show={show} centered size="md" onHide={close}>
        <div className="modalcontainer">
          <Modal.Header closeButton>
            <h3 className="modalhead">Add Time Schedule</h3>
          </Modal.Header>

          <div className="modal-container">
            <div className="select-div">
              <label className="modal-label">
                Valve<span className="required">*</span>
              </label>
              <select
                type="text"
                className="filterinput"
                placeholder="From Group"
                id="valve"
                name="valve"
                onChange={(e) => {
                  setValues({ ...values, valve: e.target?.value });
                  setvalve({ ...addvalve, valve: e.target?.value });
                }}
              >
                <option selected disabled hidden>
                  valve
                </option>
                {valvedatas?.filter((ele) => ele?.valve_mode !== 2)?.length >
                0 ? (
                  valvedatas?.map((dist, index) => {
                    if (dist?.valve_mode !== 2) {
                      return (
                        <option
                          key={index}
                          value={JSON.stringify({
                            name: dist?.device_name,
                            id: dist?.device_id,
                            mode: dist?.valve_status,
                          })}
                        >
                          {dist?.device_name}
                        </option>
                      );
                    }
                  })
                ) : (
                  <option disabled>No Data Found</option>
                )}
              </select>
              {touched?.valve && errors?.valve ? (
                <p className="required">{errors?.valve}</p>
              ) : null}
            </div>

            <div className="select-div">
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
                showSecond={false}
                // placeholder={
                //   motormode == 0 || motormode == 1 || motormode == 2
                //     ? "Start at"
                //     : "On Time"
                // }
                value={
                  values?.start != null
                    ? dayjs("2220-08-05 " + values?.start)
                    : ""
                }
              />
              {/* <TimePicker
                onChange={(e) => {
                  setValues({ ...values, start: moment(e).format("HH:mm:00") });
                }}
                showSecond={false}
                placeholder={
                  motormode == 0 || motormode == 1 || motormode == 2
                    ? "Start at"
                    : "On Time"
                }
              /> */}
              {touched?.start && errors?.start ? (
                <p className="required">{errors?.start}</p>
              ) : null}
            </div>
            <div className="select-div">
              <label className="modal-label">
                {motormode == 0 || motormode == 1 || motormode == 2
                  ? "Run for"
                  : "Off Time"}
                <span className="required">*</span>
                <span className={classes.subLableStyle}>
                  {motormode == 0 || motormode == 1 || motormode == 2
                    ? `(${timePickerToolbarTitle("valve")})`
                    : ""}
                </span>
              </label>
              <CommonClockTimePicker
                onChange={(e) => {
                  setValues({ ...values, end: dayjs(e).format("HH:mm:00") });
                }}
                ampm={false}
                showSecond={false}
                // placeholder={
                //   motormode == 0 || motormode == 1 || motormode == 2
                //     ? "Run for"
                //     : "Off Time"
                // }
                value={
                  values?.end != null ? dayjs("2220-08-05 " + values?.end) : ""
                }
              />
              {/* <TimePicker
                onChange={(e) => {
                  setValues({ ...values, end: moment(e).format("HH:mm:00") });
                }}
                showSecond={false}
                placeholder={
                  motormode == 0 || motormode == 1 || motormode == 2
                    ? "Run for"
                    : "Off Time"
                }
              /> */}
              {touched?.end && errors?.end ? (
                <p className="required">{errors?.end}</p>
              ) : null}
            </div>
          </div>
        </div>

        <Modal.Footer>
          <Button onClick={handleSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
