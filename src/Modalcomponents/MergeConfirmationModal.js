import React from "react";
import styles from "../Modalcomponents/Modal.module.css";
import { Button, Modal } from "react-bootstrap";

export default function MergeConfirmationModal({
  show,
  msg,
  data,
  close,
  onOk,
}) {
  return (
    <>
      <div className={styles.modal}>
        <Modal size="md" show={show} onHide={close}>
          <Modal.Header closeButton></Modal.Header>
          <div className={styles.modalbody}>
            <div className={styles.mergedevicebox}>
              {/* <img src={warning} alt="warning" className={styles.warning} /> */}
              <div className={styles.deviceDatainMerge}>
                <p>Device Details</p>
                <p>
                  Name : <span>{data.device_name}</span>
                </p>
                <p>
                  Code : <span>{data.device_code}</span>
                </p>
                <p>
                  Type :{" "}
                  <span>{data?.device_type === 2 ? "Flow" : "Tank"}</span>
                </p>
              </div>
            </div>

            {/* <img src={warning} alt="warning" className={styles.warning} /> */}
            <p
              className={styles.warningpera}
              style={{ color: "#4a4a4a", textAlign: "center" }}
            >
              {msg}
            </p>
          </div>
          <Modal.Footer>
            <Button className="cancel" onClick={close}>
              Cancel
            </Button>{" "}
            <Button className="ok" onClick={() => onOk()}>
              Ok
            </Button>{" "}
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
