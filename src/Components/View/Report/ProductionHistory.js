import React, { useEffect, useRef, useState } from "react";
import Loader from "../../Loader";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaArrowLeft,
} from "react-icons/fa";
import classes from "./reports.module.css";
import CommonDateTimePicker from "../../CommonComponents/CommonDatePicker";
import {
  controllerdropdown,
  ProductionHistoryService,
  usercontrollerdropdownapi,
  userdropdown,
  Viewadmindevicedelete,
} from "../../../Service/ApiService";
import ReactPaginate from "react-paginate";
import {
  getCatchMsg,
  getCurrentStartandEndDate,
  JSONtoformdata,
  RemoveNonNumeric,
} from "../../../Utilities/Methods";
import dayjs from "dayjs";
import { Form, Table } from "react-bootstrap";
import * as yup from "yup";
import { getCookie } from "../../../Utilities/Cookie";
import ViewMessageModal from "../../../Modalcomponents/ViewMessageModal";
import CommonSelect from "../../CommonComponents/CommonSelect";
import {
  ControllerTypeDropdown,
  FilterDeviceTypeDropdown,
} from "../../../Utilities/Constants";

const validate = yup.object().shape({
  from_date: yup.date().default(() => new Date()),
  to_date: yup
    .date()
    .min(yup.ref("from_date"), "End date can't be before Start date"),
  checkInput: yup.string().required(""),
});
export default function ProductionHistory() {
  let navigate = useNavigate();
  const [loader, setloader] = useState(false);
  const [serialno, setserialno] = useState("");
  let controllertype = JSON.parse(localStorage.getItem("contollertype"));
  const [historyList, setHistorylist] = useState({
    items: [],
    page: 1,
    size: 10,
    total: 0,
  });
  const [showMsgModal, setshowMsgModal] = useState({ show: false, msg: "" });
  let cookie = JSON.parse(getCookie("cookiedata"));
  let usertype = cookie?.user_type;
  const [userData, setUserData] = useState([]);
  const [ControllerList, setControllerList] = useState([]);
  const [DeviceList, setDeviceList] = useState([]);
  const { total, page, size, items } = historyList;
  const PageCount = Math.ceil(total / 10);
  const [filters, setfilters] = useState({
    user_id: "",
    controller_id: 0,
    device_id: 0,
    from_date: getCurrentStartandEndDate().start_date,
    to_date: getCurrentStartandEndDate().end_date,
    checkInput: "",
    controller_type: 0,
    device_type: 0,
  });
  const {
    values,
    errors,
    touched,
    setValues,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useFormik({
    initialValues: {
      user_id: "",
      controller_id: 0,
      device_id: 0,
      from_date: getCurrentStartandEndDate().start_date,
      to_date: getCurrentStartandEndDate().end_date,
      checkInput: "",
      controller_type: 0,
      device_type: 0,
    },

    validationSchema: validate,
    onSubmit: (values) => {
      setfilters({
        ...values,
        checkInput:
          values?.checkInput === 1 ? 1 : values?.checkInput === 2 ? 2 : "",
      });
      setserialno(0);
      handleListHistory(1, size, values);
    },
  });
  const CheckAnyfilterAvailable = () => {
    if (
      values?.controller_id ||
      values?.device_id ||
      values?.from_date ||
      values?.to_date ||
      values?.user_id
    ) {
      return true;
    } else return false;
  };

  const handleListHistory = (
    page = 1,
    size = 10,
    values = {},
    download = 0
  ) => {
    setloader(true);
    let finalObj = {
      ...values,
      from_date: values?.from_date
        ? dayjs(values?.from_date).format("YYYY-MM-DD 00:00:00")
        : "",
      to_date: values?.to_date
        ? dayjs(values?.to_date).format("YYYY-MM-DD 23:59:59")
        : "",
      controller_id: values.controller_id !== 0 ? values.controller_id : "",
      device_id: values.device_id !== 0 ? values.device_id : "",
      for_type: values?.checkInput ? values?.checkInput : "",
      user_id: values.user_id !== 0 ? values?.user_id : "",
      controller_type: values?.controller_type ? values?.controller_type : "",
      device_type: values?.device_type ? values?.device_type : "",
    };
    delete finalObj.checkInput;
    if (download) {
      finalObj.download = 1;
    }
    ProductionHistoryService(page, size, JSONtoformdata(finalObj))
      .then((result) => {
        if (result?.data?.data) {
          window.open(result?.data.data);
        } else {
          setHistorylist(result?.data);
        }
      })
      .catch((err) => {
        getCatchMsg(err);
      })
      .finally(() => setloader(false));
  };
  const handlePageClick = (event) => {
    handleListHistory(event.selected + 1, 10, filters);
    // setservicepage(JSON.parse(event.selected) + 1);
    setserialno(JSON.parse(event.selected));
  };
  const GetUserDropdown = () => {
    let formdata = new FormData();

    formdata.append("controller_type", controllertype);
    formdata.append("user_type", 4);

    userdropdown(formdata).then(({ data }) => {
      let dubdata = data?.map((ele, ind) => {
        return { value: ele?.user_id, label: ele?.username };
      });
      setUserData([{ label: "All", value: 0 }, ...dubdata]);
    });
  };

  const GetControllerdropdown = (type = null) => {
    let formdata = new FormData();
    if (type) {
      formdata.append("controller_type", type);
    }
    // formdata.append("controller_type", type ? type : controllertype);
    formdata.append("for_history", 1);
    usercontrollerdropdownapi(formdata).then(({ data }) => {
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

    // formdata.append("controller_type", controllertype);

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

  useEffect(() => {
    // handleListHistory(1, 10, values);
    GetUserDropdown();
    // GetControllerdropdown();
    // GetDevicedropdown();
  }, []);
  const TableCheckData = (data) => {
    return data ? data : "-";
  };

  const checkboxRef1 = useRef(null);
  const checkboxRef2 = useRef(null);

  const handleClickSubmit = () => {
    if (checkboxRef1.current) {
      checkboxRef1.current.classList.add("shake");

      // Remove the class after the animation completes
      setTimeout(() => {
        checkboxRef1.current.classList.remove("shake");
      }, 500);
    }
    if (checkboxRef2.current) {
      checkboxRef2.current.classList.add("shake");

      // Remove the class after the animation completes
      setTimeout(() => {
        checkboxRef2.current.classList.remove("shake");
      }, 500);
    }
  };
  return (
    <>
      {showMsgModal?.show && (
        <ViewMessageModal
          msg={showMsgModal.msg}
          show={showMsgModal.show}
          close={() => {
            setshowMsgModal({ show: false, msg: "" });
          }}
          data={showMsgModal.data}
        />
      )}
      <Loader isLoader={loader} />
      <div className={classes.router_pages}>
        <div className="pre-page">
          <FaArrowLeft
            className="arrow"
            onClick={() => navigate("/dashboard")}
          />
          <h3 className={classes.header}>Production History</h3>
        </div>

        <div className={classes.filterBlock}>
          <div className={classes.filterColums}>
            <label>From Date</label>

            <CommonDateTimePicker
              value={values?.from_date}
              onChange={(date) => {
                setValues({
                  ...values,
                  from_date: new Date(date),
                });
              }}
              formate={"DD-MM-YYYY"}
              disableDate={true}
              isFuture={true}
              allowClear={false}
            />
          </div>
          <div className={classes.filterColums}>
            <label>To Date</label>

            <CommonDateTimePicker
              value={values?.to_date}
              onChange={(date) => {
                setValues({
                  ...values,
                  to_date: new Date(date),
                });
              }}
              formate={"DD-MM-YYYY"}
              disableDate={true}
              isFuture={true}
              allowClear={false}
            />

            {errors?.to_date && touched?.to_date ? (
              <p className="inputerror">{errors?.to_date}</p>
            ) : null}
          </div>
          {usertype === 1 && (
            <div className={classes.filterColums}>
              <label>User ID</label>
              <CommonSelect
                placeholder={"User Id"}
                value={
                  values.user_id ? values.user_id : { label: "All", values: 0 }
                }
                styles={{ width: "200px" }}
                onChange={(e) => {
                  setFieldValue("user_id", e);
                }}
                options={userData}
                allowClear={false}
              />
            </div>
          )}
          <div className={classes.filterColums} style={{ marginTop: "24px" }}>
            <Form.Check
              inline
              label="Controller"
              name="Controller"
              ref={checkboxRef1}
              type={"radio"}
              className={!values?.checkInput ? "redBox" : ""}
              checked={values?.checkInput == 1 ? true : false}
              onClick={() => {
                if (values?.checkInput !== 1) {
                  setValues((pre) => ({
                    ...pre,
                    checkInput: 1,
                    device_id: "",
                    controller_id: 0,
                    controller_type: null,
                    device_type: null,
                  }));
                  GetControllerdropdown();
                }
              }}
            />
            <Form.Check
              inline
              label="Device"
              name="Controller"
              ref={checkboxRef2}
              type={"radio"}
              className={!values?.checkInput ? "redBox" : ""}
              checked={values?.checkInput == 2 ? true : false}
              onClick={() => {
                if (values?.checkInput !== 2) {
                  setValues((pre) => ({
                    ...pre,
                    checkInput: 2,
                    controller_id: "",
                    device_id: 0,
                    controller_type: null,
                    device_type: null,
                  }));
                  GetDevicedropdown();
                }
              }}
            />
          </div>
          {values?.checkInput === 1 && (
            <>
              <div className={classes.filterColums}>
                <label>Controller Type</label>
                <CommonSelect
                  placeholder={"Controller Type"}
                  value={values.controller_type ?? { label: "All", values: 0 }}
                  styles={{ width: "200px" }}
                  onChange={(e) => {
                    setFieldValue("controller_type", e);
                    GetControllerdropdown(e);
                  }}
                  options={ControllerTypeDropdown}
                  allowClear={false}
                />
              </div>
              <div className={classes.filterColums}>
                <label>Controller ID</label>
                <CommonSelect
                  placeholder={"Controller ID"}
                  value={
                    values.controller_id
                      ? values.controller_id
                      : { label: "All", values: 0 }
                  }
                  styles={{ width: "200px" }}
                  onChange={(e) => {
                    setFieldValue("controller_id", e);
                  }}
                  options={ControllerList}
                  allowClear={false}
                />
              </div>
            </>
          )}

          {values.checkInput === 2 && (
            <>
              <div className={classes.filterColums}>
                <label>Device Type</label>
                <CommonSelect
                  placeholder={"Device Type"}
                  value={values.device_type ?? { label: "All", values: 0 }}
                  styles={{ width: "200px" }}
                  onChange={(e) => {
                    setFieldValue("device_type", e);
                    GetDevicedropdown(e);
                  }}
                  options={FilterDeviceTypeDropdown}
                  allowClear={false}
                />
              </div>
              <div className={classes.filterColums}>
                <label>Device ID</label>
                <CommonSelect
                  placeholder={"Device ID"}
                  value={
                    values.device_id
                      ? values.device_id
                      : { label: "All", values: 0 }
                  }
                  styles={{ width: "200px" }}
                  onChange={(e) => {
                    setFieldValue("device_id", e);
                  }}
                  options={DeviceList}
                  allowClear={false}
                />
              </div>
            </>
          )}
          <div className={classes.submitresetDiv}>
            <button
              type="submit"
              className={classes.searchBtn}
              onClick={() => {
                if (!values?.checkInput) {
                  handleClickSubmit();
                }
                handleSubmit();
              }}
            >
              Search
            </button>
            <button
              type="button"
              className={classes.resetBtn}
              onClick={() => {
                resetForm();
                handleSubmit();
              }}
            >
              Reset
            </button>
            {historyList.total > 0 && filters.checkInput ? (
              <button
                type="button"
                onClick={() => {
                  handleListHistory(page, size, filters, 1);
                }}
                className={classes.downloadHistorybutton}
              >
                Download
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
        {filters?.checkInput ? (
          <>
            <div className={classes.ReportTable}>
              <Table>
                <thead>
                  <tr>
                    <th>S.no</th>
                    <th>User Name</th>
                    <th>Date</th>
                    {filters?.checkInput === 1 ? (
                      <>
                        <th>Controller Type</th>
                        <th>Controller</th>
                        <th>Code</th>
                        <th>H/W Version</th>
                        <th>S/W Version</th>
                      </>
                    ) : (
                      ""
                    )}
                    {filters?.checkInput === 2 ? (
                      <>
                        <th>Device Type</th>
                        <th>Device</th>
                        <th>Code</th>
                        <th>H/W Version</th>
                        <th>S/W Version</th>
                      </>
                    ) : (
                      ""
                    )}
                    <th>Tower</th>
                    <th>Status</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {total > 0 ? (
                    items?.map((historyData, index) => {
                      return (
                        <tr>
                          <td>{serialno * 10 + (index + 1)}</td>
                          <td>{TableCheckData(historyData?.username)}</td>
                          <td>{TableCheckData(historyData?.updated_at)}</td>

                          {filters?.checkInput === 1 ? (
                            <>
                              <td>
                                {TableCheckData(
                                  historyData?.controller_type_name
                                )}
                              </td>
                              <td>
                                {TableCheckData(historyData?.controller_name)}
                              </td>
                              <td>
                                {TableCheckData(historyData?.controller_code)}
                              </td>
                              <td>
                                {TableCheckData(
                                  historyData?.controller_hw_version
                                )}
                              </td>
                              <td>
                                {TableCheckData(
                                  historyData?.controller_sw_version
                                )}
                              </td>
                              <td>
                                {historyData.controller_tower !== null
                                  ? historyData.controller_tower
                                  : "-"}
                              </td>
                            </>
                          ) : (
                            ""
                          )}
                          {filters?.checkInput === 2 ? (
                            <>
                              <td>
                                {TableCheckData(historyData?.device_type_name)}
                              </td>
                              <td>
                                {TableCheckData(historyData?.device_name)}
                              </td>
                              <td>
                                {TableCheckData(historyData?.device_code)}
                              </td>
                              <td>
                                {TableCheckData(historyData?.device_hw_version)}
                              </td>{" "}
                              <td>
                                {TableCheckData(historyData?.device_sw_version)}
                              </td>
                              <td>
                                {historyData.device_tower !== null
                                  ? historyData.device_tower
                                  : "-"}
                              </td>
                            </>
                          ) : (
                            ""
                          )}
                          <td>{TableCheckData(historyData?.status_name)}</td>
                          <td
                            onClick={() => {
                              if (historyData?.msg) {
                                setshowMsgModal({
                                  show: true,
                                  msg: historyData?.msg,
                                  data: {
                                    ...historyData,
                                    displayName:
                                      filters?.checkInput === 1
                                        ? historyData.controller_name
                                        : historyData?.device_name,
                                  },
                                });
                              }
                            }}
                          >
                            <p className={classes.HistoryMsgBox}>
                              {TableCheckData(historyData?.msg)}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr rowSpan={3}>
                      <td
                        colSpan={11}
                        // style={{  }}
                      >
                        <p className={classes.tablenoDatatext}>
                          No History Found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            {total > 10 && filters?.checkInput ? (
              <div className="col-12 float-start d-flex justify-content-center mt-4">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<FaAngleDoubleRight />}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={5}
                  pageCount={PageCount}
                  previousLabel={<FaAngleDoubleLeft />}
                  renderOnZeroPageCount={null}
                  containerClassName={"container-class"}
                  pageLinkClassName={"page-link"}
                  pageClassName={"page-item"}
                  previousClassName={"next-page-item"}
                  previousLinkClassName={"pre-link-item"}
                  nextClassName={"next-page-item"}
                  nextLinkClassName={"pre-link-item"}
                  activeClassName={"active-page"}
                  forcePage={page - 1}
                />
              </div>
            ) : null}
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
