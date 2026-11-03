import { Button, Modal } from "react-bootstrap";
import styles from "../Modalcomponents/Modal.module.css";
import { useFormik } from "formik";
import {
  getCatchMsg,
  JSONtoformdatawithempty,
  Sim_Number_Validation,
} from "../Utilities/Methods";
import {
  GetNotificationDropdown,
  UpdateSmsSettingsService,
} from "../Service/ApiService";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import Loader from "../Components/Loader";

import CommonInput from "../Components/CommonComponents/CommonInput";
import { Checkbox } from "antd";
import { ExportedImages } from "../Utilities/ImageExport";
// const validationSchema = Yup.object().shape({});
export default function UpdateSMSReport({
  AMC_IDs,
  show,
  onClose,
  type,
  UpdateData,
  isMulti = "",
}) {
  const [loader, setloader] = useState(false);
  const [notificationList, setnotificationList] = useState([]);
  let SMSRef = useRef(null);
  const [updateFields, setUpdateFields] = useState({
    mobile_number: false,
    message: false,
    sms_for: false,
  });
  const { values, setFieldValue, errors, touched, handleSubmit, setValues } =
    useFormik({
      initialValues: {
        mobile_number: "",
        sms_for: "",
        message: "",
        upload_type: "",
        file: "",
      },
      // validationSchema,
      onSubmit: (values) => {
        UpdateSMSReport(values);
      },
    });

  const UpdateSMSReport = (values) => {
    let access_for = notificationList.reduce((acc, val) => {
      if (val.access) {
        acc.push(val.id);
      }
      return acc;
    }, []);

    setloader(true);
    let finalObj = {
      ...values,
      controller_id: type === 1 ? (isMulti ? AMC_IDs : UpdateData.unit_id) : "",
      device_id: type === 2 ? (isMulti ? AMC_IDs : UpdateData.unit_id) : "",
      unit_type: type,
      sms_for: access_for.length > 0 ? access_for : "",
    };
    if (isMulti) {
      if (!updateFields.message) {
        delete finalObj.message;
      }
      if (!updateFields.mobile_number) {
        delete finalObj.upload_type;
        delete finalObj.file;
        delete finalObj.mobile_number;
      }
      if (!updateFields.sms_for) {
        delete finalObj.sms_for;
      }
    }
    if (type === 1) {
      delete finalObj.device_id;
    } else {
      delete finalObj.controller_id;
    }
    UpdateSmsSettingsService(JSONtoformdatawithempty(finalObj))
      .then(({ data }) => {
        if (data.status === 1) {
          onClose(true);
        } else {
          toast.error(data.msg);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {
        setloader(false);
      });
  };
  const getListNotifications = () => {
    GetNotificationDropdown()
      .then((res) => {
        if (res.data.status === 1) {
          let SetaccessPermission = res.data.data.map((item, index) => {
            return {
              ...item,
              access: UpdateData?.sms_for
                ?.split(",")
                ?.includes(item.id.toString()),
            };
          });

          setnotificationList(SetaccessPermission);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      });
  };

  const handleUpdateDatas = () => {
    if (UpdateData) {
      setValues({
        mobile_number: UpdateData?.sms_mobile_no || "",
        sms_for: UpdateData?.sms_for || "",
        message: UpdateData?.message || "",
        upload_type: UpdateData?.upload_type || "",
        file: UpdateData?.file || "",
      });
    }
  };

  useEffect(() => {
    if (UpdateData) {
      handleUpdateDatas();
    }
    getListNotifications();
  }, []);

  return (
    <>
      {loader && <Loader isLoader={loader} />}
      <div className={styles.modal}>
        <Modal size="xl" show={show} onHide={onClose}>
          <Modal.Header closeButton className={styles.messageHead}>
            Edit SMS Setting
          </Modal.Header>
          <Modal.Body>
            {isMulti && (
              <div className={`${styles.EditFieldsBlock} row w-100`}>
                <p className={styles.description}>
                  <span>*</span>Please select the fields you wish to edit.
                </p>
                <div
                  className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 ${styles.notificationData}`}
                >
                  <Checkbox
                    className={"CheckBox_innerStyle"}
                    checked={updateFields.mobile_number}
                    onChange={() => {
                      setUpdateFields((pre) => ({
                        ...pre,
                        mobile_number: !updateFields.mobile_number,
                      }));
                      setValues((pre) => ({
                        ...pre,
                        mobile_number: "",
                        file: "",
                        upload_type: "",
                      }));
                    }}
                  />
                  <p className="mb-0"> {"SMS Mobile Number"}</p>
                </div>
                <div
                  className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 ${styles.notificationData}`}
                >
                  <Checkbox
                    className={"CheckBox_innerStyle"}
                    checked={updateFields.message}
                    onChange={() => {
                      setUpdateFields((pre) => ({
                        ...pre,
                        message: !updateFields.message,
                      }));
                      setFieldValue("message", "");
                    }}
                  />
                  <p className="mb-0"> {"Message"}</p>
                </div>
                <div
                  className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 ${styles.notificationData}`}
                >
                  <Checkbox
                    className={"CheckBox_innerStyle"}
                    checked={updateFields.sms_for}
                    onChange={() => {
                      setUpdateFields((pre) => ({
                        ...pre,
                        sms_for: !updateFields.sms_for,
                      }));
                      setnotificationList(
                        notificationList.map((ele) => ({
                          ...ele,
                          access: false,
                        }))
                      );
                    }}
                  />
                  <p className="mb-0"> {"SMS For"}</p>
                </div>
              </div>
            )}
            <form className="row w-100">
              {((isMulti && updateFields.mobile_number) || !isMulti) && (
                <>
                  <div className="col-sm-12 col-md-8">
                    <label className="modal-label">
                      Sim Mobile Number{" "}
                      <span className={styles.instructText}>
                        (Enter mobile numbers separated by commas. e.g.
                        XXXX,YYYY,ZZZZ)
                      </span>
                    </label>

                    <CommonInput
                      value={values.mobile_number}
                      onChange={(data) => {
                        if (Sim_Number_Validation(data)) {
                          setFieldValue("mobile_number", data);
                        }
                      }}
                      maxLength={250}
                      placeholder="Sim Mobile Number"
                      styles={{ width: "100%" }}
                      disabled={values.file ? true : false}
                    />
                    <div className="row px-2 mt-2 align-items-center">
                      <div
                        className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 ${styles.notificationData}`}
                      >
                        <Checkbox
                          className={"CheckBox_innerStyle"}
                          checked={values.upload_type === 1}
                          onChange={() => {
                            setFieldValue("upload_type", 1);
                          }}
                        />
                        <p> {"Replace"}</p>
                      </div>
                      <div
                        className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 ${styles.notificationData}`}
                      >
                        <Checkbox
                          className={"CheckBox_innerStyle"}
                          checked={values.upload_type === 2}
                          onChange={() => {
                            setFieldValue("upload_type", 2);
                          }}
                        />
                        <p> {"Update"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-12 col-md-4 d-flex gap-3 align-items-center mt-md-0  col-sm-4">
                    <input
                      type="file"
                      style={{ display: "none" }}
                      ref={SMSRef}
                      id="SMSFile"
                      onChange={(event) => {
                        setFieldValue("file", event.target.files[0]);
                      }}
                      disabled={values?.mobile_number ? true : false}
                      accept=".xlsx, .xls"
                    />
                    <button
                      className={styles.fileButton}
                      type="button"
                      onClick={() => {
                        document.getElementById("SMSFile").click();
                      }}
                    >
                      File
                    </button>
                    <p className={styles.fileName}>
                      {values?.file ? values?.file?.name : "No Files Choosen"}
                      {values?.file && (
                        <img
                          src={ExportedImages.CLOSE_ICON}
                          style={{
                            width: "10px",
                            marginLeft: "10px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setFieldValue("file", "");
                            SMSRef.current.value = "";
                          }}
                        />
                      )}
                    </p>
                  </div>
                </>
              )}

              {((isMulti && updateFields.message) || !isMulti) && (
                <div className=" w-100">
                  <label className="modal-label">Message</label>
                  <br />
                  <textarea
                    type="text"
                    className="filterinput w-100"
                    value={values.message}
                    onChange={(e) => {
                      setFieldValue("message", e.target?.value);
                    }}
                    placeholder="Message"
                    style={{ height: "120px" }}
                    maxLength={2000}
                  />
                </div>
              )}

              {((isMulti && updateFields.sms_for) || !isMulti) && (
                <div className="">
                  <label className="modal-label">SMS For</label>
                  <div className="row mt-2">
                    {notificationList?.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className={`col-sm-12 col-md-6 col-lg-4 col-xl-3 ${styles.notificationData}`}
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
                </div>
              )}
            </form>
          </Modal.Body>
          {(!isMulti ||
            (isMulti && Object.values(updateFields).includes(true))) && (
            <Modal.Footer>
              <Button
                onClick={() => {
                  onClose();
                }}
                className={styles.modalButton}
                style={{ background: "#bf0101" }}
              >
                Cancel
              </Button>
              <Button
                className={styles.modalButton}
                onClick={handleSubmit}
                style={{ background: "#004758" }}
              >
                Save
              </Button>
            </Modal.Footer>
          )}
        </Modal>
      </div>
    </>
  );
}
