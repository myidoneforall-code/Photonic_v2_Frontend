import React from "react";
import styles from "../Modalcomponents/Modal.module.css";
import { Button, Modal } from "react-bootstrap";

export default function ViewMessageModal({ show, data, msg, close }) {
  return (
    <>
      <div className={styles.modal}>
        <Modal show={show} onHide={close}>
          <Modal.Header></Modal.Header>
          <div className={styles.modalbody}>
            <h3 className={styles.messageHead}> {data?.displayName}</h3>
            <p className={styles.messageText}>{msg}</p>
          </div>
          <Modal.Footer style={{ margin: "auto" }}>
            <Button style={{ background: "firebrick" }} onClick={() => close()}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
