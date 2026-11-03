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

export default function PaymentHistory() {
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
      start_date: "",
      end_date: "",
      payment_status: null,
      device_id: 0,
      controller_id: 0,
      user_id: 0,
      unit_type: 1,
    },

    onSubmit: (values) => {
      setfilters({ ...values });
      handleListPaymentHistory(1, size, values);
    },
  });

  const handleListPaymentHistory = (page = 1, size = 10, values, download) => {
    setloader(true);
    let finalObj = filterValidObject({
      ...values,
      payment_status: values.payment_status >= 0 ? values.payment_status : "",
      device_id: values?.device_id || "",
      controller_id: values?.controller_id || "",
      user_id: values?.user_id || "",
    });
    if (state) {
      finalObj = {
        ...finalObj,
        [state?.data?.unit_type === 1 ? "controller_id" : "device_id"]:
          state?.data?.unit_type === 1
            ? state?.data?.unit_id
            : state?.data?.unit_id,
        unit_type: "",
        payment_status: 1,
      };
    }

    ListPaymentHistoryService(
      page,
      size,
      Object.keys(finalObj).length > 0 ? JSONtoformdata(finalObj) : ""
    )
      .then(({ data }) => {
        if (data?.status === 1) {
          if (download) {
            if (data?.data) {
              window.open(data?.data);
            }
          } else {
            setPaymentHistoryList(data);
          }
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

  const GetUserDropdown = () => {
    let formdata = new FormData();

    formdata.append("controller_type", controllertype);
    userdropdown(formdata).then(({ data }) => {
      let dubdata = data?.map((ele, ind) => {
        return { value: ele?.user_id, label: ele?.username };
      });
      setUserData([{ label: "All", value: 0 }, ...dubdata]);
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
    handleListPaymentHistory(1, 10, values);
    if (!state) {
      GetUserDropdown();
      GetControllerdropdown();
    }
    if (state) {
      dispatch(UpdateAMCfilters(state?.amcDatas));
    }
  }, [state]);

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
            <h3 className={classes.header}>Payment History</h3>
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
                  handleListPaymentHistory(1, 10, finalFilters);
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
            <CommonSelect
              placeholder={"User Id"}
              value={
                values.user_id ? values.user_id : { label: "All", values: 0 }
              }
              styles={{ width: "210px" }}
              onChange={(e) => {
                setFieldValue("user_id", e);
              }}
              options={userData}
            />
          </div>

          {!state ? (
            values.unit_type === 1 ? (
              <div className={classes.filterColums}>
                <label>Product</label>
                <CommonSelect
                  placeholder={"Product"}
                  value={values.controller_id}
                  styles={{ width: "210px" }}
                  onChange={(e) => {
                    setFieldValue("controller_id", e);
                  }}
                  options={ControllerList}
                />
              </div>
            ) : (
              <div className={classes.filterColums}>
                <label>Product</label>
                <CommonSelect
                  placeholder={"Product"}
                  value={values.device_id}
                  styles={{ width: "210px" }}
                  onChange={(e) => {
                    setFieldValue("device_id", e);
                  }}
                  options={DeviceList}
                />
              </div>
            )
          ) : (
            ""
          )}
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
            <label>From Date</label>

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
          <div className={classes.filterColums}>
            <label>To Date</label>
            <CommonDateTimePicker
              value={values?.to_date}
              onChange={(date) => {
                setFieldValue(
                  "to_date",
                  date ? dayjs(date).format("YYYY-MM-DD 23:59:59") : ""
                );
              }}
              formate={"DD-MM-YYYY"}
              placeholder={"To Date"}
              filterformtoDate={true}
              startDate={values.from_date}
              disableDate={true}
            />

            {errors?.to_date && touched?.to_date ? (
              <p className="inputerror">{errors?.to_date}</p>
            ) : null}
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
                  handleListPaymentHistory(page, size, filters, 1);
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
                <span className={classes.keyData}>User Name</span>:
                <span className={classes.valuesData}>{state?.data?.name}</span>
              </p>
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
              <p>
                <span className={classes.keyData}>Validity</span>:
                <span className={classes.valuesData}>
                  {state?.data?.validity}
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
                <span className={classes.keyData}>Product Id</span>:
                <span className={classes.valuesData}>
                  {state?.data?.unit_code}
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
                <span className={classes.keyData}>Sim Number</span>:
                <span className={classes.valuesData}>
                  {state?.data?.sim_number}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>Sim Mobile Number</span>:
                <span className={classes.valuesData}>
                  {state?.data?.sim_mobile_no}
                </span>
              </p>
              <p>
                <span className={classes.keyData}>IMSI Number</span>:
                <span className={classes.valuesData}>
                  {state?.data?.imsi_number}
                </span>
              </p>
            </div>
            <div
              className={`col-sm-12 col-md-6 col-lg-6 col-xl-3 px-3 ${classes.acmDataBlock}`}
            >
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
          </div>
        )}

        <PaymentHistoryTable
          filters={filters}
          handleListPaymentHistory={handleListPaymentHistory}
          items={items}
          total={total}
          size={size}
          page={page}
          handleChangeSim={(data) => {
            setfilters((pre) => ({ ...pre, is_sim: data }));
            setValues((pre) => ({ ...pre, is_sim: data }));
            handleListPaymentHistory(1, size, { ...values, is_sim: data });
          }}
        />
      </div>
    </>
  );
}
