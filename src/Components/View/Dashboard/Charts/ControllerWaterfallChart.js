import { viewcontrollerchart } from "../../../../Service/ApiService";
import React, { useEffect, useState } from "react";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import chartstyle from "../Charts/Chart.module.css";
import { devicechart } from "../../../../Service/ApiService";
import moment from "moment";
import DatePicker from "react-datepicker";
import * as Yup from "yup";
import { useFormik } from "formik";

import "chartjs-adapter-date-fns";
import { useSelector } from "react-redux";
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

export default function ControllerWaterfallChart({ controllerchart }) {
  let controllertype = parseInt(localStorage.getItem("contollertype"));
  const [YAxisdata, setYAxisdata] = useState();
  const [PointColor, setPointColor] = useState();
  let [loader, setloader] = useState(false);
  let CurrentDate = moment(new Date()).format("YYYY-MM-DD 00:00:00");
  let BeforeSevenDays = moment(new Date())
    .subtract(7, "d")
    .format("YYYY-MM-DD 00:00:00");

  const { values, errors, touched, setValues, handleSubmit } = useFormik({
    initialValues: {
      startDate: new Date(
        moment().subtract(7, "d").format("YYYY-MM-DD 00:00:00")
      ),
      endDate: new Date()
    },
    validationSchema: validate,
    onSubmit: (values) => {
      tankdata();
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      tankdata();
      setValues({
        startDate: values?.startDate
          ? values?.startDate
          : new Date(moment().subtract(7, "d").format("YYYY-MM-DD 00:00:00")),
        endDate: values?.endDate ? values?.endDate : new Date()
      });
    }, 2 * 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // controllerchart is a fresh {id, con_name} object literal from the
    // parent on every render (including its ~4s silent background poll),
    // so depending on the whole object re-ran this fetch (and its loading
    // spinner) every few seconds. Only controllerchart?.id is actually
    // used to build the request below — depend on that primitive instead.
    tankdata();
  }, [controllerchart?.id]);

  const tankdata = () => {
    setloader(true);
    let ConformData = new FormData();
    ConformData.append("controller_id", controllerchart?.id);
    ConformData.append(
      "from_date",
      moment(values.startDate).format("YYYY-MM-DD HH:mm:ss")
        ? moment(values.startDate).format("YYYY-MM-DD HH:mm:ss")
        : BeforeSevenDays
    );
    ConformData.append(
      "to_date",
      moment(values.endDate).format("YYYY-MM-DD HH:mm:ss")
        ? moment(values.endDate).format("YYYY-MM-DD HH:mm:ss")
        : CurrentDate
    );
    ConformData.append("controller_type", controllertype);

    viewcontrollerchart(ConformData)
      .then(({ data }) => {
        let Xaxis = data?.controller_data?.map((xdata) => {
          return {
            x: moment(xdata?.datetime, "DD-MM-yyyy HH:mm:ss").format(
              "yyyy-MM-DD HH:mm:ss"
            ),
            y: parseInt(xdata?.datetime.split(" ")[1])
            // x: moment(xdata?.datetime, "DD-mm-yyyy HH:mm:ss").format(
            //   "YYYY-DD-MM HH:mm:ss"
            // ),
            // y: parseInt(moment(xdata?.datetime).format("HH:mm:ss").split(":"))
          };
        });
        Xaxis.push({
          y: 24
        });
        setYAxisdata(Xaxis);

        let pointcolor = data?.controller_data?.map((xdata) => {
          return xdata?.controller_status === 0 ? "#ff0018c7" : "#0bf319d1";
        });
        setPointColor(pointcolor);
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

  return (
    <>
      {YAxisdata ? (
        <div className={chartstyle.chartbackground}>
          <div className={chartstyle.chartdivflex}>
            <div className={chartstyle.date_div}>
              <div className="from_to_date">
                <label className={chartstyle.date_chart}>From</label>
                <div>
                  <CommonDateTimePicker
                    value={values.startDate}
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
                    value={values.endDate}
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

                  {errors?.endDate && touched?.endDate ? (
                    <p className="inputerror">{errors?.endDate}</p>
                  ) : null}
                </div>
              </div>
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
              // datasets: YAxisdata,
              datasets: [
                {
                  label: controllerchart?.con_name,
                  data: YAxisdata,
                  backgroundColor: PointColor,
                  pointRadius: 8,
                  pointHoverRadius: 9
                }
              ]
            }}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: "Controller",
                  font: { size: 20 }
                },
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
