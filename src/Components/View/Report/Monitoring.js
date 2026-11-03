import { useEffect, useRef, useState } from "react";
import Loader from "../../Loader";
import classes from "./reports.module.css";
import { useLocation, useNavigate } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import { useFormik } from "formik";
import {
  filterValidObject,
  getCatchMsg,
  JSONtoformdata,
  StatusOptions,
} from "../../../Utilities/Methods";
import CommonDateTimePicker from "../../CommonComponents/CommonDatePicker";
import {
  AMSREportService,
  ListPaymentHistoryService,
  MonitoringListService,
  usercontrollerdropdownapi,
  userdropdown,
  Viewadmindevicedelete,
} from "../../../Service/ApiService";
import CommonSelect from "../../CommonComponents/CommonSelect";
import dayjs from "dayjs";

import toast from "react-hot-toast";
import CommonTabs from "../../CommonComponents/CommonTabs";
import CommonInput from "../../CommonComponents/CommonInput";
import {
  ControllerTypeDropdown,
  FilterDeviceTypeDropdown,
  PAYMENT_STATUS,
} from "../../../Utilities/Constants";
import { ReportTable } from "../../Tables/ReportTable";
import PaymentHistoryTable from "../../Tables/PaymentHistoryTable";
import { Tooltip } from "antd";
import ViewMessageModal from "../../../Modalcomponents/ViewMessageModal";
import { useDispatch } from "react-redux";
import { UpdateAMCfilters } from "../../Store/Config/Configuration";
import MonitoringTable from "../../Tables/MonitoringTable";

export default function Monitoring() {
  let navigate = useNavigate();
  const [loader, setloader] = useState(false);
  const [userData, setUserData] = useState([]);
  const [contentModal, setshowContentModal] = useState({
    show: false,
    data: "",
    displayName: "",
  });
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  const [filters, setfilters] = useState({
    start_date: "",
    end_date: "",
    payment_status: null,
    device_id: 0,
    controller_id: 0,
    user_id: 0,
    unit_type: 1,
  });
  let dispatch = useDispatch();
  const { state } = useLocation();
  const [ControllerList, setControllerList] = useState([]);
  const [DeviceList, setDeviceList] = useState([]);
  const [PaymentHistoryList, setPaymentHistoryList] = useState({
    items: [],
    page: 1,
    size: 10,
    total: 0,
  });
  const { page, size, total, items } = PaymentHistoryList;

  const {
    values,
    errors,
    touched,
    setValues,
    handleSubmit,
    resetForm,
    setFieldValue,
    initialValues,
  } = useFormik({
    initialValues: {
      unit_type: 1,
      controller_code: "",
      controller_name: "",
      controller_type: null,
      device_code: "",
      device_name: "",
      device_type: null,
      without_null: "",
      order_by: "",
      order: "",
      communicated_time: null,
    },

    onSubmit: (values) => {
      setfilters({ ...values });
      getListMotorData(1, size, values);
    },
  });

  const getListMotorData = (page = 1, size = 25) => {
    setloader(true);

    MonitoringListService(
      page,
      size,
      JSONtoformdata({ unit_type: values?.unit_type })
    )
      .then((response) => {
        // if (response?.data?.status === 1) {
        setPaymentHistoryList(response?.data?.items || []);
        // } else {
        // toast.error(response?.data.msg);
        // }
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => {
        setloader(false);
      });
  };

  const GetControllerdropdown = (type = null) => {
    usercontrollerdropdownapi().then(({ data }) => {
      let dubdata = data?.map((ele, ind) => {
        if (ele?.controller_code) {
          return { value: ele?.controller_id, label: ele?.controller_code };
        }
      });
      let finalData = dubdata?.filter((ele) => ele != undefined);
      setControllerList([{ label: "All", value: 0 }, ...finalData]);
      setFieldValue("controller_id", 0);
    });
  };
  const GetDevicedropdown = (devicetype = null) => {
    let formdata = new FormData();

    if (devicetype) {
      formdata.append("device_type", devicetype);
    }
    Viewadmindevicedelete(devicetype ? formdata : "", 1, 1000).then(
      ({ data }) => {
        let dubdata = data?.items?.map((ele, ind) => {
          if (ele?.device_code) {
            return { value: ele?.id, label: ele?.device_code };
          }
        });
        let finalData = dubdata?.filter((ele) => ele != undefined);
        setDeviceList([{ label: "All", value: 0 }, ...finalData]);
        setFieldValue("device_id", 0);
      }
    );
  };
  const Dataitems = [
    {
      key: 1,
      label: "Controller",
      children: "",
    },
    {
      key: 2,
      label: "Device",
      children: "",
    },
  ];
  useEffect(() => {
    getListMotorData(1, 25, values);
  }, []);

  return (
    <>
      {contentModal.show && (
        <ViewMessageModal
          close={() => {
            setshowContentModal({ show: false, data: "", displayName: "" });
          }}
          data={{ displayName: contentModal.displayName }}
          msg={contentModal.data}
          show={contentModal.show}
        />
      )}
      <Loader isLoader={loader} />
      <div className={classes.router_pages}>
        <div className="row mt-2 mb-4">
          <div className="pre-page col-sm-5">
            <FaArrowLeft
              className="arrow"
              onClick={() => {
                navigate(state ? -1 : "/dashboard");
              }}
            />
            <h3 className={classes.header}>Monitoring</h3>
          </div>
          {!state && (
            <div className="col-sm-6">
              <CommonTabs
                items={Dataitems}
                onChange={(data) => {
                  let finalFilters = {
                    ...initialValues,
                    unit_type: data,
                  };
                  setValues(finalFilters);
                  getListMotorData(1, 25, finalFilters);
                  if (data === 1) {
                    GetControllerdropdown();
                  } else {
                    GetDevicedropdown();
                  }
                }}
                activeKey={values.unit_type}
              />
            </div>
          )}
        </div>

        <div className={classes.filterBlock}>
          <div className={classes.filterColums}>
            <label>User</label>
            <CommonInput
              placeholder={"User Id"}
              value={""}
              styles={{ width: "210px" }}
              onChange={(e) => {
                setFieldValue("user_id", e);
              }}
              options={userData}
            />
          </div>

          <div className={classes.filterColums}>
            <label>Controller</label>
            <CommonInput
              placeholder={"Controller"}
              value={values.controller_id}
              styles={{ width: "210px" }}
              onChange={(e) => {
                setFieldValue("controller_id", e);
              }}
              options={ControllerList}
            />
          </div>

          {!state && (
            <div className={classes.filterColums}>
              <label>Payment Status</label>
              <CommonSelect
                placeholder={"Payment Status"}
                value={values.payment_status}
                styles={{ width: "210px" }}
                onChange={(e) => {
                  setFieldValue("payment_status", e);
                }}
                options={PAYMENT_STATUS}
              />
            </div>
          )}
          <div className={classes.filterColums}>
            <label>Last Communicated Date</label>

            <CommonDateTimePicker
              value={values?.from_date}
              onChange={(date) => {
                setFieldValue(
                  "from_date",
                  date ? dayjs(date).format("YYYY-MM-DD 00:00:00") : ""
                );
              }}
              placeholder={"From Date"}
              formate={"DD-MM-YYYY"}
              filterformtoDate={true}
              endDate={values.to_date}
              disableDate={true}
            />
          </div>

          <div className={classes.submitresetDiv} style={{ marginTop: "10px" }}>
            <button
              type="submit"
              className={classes.searchBtn}
              onClick={() => {
                handleSubmit();
              }}
            >
              Search
            </button>
            <button
              type="button"
              className={classes.resetBtn}
              onClick={() => {
                let finalTypes = {
                  unit_type: values?.unit_type,
                  controller_type: values?.controller_type,
                  device_type: values?.device_type,
                };
                setValues({ ...initialValues, ...finalTypes });
                setfilters({ ...initialValues, ...finalTypes });
                handleSubmit();
              }}
            >
              Reset
            </button>
            {/* {total > 0 && (
              <button
                type="button"
                onClick={() => {
                  getListMotorData(page, size, filters, 1);
                }}
                className={classes.downloadHistorybutton}
              >
                Download
              </button>
            )} */}
          </div>
        </div>

        {state && (
          <div className={`row mx-1 mt-3 ${classes.amcdataViewContainer}`}>
            <div
              className={`col-sm-12 col-md-6 col-lg-6 col-xl-3 px-3 ${classes.acmDataBlock}`}
            >
              <p>
                <span className={classes.keyData}>Product Id</span>:
                <span className={classes.valuesData}>
                  {state?.data?.unit_code}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>Sim Number</span>:
                <span className={classes.valuesData}>
                  {state?.data?.sim_number}
                </span>
              </p>

              <p>
                <span className={classes.keyData}>Sim Started Date</span>:
                <span className={classes.valuesData}>
                  {state?.data?.amc_start_date
                    ? dayjs(state?.data?.amc_start_date).format(
                        "DD-MM-YYYY HH:mm:ss"
                      )
                    : ""}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>Product Conditions</span>:
                <span
                  className={classes.valuesData}
                  style={{ color: state?.data?.status === 1 ? "green" : "red" }}
                >
                  {state?.data?.status ? "Active" : "InActive"}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>Remarks</span>:
                <span
                  className={` ${classes.bigContentText} ${classes.valuesData}`}
                  onClick={() => {
                    if (state?.data?.remarks) {
                      setshowContentModal({
                        show: true,
                        data: state?.data?.remarks,
                        displayName: "Remarks",
                      });
                    }
                  }}
                >
                  {state?.data?.remarks}
                </span>
              </p>
            </div>
            <div
              className={`col-sm-12 col-md-6 col-lg-6 col-xl-3 px-3 ${classes.acmDataBlock}`}
            >
              <p>
                <span className={classes.keyData}>Product Name</span>:
                <span className={classes.valuesData}>
                  {state?.data?.unit_name}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>Sim Mobile Number</span>:
                <span className={classes.valuesData}>
                  {state?.data?.sim_mobile_no}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>Sim Expiry Date</span>:
                <span className={classes.valuesData}>
                  {state?.data?.amc_end_date
                    ? dayjs(state?.data?.amc_end_date).format(
                        "DD-MM-YYYY HH:mm:ss"
                      )
                    : ""}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>AMC Conditions</span>:
                <span
                  className={classes.valuesData}
                  style={{
                    color: state?.data?.amc_status === 1 ? "green" : "red",
                  }}
                >
                  {state?.data?.amc_status === 1 ? "Activate" : "DeActivate"}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>Display Content</span>:
                <span
                  className={`${classes.valuesData} 
                     ${classes.bigContentText}`}
                  onClick={() => {
                    if (state?.data?.amc_msg) {
                      setshowContentModal({
                        show: true,
                        data: state?.data?.amc_msg,
                        displayName: "Display Content",
                      });
                    }
                  }}
                >
                  {state?.data?.amc_msg}
                </span>
              </p>
            </div>
            <div
              className={`col-sm-12 col-md-6 col-lg-6 col-xl-3 px-3 ${classes.acmDataBlock}`}
            >
              <p>
                <span className={classes.keyData}>User Name</span>:
                <span className={classes.valuesData}>{state?.data?.name}</span>
              </p>
              <p>
                <span className={classes.keyData}>IMSI Number</span>:
                <span className={classes.valuesData}>
                  {state?.data?.imsi_number}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>Validity</span>:
                <span className={classes.valuesData}>
                  {state?.data?.validity}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>No of Days to Blur</span>:
                <span className={classes.valuesData}>
                  {state?.data?.inactivate_delay}
                </span>
              </p>
            </div>
            <div
              className={`col-sm-12 col-md-6 col-lg-6 col-xl-3 px-3 ${classes.acmDataBlock}`}
            >
              <p>
                <span className={classes.keyData}> Mobile No</span>:
                <span className={classes.valuesData}>
                  {state?.data?.mobile_no}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>Network</span>:
                <span className={classes.valuesData}>
                  {state?.data?.network}
                </span>
              </p>

              <p>
                <span className={classes.keyData}>Charges</span>:
                <span className={classes.valuesData}>
                  {state?.data?.amc_cost}
                </span>
              </p>
            </div>
          </div>
        )}

        <MonitoringTable
          filters={filters}
          getListMotorData={getListMotorData}
          items={items}
          total={total}
          size={size}
          page={page}
          handleChangeSim={(data) => {
            setfilters((pre) => ({ ...pre, is_sim: data }));
            setValues((pre) => ({ ...pre, is_sim: data }));
            getListMotorData(1, size, { ...values, is_sim: data });
          }}
        />
      </div>
    </>
  );
}
