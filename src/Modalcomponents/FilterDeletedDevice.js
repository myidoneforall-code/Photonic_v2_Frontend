import { useEffect, useState } from "react";
import Loader from "../Components/Loader";
import { Button, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";

export default function Filterdeleteddevice({
  show,
  close,
  Values,
  GetList,
  Reset,
}) {
  const [loader, setloader] = useState(false);

  const [values, setvalues] = useState({
    device_code: "",
    device_name: "",
  });

  useEffect(() => {
    setvalues({
      device_code: Values.device_code,
      device_name: Values.device_name,
    });
  }, []);

  return (
    <>
      <Loader isLoader={loader} />
      <Modal
        size="lg"
        show={show}
        aria-labelledby="example-modal-sizes-title-lg"
        onHide={close}
        id="filterdevice"
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
                value={
                  values.device_name ? values.device_name : Values.device_name
                }
                onChange={(e) =>
                  setvalues({ ...values, device_name: e.target.value })
                }
                placeholder="Device name"
              />
            </div>

            <div className="col-lg-5 col-md-12">
              <label className="modal-label">device code</label>
              <br />
              <input
                type="text"
                placeholder="Device Code"
                className="filterinput w-100"
                name="device_code"
                id="device_code"
                maxLength={20}
                value={
                  values.device_code ? values.device_code : Values.device_code
                }
                onChange={(e) => {
                  setvalues({ ...values, device_code: e.target.value });
                }}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              Reset();
              setvalues({
                device_code: "",
                device_name: "",
              });
            }}
          >
            Reset
          </Button>
          <Button variant="primary" onClick={() => GetList(1, 25, values)}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
