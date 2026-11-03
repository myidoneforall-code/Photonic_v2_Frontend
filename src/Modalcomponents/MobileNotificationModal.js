import { Button, Modal } from "react-bootstrap";
import styles from "../Modalcomponents/Modal.module.css";
import { useEffect, useState } from "react";
import {
  GetNotificationDropdown,
  UpdateNotificationSettings,
} from "../Service/ApiService";
import { getCatchMsg } from "../Utilities/Methods";
import { Checkbox } from "antd";
import toast from "react-hot-toast";
export default function MobileNotificationModal({
  show,
  close,
  notification_access,
}) {
  const [notificationList, setnotificationList] = useState([]);
  const getListNotifications = () => {
    GetNotificationDropdown()
      .then((res) => {
        if (res.data.status === 1) {
          let SetaccessPermission = res.data.data.map((item, index) => {
            return { ...item, access: notification_access.includes(item.id) };
          });

          setnotificationList(SetaccessPermission);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  const handleUpdateSettings = () => {
    let access_for = notificationList.reduce((acc, val) => {
      if (val.access) {
        acc.push(val.id);
      }
      return acc;
    }, []);
    let formData = new FormData();
    formData.append("notification_access", access_for);
    UpdateNotificationSettings(formData)
      .then((res) => {
        if (res.data.status === 1) {
          toast.success(res.data.msg);
          close(true);
        } else {
          toast.error(res.data.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };
  useEffect(() => {
    getListNotifications();
  }, []);

  return (
    <>
      <div className={styles.modal}>
        <Modal size="md" show={show} onHide={close}>
          <h3
            className={styles.messageHead}
            style={{ marginTop: 15, padding: 0 }}
          >
            Mobile Notification Settings
          </h3>
          <p className={styles.description}>
            <span>*</span>Only the selected options trigger an alert on your
            mobile
          </p>
          <div className={`mt-4 ${styles.modalbody}`}>
            <div className="row">
              {notificationList?.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`col-sm-12 col-md-6 ${styles.notificationData}`}
                  >
                    <Checkbox
                      className={"CheckBox_innerStyle"}
                      checked={item.access}
                      onChange={() => {
                        let UpdatedList = notificationList.map((ele) =>
                          ele.id === item.id
                            ? {
                                ...item,
                                access: !item.access,
                              }
                            : ele
                        );
                        setnotificationList(UpdatedList);
                      }}
                    />
                    <p> {item.name}</p>
                  </div>
                );
              })}
            </div>
            <Modal.Footer>
              <Button className="ok" onClick={close}>
                Close
              </Button>
              <Button className="cancel" onClick={() => handleUpdateSettings()}>
                Submit
              </Button>
            </Modal.Footer>
          </div>
        </Modal>
      </div>
    </>
  );
}
