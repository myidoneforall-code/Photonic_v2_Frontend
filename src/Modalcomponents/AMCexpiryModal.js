import { Modal } from "react-bootstrap";
import styles from "./Modal.module.css";
import { ExportedImages } from "../Utilities/ImageExport";
import { useState } from "react";

export default function AMCExpiryModal({ show, onClose, ControllerData }) {
  const [viewData, setViewData] = useState(ControllerData);
  let parentDiv = document.getElementById("notificationDiv");
  const WarningCard = (data, name, type, key) => {
    return (
      <div className={styles.amcCard}>
        <div className={styles.amcHead}>
          <h3>{name}</h3>
          {parentDiv?.children?.length > 1 && (
            <img
              src={ExportedImages.CLOSE_ICON}
              onClick={() => {
                if (type === 1) {
                  setViewData((pre) => ({ ...pre, closed: true }));
                } else {
                  let flowData = viewData[key]?.map((ele) => {
                    if (ele.device_id === data?.device_id) {
                      return { ...ele, closed: true };
                    } else return ele;
                  });
                  setViewData((pre) => ({ ...pre, [key]: flowData }));
                }

                if (parentDiv.children.length === 1) {
                  onClose();
                }
              }}
            />
          )}
        </div>
        <p>
          No of Days to Expiry : <span>{data.no_of_days}</span>
        </p>
        <p>
          Message : <span>{data.amc_msg}</span>
        </p>
      </div>
    );
  };

  return (
    <>
      <Modal size="md" show={show} onHide={onClose}>
        <Modal.Header closeButton className={styles.messageHead}>
          AMC Expiry Warning
        </Modal.Header>
        <div
          className={styles.modalbody}
          id="notificationDiv"
          style={{ maxHeight: "450px", overflow: "auto", padding: "2px" }}
        >
          {viewData.is_warning && !viewData.closed
            ? WarningCard(viewData, viewData.controller_name, 1)
            : ""}
          {viewData?.tank?.map((ele) => {
            if (ele.is_warning && !ele.closed) {
              return WarningCard(ele, ele?.device_name, 2, "tank");
            }
          })}
          {viewData?.flow_meter?.map((ele) => {
            if (ele.is_warning && !ele.closed) {
              return WarningCard(ele, ele?.device_name, 3, "flow_meter");
            }
          })}
          {viewData?.valve?.map((ele) => {
            if (ele.is_warning && !ele.closed) {
              return WarningCard(ele, ele?.device_name, 4, "valve");
            }
          })}
          {viewData?.light?.map((ele) => {
            if (ele.is_warning && !ele.closed) {
              return WarningCard(ele, ele?.light_name, 5, "light");
            }
          })}
        </div>
      </Modal>
    </>
  );
}
