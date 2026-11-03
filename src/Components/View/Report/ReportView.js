import React, { useEffect, useState } from "react";
import classes from "./reports.module.css";
import "../ViewController.modules.css";
import "../../../Assets/css/Dashboard.modules.css";
import * as Yup from "yup";
import { useFormik } from "formik";
import moment from "moment";
import { controllerdropdown } from "../../../Service/ApiService";
import Select from "react-select";
import { mailreport } from "../../../Service/ApiService";
import { toast } from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import Loader from "../../Loader";
import { useNavigate } from "react-router";
import { Form } from "react-bootstrap";
import CommonDateTimePicker from "../../CommonComponents/CommonDatePicker";
import { GetCookieStorage, GetLocalStorage } from "../../../Utilities/Storage";
import { getCatchMsg } from "../../../Utilities/Methods";

const validate = Yup.object().shape({
  startDate: Yup.date().default(() => new Date()),
  endDate: Yup.date().min(
    Yup.ref("startDate"),
    "End date can't be before Start date"
  ),
  controllercode: Yup.array().min(1, "Controller name is required"),
});

export default function Reportview() {
  let navigate = useNavigate();
  let userid = JSON.parse(GetCookieStorage("cookiedata")).user_id;
  let controllertype = JSON.parse(GetLocalStorage("contollertype"));

  const [ControllerList, setControllerList] = useState([]);
  const [loader, setloader] = useState(false);

  const { values, errors, touched, setValues, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        startDate: new Date(
          moment().subtract(7, "d").format("YYYY-MM-DD 00:00:00")
        ),
        endDate: new Date(),
        controllercode: [],
        fromtime: 1,
        totime: 1,
      },

      validationSchema: validate,
      onSubmit: (values) => {
        hanldeDownloadFile(values);
      },
    });

  const GetControllerDropdown = () => {
    setloader(true);
    let formdata = new FormData();
    formdata.append("controller_type", controllertype);
    controllerdropdown(formdata)
      .then(({ data }) => {
        let dubdata = data?.map((ele, ind) => {
          return { value: ele?.controller_id, label: ele?.controller_name };
        });
        setControllerList(dubdata);
      })
      .catch((err) => {})
      .finally(() => setloader(false));
  };

  const hanldeDownloadFile = (values) => {
    let controllerid = values.controllercode.map((id) => {
      return id?.value;
    });
    let checkstring = controllerid.toString();

    if (checkstring !== "") {
      setloader(true);
      let formData = new FormData();
      formData.append("user_id", userid);
      formData.append("controller_id", controllerid);
      formData.append(
        "from_date",
        moment(values.startDate).format("YYYY-MM-DD 00:00:00")
      );
      formData.append(
        "to_date",
        moment(values.endDate).format("YYYY-MM-DD 23:59:59")
      );
      formData.append("controller_type", controllertype);
      formData.append("report", 1);
      formData.append("from_date_format", values.fromtime);
      formData.append("to_date_format", values.totime);

      mailreport(formData)
        .then(({ data }) => {
          window.open(data?.reply);
          if (data?.status === 1) {
            // toast.success("success");
          } else if (data?.status === 0) {
            toast.error(data?.error);
          }
          setValues({ ...values, controllercode: [""] });
        })
        .catch((err) => {
          getCatchMsg(err);
        })
        .finally(() => setloader(false));
    } else {
      setValues({ ...values, controllercode: [] });
    }
  };

  const Navigatetodashboard = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    GetControllerDropdown();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      GetControllerDropdown();
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Loader isLoader={loader} />
      <div className={classes.router_pages}>
        <div className="pre-page">
          <FaArrowLeft
            className="arrow"
            onClick={() => Navigatetodashboard()}
          />
          <h3 className={classes.header}>Controller report</h3>
        </div>
        <div className={"d-flex gap-2 flex-wrap"}>
          <div className={classes.filterColums}>
            <label>
              From<span className="star">*</span>
            </label>
            <div className={classes.from_time_format}>
              <div>
                <CommonDateTimePicker
                  value={values?.startDate}
                  onChange={(date) => {
                    setValues({
                      ...values,
                      startDate: new Date(date),
                    });
                  }}
                  fromtodate={true}
                  formate={"DD-MM-YYYY"}
                  disableDate={true}
                  allowClear={false}
                  endDate={values.endDate}
                />

                {errors?.startDate && touched?.startDate ? (
                  <p className="inputerror">{errors?.startDate}</p>
                ) : null}
              </div>
              <div>
                <Form.Check
                  inline
                  label="AM"
                  name="time1"
                  type={"radio"}
                  checked={values.fromtime == 1 ? true : false}
                  onClick={() => {
                    setFieldValue("fromtime", 1);
                  }}
                />
                <Form.Check
                  inline
                  label="PM"
                  name="time1"
                  type={"radio"}
                  checked={values.fromtime == 2 ? true : false}
                  onClick={() => {
                    setFieldValue("fromtime", 2);
                  }}
                />
              </div>
            </div>
          </div>
          <div className={classes.filterColums}>
            <label>
              To<span className="star">*</span>
            </label>
            <div className={classes.from_time_format}>
              <div>
                <CommonDateTimePicker
                  value={values?.endDate}
                  onChange={(date) => {
                    setValues({
                      ...values,
                      endDate: new Date(date),
                    });
                  }}
                  formate={"DD-MM-YYYY"}
                  disableDate={true}
                  allowClear={false}
                  fromtodate={true}
                  startDate={values.startDate}
                />
                <br />
                {errors?.endDate && touched?.endDate ? (
                  <p className="inputerror">{errors?.endDate}</p>
                ) : null}
              </div>
              <div>
                <Form.Check
                  inline
                  label="AM"
                  name="time2"
                  type={"radio"}
                  checked={values.totime == 1 ? true : false}
                  onClick={() => {
                    setFieldValue("totime", 1);
                  }}
                />
                <Form.Check
                  inline
                  label="PM"
                  name="time2"
                  type={"radio"}
                  checked={values.totime == 2 ? true : false}
                  onClick={() => {
                    setFieldValue("totime", 2);
                  }}
                />
              </div>
            </div>
          </div>

          <div className={classes.filterColums}>
            <label>
              Controller Name<span className="star">*</span>
            </label>

            <Select
              closeMenuOnSelect={false}
              name="controllercode"
              id="controllercode"
              className={classes.filter_input}
              onChange={(e) => {
                setValues({ ...values, controllercode: e });
              }}
              isMulti
              options={ControllerList}
              value={values.controllercode}
            />
            {touched?.controllercode && errors?.controllercode ? (
              <p className="inputerror">{errors?.controllercode}</p>
            ) : null}
          </div>
        </div>
        <button
          type="submit"
          className="add-btn report_add_btn"
          onClick={handleSubmit}
        >
          Download
        </button>
      </div>
    </>
  );
}
