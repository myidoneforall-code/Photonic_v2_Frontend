import React from "react";
import { Button, Modal } from "react-bootstrap";
import styles from "../Modalcomponents/Modal.module.css";
import { ExportedImages } from "../Utilities/ImageExport";

export default function ConfirmationModal({
  show,
  msg,
  close,
  handleOkFunction,
  ICONStyle,
}) {
  return (
    <>
      <div className={styles.modal}>
        <Modal
          size="sm"
          show={show}
          onHide={close}
          centered
          className="confirmationmodal"
        >
          <div className={styles.modalbody}>
            <img
              src={ExportedImages.WARNING_IMAGE}
              alt="warning"
              className={styles.warning}
              style={{ ...ICONStyle }}
            />
            <p className={styles.warningpera}>{msg}</p>
          </div>
          <Modal.Footer>
            <Button className="cancel" onClick={close}>
              Cancel
            </Button>
            <Button className="ok" onClick={() => handleOkFunction()}>
              Ok
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
