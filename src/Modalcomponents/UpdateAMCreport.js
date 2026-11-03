import { Button, Modal } from "react-bootstrap";
import styles from "../Modalcomponents/Modal.module.css";
import { useFormik } from "formik";
import {
  Float_Validation,
  getCatchMsg,
  JSONtoformdatawithempty
} from "../Utilities/Methods";
import {
  SimDropdownService,
  UpdateAMCReportService
} from "../Service/ApiService";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Loader from "../Components/Loader";
import CommonDateTimePicker from "../Components/CommonComponents/CommonDatePicker";
import CommonSelect from "../Components/CommonComponents/CommonSelect";
import * as Yup from "yup";
import dayjs from "dayjs";
import CommonInput from "../Components/CommonComponents/CommonInput";
import CommonSwitch from "../Components/CommonComponents/CommonSwitch";
import ConfirmationModal from "./ConfirmationModal";
// const validationSchema = Yup.object().shape({});
export default function UpdateAMCReport({ show, onClose, type, UpdateData }) {
  const [loader, setloader] = useState(false);
  const [SimList, setSimList] = useState([]);
  const [amcchangeStatus, setAmcchangeStatus] = useState({
    type: 0,
    show: false
  });
  const { values, setFieldValue, errors, touched, handleSubmit, setValues } =
    useFormik({
      initialValues: {
        sim_id: null,
        sim_name: "",
        amc_start_date: "",
        amc_cost: "",
        validity: "",
        amc_msg: "",
        remarks: "",
        status: "",
        amc_status: "",
        inactivate_delay: "",
        not_show_pay: "",
        not_show_charge: ""
        // deactivate_delay: "",
      },
      // validationSchema,
      onSubmit: (values) => {
        UpdateAMCReportData(values);
      }
    });

  const UpdateAMCReportData = (values) => {
    setloader(true);
    let finalObj = {
      controller_id: type === 1 ? UpdateData.unit_id : "",
      device_id: type === 2 ? UpdateData.unit_id : "",
      sim_id: values.sim_id || "",
      amc_start_date: values.amc_start_date || "",
      amc_cost: values.amc_cost || "",
      validity: values.validity || "",
      amc_msg: values.amc_msg || "",
      remarks: values.remarks || "",
      status: values.status === 1 ? 1 : 0,
      amc_status: values.amc_status === 1 ? 1 : 0,
      inactivate_delay: values.inactivate_delay || "",
      deactivate_pay_option: values.not_show_pay === 1 ? 1 : 0,
      deactivate_charge_display: values.not_show_charge === 1 ? 1 : 0
      // deactivate_delay: values.deactivate_delay || "",
    };
    if (type === 1) {
      delete finalObj.device_id;
    } else {
      delete finalObj.controller_id;
    }
    UpdateAMCReportService(JSONtoformdatawithempty(finalObj))
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

  const getSimDropdown = () => {
    SimDropdownService().then(({ data }) => {
      if (data.status === 1) {
        let finalData = data.data.map((ele) => ({
          ...ele,
          label: ele.sim_number,
          value: ele.id
        }));
        setSimList(finalData);
      } else {
        toast.error(data.msg);
      }
    });
  };

  const handleUpdateDatas = () => {
    setValues({
      sim_id: UpdateData.sim_id || null,
      sim_name: UpdateData.sim_number || null,
      amc_start_date: UpdateData?.amc_start_date,
      amc_cost: UpdateData?.amc_cost || "",
      validity: UpdateData?.validity || "",
      amc_msg: UpdateData?.amc_msg || "",
      remarks: UpdateData?.remarks || "",
      amc_status: UpdateData.amc_status || "",
      status: UpdateData.status || "",
      inactivate_delay: UpdateData.inactivate_delay || "",
      not_show_pay: UpdateData?.not_show_pay,
      not_show_charge: UpdateData?.not_show_charge
      // deactivate_delay: UpdateData.deactivate_delay || "",
    });
  };

  useEffect(() => {
    handleUpdateDatas();
    getSimDropdown();
  }, []);
  console.log(UpdateData, "UpdateData");

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
                "not_show_charge",
                values?.not_show_charge === 1 ? 0 : 1
              );
            } else if (amcchangeStatus.type === 4) {
              setFieldValue("not_show_pay", values?.not_show_pay === 1 ? 0 : 1);
            }

            setAmcchangeStatus({ show: false, type: 0 });
          }}
        />
      )}
      <div className={styles.modal}>
        <Modal size="xl" show={show} onHide={onClose}>
          <Modal.Header closeButton className={styles.messageHead}>
            Edit AMC Report
          </Modal.Header>
          <Modal.Body>
            <form className="row ">
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4 px-2 mb-3">
                <label className="modal-label">SIM</label>
                <br />
                <CommonSelect
                  options={SimList}
                  placeholder={"Sim"}
                  onChange={(data, opt) => {
                    setFieldValue("sim_id", data);
                    setFieldValue("sim_name", opt?.label);
                  }}
                  isSearchable
                  value={values.sim_id}
                  styles={{ width: "100%" }}
                  valueName={values?.sim_name}
                />
                {errors.sim_id && touched.sim_id ? (
                  <p className="errorText">{errors.sim_id}</p>
                ) : (
                  ""
                )}
              </div>
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   px-2 mb-3">
                <label className="modal-label">SIM Started date</label>
                <br />
                <CommonDateTimePicker
                  placeholder={"Sim Start Date"}
                  onChange={(data) => {
                    setFieldValue(
                      "amc_start_date",
                      data ? dayjs(data).format("YYYY-MM-DD HH:mm:ss") : ""
                    );
                  }}
                  formate={"DD-MM-YYYY"}
                  value={values.amc_start_date}
                  styles={{ width: "100%" }}
                />
              </div>
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   px-2 mb-3">
                <label className="modal-label">Charges</label>
                <br />
                <CommonInput
                  maxLength={8}
                  value={values.amc_cost}
                  onChange={(data) => {
                    if ((data <= 99999.99 && data !== "0") || data == "") {
                      if (Float_Validation(data)) {
                        setFieldValue("amc_cost", data);
                      }
                    }
                  }}
                  placeholder="Charges"
                  styles={{ width: "100%" }}
                />
              </div>
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   px-2 mb-3">
                <label className="modal-label">Validity (In Months)</label>
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
              {/* <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   px-2 mb-3">
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
              </div> */}
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
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   mb-3">
                <label className="modal-label">Charges Toggle</label>
                <br />
                <CommonSwitch
                  label={true}
                  checked={values.not_show_charge === 1 ? false : true}
                  onChange={() => {
                    setAmcchangeStatus({ show: true, type: 3 });
                  }}
                  type={2}
                />
              </div>
              <div className="col-sm-12 col-md-12  col-lg-6 col-xl-4   mb-3">
                <label className="modal-label">Pay Toggle</label>
                <br />
                <CommonSwitch
                  checked={values.not_show_pay === 1 ? false : true}
                  label={true}
                  onChange={() => {
                    setAmcchangeStatus({ show: true, type: 4 });
                  }}
                  type={2}
                />
              </div>
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
            </form>
          </Modal.Body>
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
        </Modal>
      </div>
    </>
  );
}
