import { useEffect, useState } from "react";
import Loader from "../Components/Loader";
import { Button, Modal } from "react-bootstrap";
import { DeviceTypeDropdown } from "../Utilities/Constants";

export default function Filterdevice({
  show,
  close,
  Values,
  GetList,
  Reset,
  setValues
}) {
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));

  // const [values, setValues] = useState({
  //   device_code: "",
  //   device_name: "",
  //   controller_id: "",
  //   device_type: "",
  //   order_by: "",
  //   order: "",
  // });

  // useEffect(() => {
  //   setValues({
  //     device_code: Values.device_code,
  //     device_name: Values.device_name,
  //     controller_id: Values.controller_id,
  //     device_type: Values.device_type,
  //     order_by: Values.order_by,
  //     order: Values.order,
  //   });
  // }, []);

  return (
    <>
      <Modal
        size="lg"
        show={show}
        aria-labelledby="example-modal-sizes-title-lg"
        onHide={close}
      >
        <Modal.Header closeButton>
          <h3 className="modal-head">Device</h3>
        </Modal.Header>
        <Modal.Body>
          <form className="filterformflex">
            <div className="col-lg-5 col-md-12">
              <label className="modal-label">Device name</label>
              <br />
              <input
                type="text"
                className="filterinput w-100"
                name="device_name"
                id="device_name"
                value={Values.device_name}
                onChange={(e) =>
                  setValues({ ...Values, device_name: e.target.value })
                }
                placeholder="Device name"
              />
            </div>
            <div className="col-lg-5 col-md-12">
              <label className="modal-label">Controller ID</label>
              <br />

              <input
                type="text"
                className="filterinput w-100"
                name="controller_id"
                id="controller_id"
                value={Values.controller_id}
                maxLength={20}
                onChange={(e) => {
                  setValues({ ...Values, controller_id: e.target.value });
                }}
                placeholder="53"
              />
            </div>
            <div className="col-lg-5 col-md-12">
              <label className="modal-label">device code</label>
              <br />
              <input
                type="text"
                placeholder="861826076402698"
                className="filterinput w-100"
                name="device_code"
                id="device_code"
                maxLength={20}
                value={Values.device_code}
                onChange={(e) => {
                  setValues({ ...Values, device_code: e.target.value });
                }}
              />
            </div>
            {controllertype === 1 && (
              <div className="col-lg-5 col-md-12">
                <label className="modal-label">Device Type</label>
                <br />
                <select
                  type="text"
                  className="filterselectinput w-100"
                  value={Values.device_type}
                  // filterdata
                  placeholder="Device Type"
                  onChange={(e) => {
                    setValues({ ...Values, device_type: e.target.value });
                  }}
                >
                  {DeviceTypeDropdown?.map((ele) => {
                    return <option value={ele.value}>{ele.lable}</option>;
                  })}
                </select>
              </div>
            )}

            {/* <div className="col-lg-5 col-md-12">
              <label className="modal-label">Order By</label>
              <br />
              <input
                type="text"
                className="filterinput w-100"
                name="order_by"
                id="order_by"
                value={Values.order_by}
                onChange={(e) =>
                  setValues({ ...Values, order_by: e.target.value })
                }
                placeholder="Order By"
              />
            </div>
            <div className="col-lg-5 col-md-12">
              <label className="modal-label">Order</label>
              <br />
              <input
                type="text"
                className="filterinput w-100"
                name="order"
                id="order"
                value={Values.order}
                onChange={(e) =>
                  setValues({ ...Values, order: e.target.value })
                }
                placeholder="Order"
              />
            </div> */}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              Reset();
              setValues((pre) => ({
                device_code: "",
                device_name: "",
                controller_id: "",
                device_type: pre?.device_type || 1,
                order_by: "",
                order: ""
              }));
              // setValues({
              //   device_code: "",
              //   device_name: "",
              //   controller_id: "",
              //   device_type: "",
              //   order_by: "",
              //   order: "",
              // });
            }}
          >
            Reset
          </Button>
          <Button variant="primary" onClick={() => GetList(1, 12, Values)}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
