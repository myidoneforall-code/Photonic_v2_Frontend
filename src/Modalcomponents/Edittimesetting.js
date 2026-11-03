import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Updatemotorscheduleedit } from "../Components/Store/Config/Configuration";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import moment from "moment";
import CommonClockTimePicker from "../Components/CommonComponents/CommonClockTimePicker";
import dayjs from "dayjs";
import { timePickerToolbarTitle } from "../Utilities/Constants";
import classes from "./Modal.module.css";
export default function EditTimesetting({
  show,
  close,
  edittime,
  index,
  motormode,
}) {
  const { motorscheduleedit } = useSelector((state) => state);
  const [timeedits, setedit] = useState({ start: "", end: "" });
  let dispatch = useDispatch();

  useEffect(() => {
    setedit({ start: edittime?.time1, end: edittime?.time2 });
  }, []);
  const toeditmotortime = () => {
    let dupdata = [...motorscheduleedit];
    let edit = {
      ...edittime,
      time1: timeedits?.start,
      time2: timeedits?.end,
    };

    dupdata.splice(index, 1, edit);
    dispatch(Updatemotorscheduleedit(dupdata));
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
                {" "}
                {motormode == 0 || motormode == 1 || motormode == 2
                  ? "Start at"
                  : "On Time"}
              </label>

              <CommonClockTimePicker
                value={
                  timeedits?.start
                    ? dayjs("2220-08-05 " + timeedits?.start)
                    : ""
                }
                onChange={(e) => {
                  setedit({
                    ...timeedits,
                    start: dayjs(e).format("HH:mm:ss"),
                  });
                }}
              />
              {/* <TimePicker
                value={
                  timeedits?.start != null
                    ? moment("2220-08-05 " + timeedits?.start)
                    : ""
                }
                allowEmpty
                onChange={(e) => {
                  setedit({
                    ...timeedits,
                    start: moment(e).format("HH:mm:ss"),
                  });
                }}
                showSecond={false}
              /> */}
            </div>
            <div className="select-div m-auto">
              <label className="modal-label">
                {" "}
                {motormode == 0 || motormode == 1 || motormode == 2
                  ? "Run for"
                  : "Off Time"}
                {motormode == 0 || motormode == 1 || motormode == 2 ? (
                  <span className={classes.subLableStyle}>
                    ({timePickerToolbarTitle("motor")})
                  </span>
                ) : (
                  ""
                )}
              </label>

              <CommonClockTimePicker
                value={
                  timeedits?.end
                    ? dayjs("2220-08-05 " + timeedits?.end)
                    : ""
                }
                ampm={
                  motormode == 0 || motormode == 1 || motormode == 2
                    ? false
                    : true
                }
                onChange={(e) => {
                  setedit({ ...timeedits, end: dayjs(e).format("HH:mm:ss") });
                }}
              />
              {/* <TimePicker
                value={
                  timeedits?.end != null
                    ? moment("2220-08-05 " + timeedits?.end)
                    : ""
                }
                allowEmpty
                onChange={(e) => {
                  setedit({ ...timeedits, end: moment(e).format("HH:mm:ss") });
                }}
                showSecond={false}
              /> */}
            </div>
          </div>
        </div>
        <Modal.Footer>
          <Button
            onClick={() => {
              toeditmotortime();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
