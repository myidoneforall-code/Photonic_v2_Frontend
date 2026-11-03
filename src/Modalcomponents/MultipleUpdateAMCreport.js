import { Button } from "react-bootstrap";
import styles from "../Modalcomponents/Modal.module.css";
import { useFormik } from "formik";
import {
  Float_Validation,
  getCatchMsg,
  JSONtoformdatawithempty
} from "../Utilities/Methods";
import {
  MultipleUpdateAMCReportService,
  UpdateAMCReportService
} from "../Service/ApiService";
import toast from "react-hot-toast";
import { useState } from "react";
import Loader from "../Components/Loader";
import CommonDateTimePicker from "../Components/CommonComponents/CommonDatePicker";
import CommonInput from "../Components/CommonComponents/CommonInput";
import CommonSwitch from "../Components/CommonComponents/CommonSwitch";
import ConfirmationModal from "./ConfirmationModal";
import { Alert, Checkbox, Modal } from "antd";
import dayjs from "dayjs";
import { ExportedImages } from "../Utilities/ImageExport";
export default function MultipleUpdateAMCReport({
  show,
  onClose,
  type,
  AMC_IDs
}) {
  const [loader, setloader] = useState(false);
  const [isNext, setisNext] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [amcchangeStatus, setAmcchangeStatus] = useState({
    type: 0,
    show: false
  });
  const [UpdateFilelds, setUpdateFilelds] = useState({});
  const [dateError, setDateError] = useState(false);
  const [fileldList, setfileldList] = useState([
    {
      name: "Sim Started Date",
      access: false,
      id: 1,
      key_name: "amc_start_date"
    },
    {
      name: "Charges",
      access: false,
      id: 2,
      key_name: "amc_cost"
    },
    {
      name: "Validity",
      access: false,
      id: 3,
      key_name: "validity"
    },
    {
      name: "No of Days to Blur",
      access: false,
      id: 4,
      key_name: "inactivate_delay"
    },
    // {
    //   name: "DeActivate Delay",
    //   access: false,
    //   key_name: "deactivate_delay",
    //   id: 5,
    // },
    {
      name: "Product Conditions",
      access: false,
      key_name: "status",
      id: 6
    },
    {
      name: "AMC Conditions",
      access: false,
      key_name: "amc_status",
      id: 7
    },
    {
      name: "Display Content",
      access: false,
      key_name: "amc_msg",
      id: 8
    },
    {
      name: "Remarks",
      access: false,
      key_name: "remarks",
      id: 9
    },
    {
      name: "Charge Toggle",
      access: false,
      key_name: "deactivate_charge_display",
      id: 10
    },
    {
      name: "Pay Toggle",
      access: false,
      key_name: "deactivate_pay_option",
      id: 11
    }
  ]);

  const { values, setFieldValue, errors, touched, handleSubmit, setValues } =
    useFormik({
      initialValues: {
        amc_start_date: "",
        amc_cost: "",
        validity: "",
        amc_msg: "",
        remarks: "",
        status: "",
        amc_status: "",
        inactivate_delay: "",
        deactivate_pay_option: "",
        deactivate_charge_display: ""
        // deactivate_delay: "",
      },
      // validationSchema,
      onSubmit: (values) => {
        UpdateAMCReportData(values);
      }
    });

  let numberedItem = [
    "amc_cost",
    "validity",
    "status",
    "amc_status",
    "inactivate_delay",
    "deactivate_pay_option",
    "deactivate_charge_display"
    // "deactivate_delay",
  ];
  const UpdateAMCReportData = (values) => {
    console.log(values, "values123");

    // setloader(true);
    let Validdatas = Object.keys(UpdateFilelds).reduce((acc, ele) => {
      if (numberedItem.includes(ele)) {
        acc = { ...acc, [ele]: values[ele] ? values[ele] : 0 };
      } else {
        acc = { ...acc, [ele]: values[ele] };
      }
      return acc;
    }, {});
    let finalObj = {
      controller_id: type === 1 ? AMC_IDs : "",
      device_id: type === 2 ? AMC_IDs : "",
      ...Validdatas
    };

    if (type === 1) {
      delete finalObj.device_id;
    } else {
      delete finalObj.controller_id;
    }

    MultipleUpdateAMCReportService(JSONtoformdatawithempty(finalObj))
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
        // setloader(false);
      });
  };
  console.log(UpdateFilelds, values, "UpdateFilelds");

  return (
    <>
      {loader && <Loader isLoader={loader} />}

      {amcchangeStatus.show && (
        <ConfirmationModal
          show={amcchangeStatus.show}
          close={() => {
            setAmcchangeStatus({ show: false, type: 0 });
          }}
          msg={`Are you sure want to change this ${
            amcchangeStatus.type === 1 ? "Controller" : "AMC"
          } status?`}
          handleOkFunction={() => {
            if (amcchangeStatus.type === 1) {
              setFieldValue("status", values.status === 1 ? 2 : 1);
            } else if (amcchangeStatus.type === 2) {
              setFieldValue("amc_status", values?.amc_status === 1 ? 2 : 1);
            } else if (amcchangeStatus.type === 3) {
              setFieldValue(
                "deactivate_charge_display",
                values?.deactivate_charge_display === 1 ? 0 : 1
              );
            } else if (amcchangeStatus.type === 4) {
              setFieldValue(
                "deactivate_pay_option",
                values?.deactivate_pay_option === 1 ? 0 : 1
              );
            }

            setAmcchangeStatus({ show: false, type: 0 });
          }}
        />
      )}

      <div className={styles.modal}>
        <Modal
          open={show}
          width={isNext ? "1000px" : "500px"}
          destroyOnClose={true}
          footer={null}
          closeIcon={false}
        >
          <h3
            className={styles.messageHead}
            style={{ marginTop: 15, padding: 0 }}
          >
            Multiple Edit AMC Report
          </h3>
          {!isNext && (
            <p className={`mb-2 ${styles.description}`}>
              <span>*</span>Please select the fields you wish to edit.
            </p>
          )}
          <div className={`mt-4 ${styles.modalbody}`}>
            {isNext ? (
              <>
                <form className="row w-100">
                  {UpdateFilelds.amc_start_date && (
                    <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   px-2 mb-3">
                      <label className="modal-label">SIM Started date</label>
                      <br />
                      <CommonDateTimePicker
                        placeholder={"SIM Start Date"}
                        onChange={(data) => {
                          setFieldValue(
                            "amc_start_date",
                            dayjs(data).format("YYYY-MM-DD HH:mm:ss")
                          );
                        }}
                        formate={"DD-MM-YYYY"}
                        value={values.amc_start_date}
                        allowClear={false}
                        styles={{ width: "100%" }}
                      />
                      {dateError && !values.amc_start_date ? (
                        <p className="errorText">Sim Start Date is required</p>
                      ) : (
                        ""
                      )}
                    </div>
                  )}
                  {UpdateFilelds.amc_cost && (
                    <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   px-2 mb-3">
                      <label className="modal-label">Charges</label>
                      <br />
                      <CommonInput
                        maxLength={8}
                        value={values.amc_cost}
                        onChange={(data) => {
                          if (
                            (data <= 99999.99 && data !== "0") ||
                            data == ""
                          ) {
                            if (Float_Validation(data)) {
                              setFieldValue("amc_cost", data);
                            }
                          }
                        }}
                        placeholder="Charges"
                        styles={{ width: "100%" }}
                      />
                    </div>
                  )}
                  {UpdateFilelds.validity && (
                    <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   px-2 mb-3">
                      <label className="modal-label">
                        Validity (In Months)
                      </label>
                      <br />
                      <CommonInput
                        value={values.validity}
                        maxLength={3}
                        isNumber={true}
                        onChange={(data) => {
                          if ((data <= 100 || data === "") && data !== "0") {
                            setFieldValue("validity", data);
                          }
                        }}
                        placeholder="Validity"
                        styles={{ width: "100%" }}
                      />
                    </div>
                  )}
                  {UpdateFilelds.inactivate_delay && (
                    <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4  px-2 mb-3">
                      <label className="modal-label">
                        No of Days to Blur ( In Days)
                      </label>
                      <br />
                      <CommonInput
                        value={values.inactivate_delay}
                        maxLength={3}
                        isNumber={true}
                        onChange={(data) => {
                          if ((data <= 100 && data !== "0") || data === "") {
                            setFieldValue("inactivate_delay", data);
                          }
                        }}
                        placeholder="No of Days to Blur"
                        styles={{ width: "100%" }}
                      />
                    </div>
                  )}
                  {/* {UpdateFilelds.deactivate_delay && (
                    <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   px-2 mb-3">
                      <label className="modal-label">
                        DeActivate Delay ( In Days)
                      </label>
                      <br />
                      <CommonInput
                        value={values.deactivate_delay}
                        maxLength={3}
                        isNumber={true}
                        onChange={(data) => {
                          if ((data <= 100 && data !== "0") || data === "") {
                            setFieldValue("deactivate_delay", data);
                          }
                        }}
                        styles={{ width: "100%" }}
                        placeholder="DeActivate Delay"
                      />
                    </div>
                  )} */}
                  {UpdateFilelds.status && (
                    <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   mb-3">
                      <label className="modal-label">Product Conditions</label>
                      <br />
                      <CommonSwitch
                        checked={values.status === 1 ? true : false}
                        onChange={() => {
                          setAmcchangeStatus({ show: true, type: 1 });
                        }}
                        type={1}
                      />
                    </div>
                  )}
                  {UpdateFilelds.amc_status && (
                    <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   mb-3">
                      <label className="modal-label">AMC Conditions</label>
                      <br />
                      <CommonSwitch
                        checked={values.amc_status === 1 ? true : false}
                        onChange={() => {
                          setAmcchangeStatus({ show: true, type: 2 });
                        }}
                        type={2}
                      />
                    </div>
                  )}
                  {UpdateFilelds.deactivate_charge_display && (
                    <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   mb-3">
                      <label className="modal-label">Charges Toggle</label>
                      <br />
                      <CommonSwitch
                        label={true}
                        checked={
                          values.deactivate_charge_display === 1 ? false : true
                        }
                        onChange={() => {
                          setAmcchangeStatus({ show: true, type: 3 });
                        }}
                        type={2}
                      />
                    </div>
                  )}
                  {UpdateFilelds.deactivate_pay_option && (
                    <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   mb-3">
                      <label className="modal-label">Pay Toggle</label>
                      <br />
                      <CommonSwitch
                        label={true}
                        checked={
                          values.deactivate_pay_option === 1 ? false : true
                        }
                        onChange={() => {
                          setAmcchangeStatus({ show: true, type: 4 });
                        }}
                        type={2}
                      />
                    </div>
                  )}
                  {UpdateFilelds.amc_msg && (
                    <div className="col-lg-12 col-md-12  mb-2">
                      <label className="modal-label">Display Content</label>
                      <br />
                      <textarea
                        type="text"
                        className="filterinput w-100"
                        value={values.amc_msg}
                        onChange={(e) => {
                          setFieldValue("amc_msg", e.target?.value);
                        }}
                        placeholder="Display Content"
                        style={{ height: "120px" }}
                        maxLength={2000}
                      />
                    </div>
                  )}
                  {UpdateFilelds.remarks && (
                    <div className="col-lg-12 col-md-12  ">
                      <label className="modal-label">Remarks</label>
                      <br />
                      <textarea
                        type="text"
                        className="filterinput w-100"
                        value={values.remarks}
                        onChange={(e) => {
                          setFieldValue("remarks", e.target?.value);
                        }}
                        maxLength={2000}
                        placeholder="Remarks"
                        style={{ height: "120px" }}
                      />
                    </div>
                  )}
                </form>
              </>
            ) : (
              <>
                <div className="row">
                  {fileldList?.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className={`col-sm-12 col-md-6 ${styles.notificationData}`}
                      >
                        <Checkbox
                          className={"CheckBox_innerStyle"}
                          checked={item.access}
                          onChange={() => {
                            let UpdatedList = fileldList.map((ele) =>
                              ele.id === item.id
                                ? {
                                    ...item,
                                    access: !item.access
                                  }
                                : ele
                            );
                            setfileldList(UpdatedList);
                          }}
                        />
                        <p> {item.name}</p>
                      </div>
                    );
                  })}
                </div>
                {showAlert && !fileldList.find((ele) => ele.access) && (
                  <Alert
                    style={{ width: "100%" }}
                    type="warning"
                    showIcon={true}
                    message="Please select at least one field to edit the report. "
                  />
                )}
              </>
            )}
          </div>
          <div className="d-flex gap-2 justify-content-end mt-2">
            {isNext ? (
              <>
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
                  onClick={() => {
                    if (
                      UpdateFilelds.hasOwnProperty("amc_start_date") &&
                      !values.amc_start_date
                    ) {
                      setDateError(true);
                    } else {
                      handleSubmit();
                    }
                  }}
                  style={{ background: "#004758" }}
                >
                  Save
                </Button>
              </>
            ) : (
              <>
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
                  onClick={() => {
                    if (fileldList.find((ele) => ele.access)) {
                      const reduceList = fileldList.reduce(
                        (acc, ele, index) => {
                          if (ele.access) {
                            acc = { ...acc, [ele.key_name]: true };
                          }
                          return acc;
                        },
                        {}
                      );
                      setUpdateFilelds(reduceList);
                      setisNext(true);
                    } else {
                      setShowAlert(true);
                    }
                  }}
                  style={{ background: "#004758" }}
                >
                  <span>Next</span>
                  <img
                    src={ExportedImages.RIGHT_ARROW_ICON}
                    style={{ width: "12px", marginLeft: "6px" }}
                  />
                </Button>
              </>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
}
