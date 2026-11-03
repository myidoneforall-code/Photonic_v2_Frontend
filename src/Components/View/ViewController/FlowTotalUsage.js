import { useFormik } from "formik";
import moment from "moment";
import React, { useEffect } from "react";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import { Form } from "react-bootstrap";
import motorstyle from "../ViewController/motorcontroller.module.css";
import commonstyle from "../../../Assets/css/CommonStyle.module.css";
import CommonDateTimePicker from "../../CommonComponents/CommonDatePicker";
import CommonSelect from "../../CommonComponents/CommonSelect";

const validate = yup.object().shape({
  startDate: yup.date().default(() => new Date()),
  endDate: yup
    .date()
    .min(yup.ref("startDate"), "End date can't be before Start date"),
  fromtime: yup.number().required(),
  totime: yup.number().required(),
});

export default function FlowTotalUsageTime({
  controllerdata,
  TotalUsage,
  TotalUsagecount,
  flowList,
}) {
  const { values, errors, touched, setValues, handleSubmit } = useFormik({
    initialValues: {
      startDate: new Date(
        moment().subtract(7, "d").format("YYYY-MM-DD HH:mm:ss")
      ),
      endDate: new Date(),
      fromtime: 1,
      totime: 1,
      device_id: "",
    },
    validationSchema: validate,
    onSubmit: (values) => {
      TotalUsage(
        values.startDate,
        values.endDate,
        values.fromtime,
        values.totime,
        flowList?.length > 0 && values.device_id
      );
    },
  });

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setValues({
  //       startDate: new Date(
  //         moment().subtract(7, "d").format("YYYY-MM-DD HH:mm:ss")
  //       ),
  //       endDate: new Date(),
  //       fromtime: 1,
  //       totime: 1,
  //     });
  //   }, 2 * 60000);
  // }, []);

  const getMultiDeviceCount = (type = "") => {
    const dataMap = {
      all: (ele) => [...ele?.valve_data, ...ele?.level_data, ...ele?.flow_data],
      tank: (ele) => ele?.level_data,
      flow: (ele) => ele?.flow_data,
      valve: (ele) => ele?.valve_data,
    };

    return controllerdata?.multi?.flatMap(dataMap[type] || (() => [])) || [];
  };
  return (
    <>
      {controllerdata?.flow_meter?.length > 0 ||
      getMultiDeviceCount("flow")?.length > 0 ? (
        <div
          className={`${motorstyle.all_details_div_bg} ${commonstyle.cards_border_radius}`}
        >
          <div className="flowtotalusegehead">
            <p className="controller valve-style">flow meter</p>
          </div>
          <div className="total_flow_datas datepadding">
            <div className="totalusagediv">
              <div className="from-to-date to-date">
                <label className="date-label">Device</label>
                <CommonSelect
                  onChange={(data, opt) => {
                    setValues({ ...values, device_id: data });
                  }}
                  allowClear={true}
                  value={values?.device_id}
                  options={flowList?.map((ele) => ({
                    ...ele,
                    label: ele?.device_name,
                    value: ele?.device_id,
                  }))}
                  placeholder={"Select Device"}
                  responsiveClassName={true}
                />
              </div>
              <div className="from-to-date">
                <label className="date-label">From</label>
                <div>
                  <CommonDateTimePicker
                    value={values?.startDate}
                    onChange={(date) => {
                      setValues({ ...values, startDate: new Date(date) });
                    }}
                    formate={"DD-MM-YYYY"}
                    disableDate={true}
                    isFuture={true}
                    allowClear={false}
                  />
                  {errors?.startDate && touched?.startDate ? (
                    <p className="inputerror">{errors?.startDate}</p>
                  ) : null}
                </div>

                <Form.Check
                  inline
                  label="AM"
                  name="group1"
                  type={"radio"}
                  checked={values.fromtime === 1 ? true : false}
                  onClick={() => {
                    setValues({ ...values, fromtime: 1 });
                  }}
                />
                <Form.Check
                  inline
                  label="PM"
                  name="group1"
                  type={"radio"}
                  checked={values.fromtime === 2 ? true : false}
                  onClick={() => {
                    setValues({ ...values, fromtime: 2 });
                  }}
                />
              </div>
              <div className="from-to-date to-date">
                <label className="date-label">To</label>
                <div>
                  <CommonDateTimePicker
                    value={values?.endDate}
                    onChange={(date) => {
                      setValues({ ...values, endDate: new Date(date) });
                    }}
                    formate={"DD-MM-YYYY"}
                    disableDate={true}
                    isFuture={true}
                    allowClear={false}
                  />

                  <br />
                  {errors?.endDate && touched?.endDate ? (
                    <p className="inputerror">{errors?.endDate}</p>
                  ) : null}
                </div>

                <Form.Check
                  inline
                  label="AM"
                  name="group2"
                  type={"radio"}
                  checked={values.totime === 1 ? true : false}
                  onClick={() => {
                    setValues({ ...values, totime: 1 });
                  }}
                />
                <Form.Check
                  inline
                  label="PM"
                  name="group2"
                  type={"radio"}
                  checked={values.totime === 2 ? true : false}
                  onClick={() => {
                    setValues({ ...values, totime: 2 });
                  }}
                />
              </div>

              <button type="button" className="add-btn" onClick={handleSubmit}>
                Submit
              </button>
            </div>
            {/* {controllerdata?.tank?.length > 0 &&
            controllerdata?.flow_meter?.length > 0 &&
            controllerdata?.valve?.length > 0 ? (
              <p className="flow_tot_usage">
                Total Usage: {TotalUsagecount} kL
              </p>
            ) : controllerdata?.tank?.length > 0 &&
              controllerdata?.flow_meter?.length > 0 ? (
              <p className="flow_tot_usage">
                Total Usage: {TotalUsagecount} kL
              </p>
            ) : controllerdata?.flow_meter?.length > 0 ? (
              <p className="flow_tot_usage">
                Total Usage: {TotalUsagecount} kL
              </p>
            ) : null} */}
            {controllerdata?.flow_meter?.length > 0 ||
            getMultiDeviceCount("flow")?.length > 0 ? (
              <p className="flow_tot_usage">
                Total Usages: {TotalUsagecount} kL
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
