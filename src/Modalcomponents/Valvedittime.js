import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Updatevalvescheduleedit } from "../Components/Store/Config/Configuration";
import * as React from "react";
import "rc-time-picker/assets/index.css";
import CommonClockTimePicker from "../Components/CommonComponents/CommonClockTimePicker";
import dayjs from "dayjs";
import { timePickerToolbarTitle } from "../Utilities/Constants";
import classes from "./Modal.module.css";
export default function Valveedit({
  show,
  close,
  index,
  valuedata,
  motormode,
}) {
  const { valvescheduleedit } = useSelector((state) => state);
  let dispatch = useDispatch();
  const [valedit, setedit] = useState({ start: "", end: "" });

  useEffect(() => {
    setedit({ start: valuedata?.time1, end: valuedata?.time2 });
  }, []);

  const toeditvalvetime = () => {
    const dupdata = [...valvescheduleedit];
    let edittime = {
      ...valvescheduleedit[index],
      time1: valedit?.start ? valedit?.start : valuedata?.time1,
      time2: valedit?.end ? valedit?.end : valuedata?.time2,
    };
    dupdata.splice(index, 1, edittime);

    dispatch(Updatevalvescheduleedit(dupdata));

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
            <h3 className="modalhead">Edit Time Schedule</h3>
          </Modal.Header>

          <div className="modal-container w-100">
            <div className="select-div m-auto">
              <label className="modal-label">
                {motormode == 0 || motormode == 1 || motormode == 2
                  ? "Start at"
                  : "On Time"}
              </label>
              <CommonClockTimePicker
                value={
                  valedit?.start != null
                    ? dayjs("2220-08-05 " + valedit?.start)
                    : ""
                }
                // allowEmpty
                onChange={(e) => {
                  setedit({ ...valedit, start: dayjs(e).format("HH:mm:ss") });
                }}
                // showSecond={false}
              />
              {/* <TimePicker
                value={
                  valedit?.start != null
                    ? moment("2220-08-05 " + valedit?.start)
                    : ""
                }
                allowEmpty
                onChange={(e) => {
                  setedit({ ...valedit, start: moment(e).format("HH:mm:ss") });
                }}
                showSecond={false}
              /> */}
            </div>
            <div className="select-div m-auto">
              <label className="modal-label">
                {motormode == 0 || motormode == 1 || motormode == 2
                  ? "Run for"
                  : "Off Time"}

                {motormode == 0 || motormode == 1 || motormode == 2 ? (
                  <span className={classes.subLableStyle}>
                    ({timePickerToolbarTitle("valve")})
                  </span>
                ) : (
                  ""
                )}
              </label>
              <CommonClockTimePicker
                value={
                  valedit?.end != null
                    ? dayjs("2220-08-05 " + valedit?.end)
                    : ""
                }
                ampm={false}
                // allowEmpty
                onChange={(e) => {
                  setedit({ ...valedit, end: dayjs(e).format("HH:mm:ss") });
                }}
                // showSecond={false}
              />
              {/* <TimePicker
                value={
                  valedit?.end != null
                    ? moment("2220-08-05 " + valedit?.end)
                    : ""
                }
                allowEmpty
                onChange={(e) => {
                  setedit({ ...valedit, end: moment(e).format("HH:mm:ss") });
                }}
                showSecond={false}
              /> */}
            </div>
          </div>
        </div>
        <Modal.Footer>
          <Button
            onClick={() => {
              toeditvalvetime();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
