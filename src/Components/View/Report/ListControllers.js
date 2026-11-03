import React, { useEffect, useState } from "react";
import ListControllerTable from "../../Tables/ListControllerTable";
import { ListControllerTableReport } from "../../../Service/ApiService";
import { useNavigate } from "react-router";
import {
  filterValidObject,
  getCatchMsg,
  JSONtoformdata,
  RequestType
} from "../../../Utilities/Methods";
import { useFormik } from "formik";
import { getCookie } from "../../../Utilities/Cookie";
import toast from "react-hot-toast";
import classes from "./reports.module.css";
import { FaArrowLeft } from "react-icons/fa";
import CommonInput from "../../CommonComponents/CommonInput";
import CommonSelect from "../../CommonComponents/CommonSelect";
import CommonDateTimePicker from "../../CommonComponents/CommonDatePicker";
import dayjs from "dayjs";

export default function ListControllers() {
  const token = JSON.parse(getCookie("cookiedata"))?.access_token;
  const [loader, setloader] = useState(false);
  let navigate = useNavigate();

  const [controllerList, setControllerList] = useState({
    items: [],
    page: 1,
    size: 10,
    total: 0
  });
  const { page, size, total, items } = controllerList;
  const [filters, setfilters] = useState({
    controller_name: "",
    device_code: "",
    from_date: "",
    to_date: "",
    request_type: ""
  });

  const { values, setFieldValue, handleSubmit, resetForm } = useFormik({
    initialValues: {
      controller_name: "",
      device_code: "",
      from_date: "",
      to_date: ""
      //   request_type: 0
    },
    onSubmit: (values) => {
      setfilters({ ...values });
      handleListController(1, 100, values);
    }
  });
  useEffect(() => {
    if (token) handleListController(1, 100, values);
  }, [token]);

  const handleListController = (page, size, filters) => {
    setloader(true);
    let finalObj = filterValidObject({
      controller_code: values?.controller_name,
      device_code: values?.device_code,
      from_date:
        values?.from_date && dayjs(values?.from_date)?.format("YYYY-MM-DD"),
      to_date: values?.to_date && dayjs(values?.to_date)?.format("YYYY-MM-DD"),
      request_type: values?.request_type
    });
    console.log(finalObj, "Finalklsdkfsdf");

    ListControllerTableReport(
      page,
      size,
      Object.keys(finalObj).length !== 0 ? JSONtoformdata(finalObj) : ""
    )
      .then(({ data }) => {
        if (data.status === 1) {
          setControllerList(data);
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

  const Navigatetodashboard = () => {
    navigate("/dashboard");
  };
  console.log(values, controllerList, "Finalklsdkfsdf");
  return (
    <div className={classes.router_pages}>
      <div className="pre-page">
        <FaArrowLeft className="arrow" onClick={() => Navigatetodashboard()} />
        <h3 className={classes.header}>User Access Log</h3>
      </div>
      <div className={classes.headerBlock}>
        <form className={classes.filterBlock} onSubmit={handleSubmit}>
          <div className={classes.filterColums}>
            <label>Controller</label>
            <CommonInput
              value={values.controller_name}
              onChange={(e) => {
                setFieldValue("controller_name", e);
              }}
              placeholder="Controller"
            />
          </div>
          <div className={classes.filterColums}>
            <label>Device Code</label>
            <CommonInput
              value={values.device_code}
              onChange={(e) => {
                setFieldValue("device_code", e);
              }}
              placeholder="Device Code"
            />
          </div>

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
              disableDate={true}
              // isFuture={true}
              // allowClear={false}
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
              // allowClear={false}
              for_todate={true}
              placeholder={"To Date"}
              startDate={values.from_date}
              disableDate={true}
            />
          </div>

          <div className={classes.filterColums}>
            <label>Type</label>
            <CommonSelect
              placeholder={"Type"}
              value={values.request_type}
              styles={{ width: "210px" }}
              onChange={(e) => {
                setFieldValue("request_type", e);
              }}
              options={RequestType}
              allowClear={false}
            />
          </div>
          {/* <div className={classes.filterColums}>
            <label>Mobile No</label>
            <CommonInput
              value={values.mobile_no}
              onChange={(e) => {
                setFieldValue("mobile_no", e);
              }}
              placeholder="Mobile Number"
            />
          </div> */}

          <div className={`mt-0 ${classes.submitresetDiv}`}>
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
                resetForm();
                handleSubmit();
              }}
            >
              Reset
            </button>
            {/* {total > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleListSimData(page, size, filters, 1);
                }}
                className={classes.downloadHistorybutton}
              >
                Download
              </button>
            )} */}
          </div>
        </form>
      </div>

      <ListControllerTable
        filters={filters}
        handleListController={(page, size, filters) => {
          console.log(page, size, filters, "Fitersssksk");

          handleListController(page, size, filters);
        }}
        items={items}
        total={total}
        size={size}
        page={page}
      />
    </div>
  );
}
