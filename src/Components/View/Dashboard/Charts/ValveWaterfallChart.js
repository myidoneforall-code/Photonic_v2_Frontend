import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Scatter } from "react-chartjs-2";
import chartstyle from "../Charts/Chart.module.css";
import { devicechart } from "../../../../Service/ApiService";
import moment from "moment";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import * as Yup from "yup";
import { useFormik } from "formik";
import Loader from "../../../Loader";
import { toast } from "react-hot-toast";
import CommonDateTimePicker from "../../../CommonComponents/CommonDatePicker";
import CommonSelect from "../../../CommonComponents/CommonSelect";
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

const validate = Yup.object().shape({
  startDate: Yup.date().default(() => new Date()),
  endDate: Yup.date().min(
    Yup.ref("startDate"),
    "End date can't be before Start date"
  )
});

export default function ValveWaterfallChart({ valvechart, flowList }) {
  const [YAxisdata, setYAxisdata] = useState();
  const [XAxisdata, setXAxisdata] = useState();
  let [loader, setloader] = useState(false);
  let controllertype = parseInt(localStorage.getItem("contollertype"));
  let CurrentDate = moment(new Date()).format("YYYY-MM-DD 00:00:00");
  let BeforeSevenDays = moment(new Date())
    .subtract(7, "d")
    .format("YYYY-MM-DD 00:00:00");
  const { values, errors, touched, setValues, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        startDate: new Date(
          moment().subtract(7, "d").format("YYYY-MM-DD 00:00:00")
        ),
        endDate: new Date(),
        device_id: ""
      },
      validationSchema: validate,
      onSubmit: (values) => {
        valvedata();
      }
    });

  // useEffect(() => {
  //   valvedata();
  // }, [valvechart]);
  useEffect(() => {
    if (flowList?.[0]?.device_id) {
      setFieldValue("device_id", flowList[0].device_id);
    }
  }, [flowList, setFieldValue]);

  useEffect(() => {
    if (values?.device_id) {
      valvedata();
    }
  }, [values.device_id]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     valvedata();
  //     setValues({
  //       startDate: new Date(
  //         moment().subtract(7, "d").format("YYYY-MM-DD 00:00:00")
  //       ),
  //       endDate: new Date()
  //     });
  //   }, 2 * 60000);
  //   return () => clearInterval(interval);
  // }, []);
  useEffect(() => {
    console.log(values, "values123");

    const interval = setInterval(() => {
      valvedata();

      setValues({
        startDate: values?.startDate
          ? values.startDate
          : moment().subtract(7, "d").startOf("day").toDate().toISOString(),
        endDate: values?.endDate ? values.endDate : new Date().toISOString()
      });
    }, 2 * 60000);

    return () => clearInterval(interval);
  }, []);

  const valvedata = () => {
    setloader(true);
    let ValveformData = new FormData();
    ValveformData.append("controller_id", valvechart);
    ValveformData.append(
      "from_date",
      moment(values.startDate).format("YYYY-MM-DD HH:mm:ss")
        ? moment(values.startDate).format("YYYY-MM-DD HH:mm:ss")
        : BeforeSevenDays
    );
    ValveformData.append(
      "device_id",
      values?.device_id ? values?.device_id : ""
    );
    ValveformData.append(
      "to_date",
      moment(values.endDate).format("YYYY-MM-DD HH:mm:ss")
        ? moment(values.endDate).format("YYYY-MM-DD HH:mm:ss")
        : CurrentDate
    );
    ValveformData.append("device_type", controllertype === 1 ? 3 : 4);

    devicechart(ValveformData)
      .then(({ data }) => {
        if (controllertype === 1) {
          let plottingpoint = data?.data?.map((m) => {
            let dub = m?.valve_data?.map((k) => {
              return {
                x: moment(k?.datetime, "DD-MM-yyyy HH:mm:ss").format(
                  "yyyy-MM-DD HH:mm:ss"
                ),
                y: parseInt(k?.datetime.split(" ")[1])
              };
            });
            dub.push({ y: 24 });
            return {
              label: m?.device_dt?.device_name,
              data: dub,
              backgroundColor: m?.valve_data?.map((s) => {
                return s?.valve_status === 0 ? "#ff0018c7" : "#0bf319d1";
              }),
              borderColor: "orange",
              pointRadius: 8,
              pointHoverRadius: 9
            };
          });
          setYAxisdata(plottingpoint);
        } else {
          let plottingpoint = data?.data?.map((m) => {
            let dub = m?.light_data?.map((k) => {
              return {
                x: moment(k?.datetime, "DD-MM-yyyy HH:mm:ss").format(
                  "yyyy-MM-DD HH:mm:ss"
                ),
                y: parseInt(k?.datetime.split(" ")[1])

                // x: moment(k?.datetime, "DD-mm-yyyy HH:mm:ss").format(
                //   "YYYY-DD-MM HH:mm:ss"
                // ),
                // y: parseInt(moment(k?.datetime).format("HH:mm:ss").split(":")),
              };
            });
            dub.push({ y: 24 });
            return {
              label: m?.device_dt?.device_name,
              data: dub,
              backgroundColor: m?.light_data?.map((s) => {
                return s?.light_status === 0 ? "#ff0018c7" : "#0bf319d1";
              }),
              borderColor: "orange",
              pointRadius: 8,
              pointHoverRadius: 9
            };
          });
          setYAxisdata(plottingpoint);
        }
      })
      .catch((err) => {
        if (err?.response?.data?.detail?.[0]?.msg) {
          toast(err?.response?.data?.detail?.[0]?.msg, { type: "error" });
        } else if (err?.response?.data?.detail) {
          toast(err?.response?.data?.detail, { type: "error" });
        } else {
          toast("Something went wrong!!", { type: "error" });
        }
      })
      .finally(() => setloader(false));
  };

  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };
  console.log(flowList, valvechart, "ValveChart");

  return (
    <>
      <Loader isLoader={loader} />
      {YAxisdata ? (
        <div className={chartstyle.chartbackground}>
          <div className={chartstyle.chartdivflex}>
            <div className={chartstyle.date_div}>
              {/* <div className="Dates"> */}
              <div className="from_to_date">
                <label className={chartstyle.date_chart}>Device</label>
                <div>
                  <CommonSelect
                    onChange={(data, opt) => {
                      setValues({ ...values, device_id: data });
                    }}
                    allowClear={true}
                    value={values?.device_id}
                    options={flowList?.map((ele) => ({
                      ...ele,
                      label: ele?.device_name,
                      value: ele?.device_id
                    }))}
                    placeholder={"Select Device"}
                    responsiveClassName={true}
                  />
                </div>
              </div>
              <div className="from_to_date">
                <label className={chartstyle.date_chart}>From</label>
                <div>
                  <CommonDateTimePicker
                    value={values?.startDate}
                    onChange={(date) => {
                      setValues({
                        ...values,
                        startDate: new Date(date)
                      });
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
              </div>
              <div className="from_to_date">
                <label className={chartstyle.date_chart}>To</label>
                <div className={chartstyle.chart_to_date_error_width}>
                  <CommonDateTimePicker
                    value={values?.endDate}
                    onChange={(date) => {
                      setValues({
                        ...values,
                        endDate: new Date(date)
                      });
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
              </div>
              {/* </div> */}
            </div>
            <button
              type="submit"
              className={chartstyle.submitbuttom}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
          <Scatter
            data={{
              datasets: YAxisdata
            }}
            options={{
              plugins: {
                decimation: {
                  enabled: true,
                  algorithm: "lttb", // 'lttb' (largest triangle three buckets) preserves trends
                  samples: 2000 // max number of points to keep visible
                },
                zoom: {
                  zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: "x"
                  },
                  pan: {
                    enabled: true,
                    mode: "x"
                  }
                },
                title: {
                  display: true,
                  text: controllertype === 1 ? "Valve" : "Light",
                  font: { size: 20 }
                }
              },
              responsive: true,
              scales: {
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: "Date",
                    font: { size: 20 },
                    color: "green"
                  },
                  type: "time",

                  time: {
                    displayFormats: {
                      day: "dd-MM-yyyy"
                    },
                    unit: "day"
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: "Time",
                    font: { size: 20 },
                    color: "green"
                  },

                  // type: "time",

                  // time: {
                  //   displayFormats: {
                  //     hour: "HH:mm:ss",
                  //   },
                  //   unit: "hour",
                  // },
                  stacked: true
                }
              }
            }}
          />
        </div>
      ) : null}
    </>
  );
}
