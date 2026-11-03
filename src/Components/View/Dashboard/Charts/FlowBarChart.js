import React, { useEffect, useRef, useState } from "react";
// import ChartDataLabels from "chartjs-plugin-datalabels";

import {
  Bar,
  Chart,
  getDatasetAtEvent,
  getElementAtEvent,
  getElementsAtEvent
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { devicechart } from "../../../../Service/ApiService";
import chartstyle from "../Charts/Chart.module.css";
import zoomPlugin from "chartjs-plugin-zoom";
import { current } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import moment from "moment";
import DatePicker from "react-datepicker";
import * as Yup from "yup";
import { useFormik } from "formik";
import Loader from "../../../Loader";
import { toast } from "react-hot-toast";
import CommonDateTimePicker from "../../../CommonComponents/CommonDatePicker";
import CommonSelect from "../../../CommonComponents/CommonSelect";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const validate = Yup.object().shape({
  startDate: Yup.date().default(() => new Date()),
  endDate: Yup.date().min(
    Yup.ref("startDate"),
    "End date can't be before Start date"
  )
});

export default function FlowBarChart({ flowchart, flowList }) {
  const chartRef = useRef(null);
  const [YAxisdata, setYAxisdata] = useState();
  const [XAxisdata, setXAxisdata] = useState([]);
  const [test, setTest] = useState([]);
  let [loader, setloader] = useState(false);
  const [ChartLabel, setChartLabel] = useState();
  const [DeviceData, setDeviceData] = useState([]);
  const [datasetList, setDatasetList] = useState([]);
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
        flowdata();
      }
    });
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     flowdata();
  //     setValues({
  //       startDate: values?.startDate
  //         ? values?.startDate
  //         : new Date(moment().subtract(7, "d").format("YYYY-MM-DD 00:00:00")),
  //       endDate: values?.endDate ? values?.endDate : new Date()
  //     });
  //   }, 2 * 60000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    // flowList is rebuilt as a brand-new array on every parent render (a
    // fresh spread each time), so this effect re-fires far more often than
    // the flow list actually changes — the `!values.device_id` guard stops
    // it from snapping the dropdown back to Flow 1 every time that happens
    // after the user has already picked a different device.
    if (flowList?.[0]?.device_id && !values.device_id) {
      setFieldValue("device_id", flowList[0].device_id);
    }
  }, [flowList, setFieldValue]);

  useEffect(() => {
    if (values?.device_id) {
      flowdata();
    }
  }, [values.device_id]);

  useEffect(() => {
    if (DeviceData?.data?.length > 0) {
      setDatasetList(
        DeviceData?.data?.map((ele, ind) => {
          return {
            label: ele?.device_dt?.device_name,
            value: 300,
            backgroundColor: `rgba(${ind * 100},99,50,0.5)`,
            borderColor: "#333",
            borderWidth: 0.1,
            lineTension: 0.1,
            barThickness: 70,
            fill: true,
            data: daydata()?.[ind]
          };
        })
      );
    }
  }, [DeviceData]);

  const flowdata = () => {
    setloader(true);

    let FlowformData = new FormData();
    FlowformData.append("controller_id", flowchart);
    FlowformData.append(
      "device_id",
      values?.device_id ? values?.device_id : ""
    );
    FlowformData.append(
      "from_date",
      moment(values.startDate).format("YYYY-MM-DD HH:mm:ss")
        ? moment(values.startDate).format("YYYY-MM-DD HH:mm:ss")
        : BeforeSevenDays
    );
    FlowformData.append(
      "to_date",
      moment(values.endDate).format("YYYY-MM-DD HH:mm:ss")
        ? moment(values.endDate).format("YYYY-MM-DD HH:mm:ss")
        : CurrentDate
    );
    FlowformData.append("device_type", 2);
    devicechart(FlowformData)
      .then(({ data }) => {
        setDeviceData(data);
        // const deviceOne = data?.data[0].flow_data.map((ele) => {
        //   return ele;
        // });
        // const deviceTwo = data?.data[1].flow_data.map((ele) => {
        //   return ele;
        // });

        // let finalRes = [];
        // data?.data?.map((ele) => {
        //   finalRes.push(ele?.flow_data);
        // });
        // setTest(finalRes?.flat());
        // const finalArray = test.map((ele) => {
        //   return ele?.tot_consumption;
        // });

        let YAxis = data?.data?.map((ydata, index) => {
          let dataOne = ydata?.flow_data?.map((consum) => {
            return consum?.tot_consumption;
            // return consum;
          });

          return {
            label: ydata?.device_dt?.device_name,
            data: dataOne,
            backgroundColor:
              index < 10
                ? `rgba(255, 99, ${index}2${index}, 0.5)`
                : `rgba(255, 99, ${index}2, 0.5)`,
            borderWidth: 0.1,
            barThickness: 70,
            borderColor: "yellow"
          };
        });

        setYAxisdata(YAxis.flat());
        let XAxis = data?.data?.map((xdata) => {
          let dataTwo = xdata?.flow_data?.map((fdate) => {
            return fdate?.date;
          });
          return dataTwo;
        });

        if (XAxis?.length > 0) {
          setXAxisdata(XAxis.flat());
        } else {
          setXAxisdata(XAxis);
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

  // flowdataRef always points at the latest render's flowdata() (which
  // closes over the current `values`) — the interval below is set up once
  // ([] deps) so without this ref it would keep calling the very first
  // render's flowdata() forever, silently re-fetching the page-load date
  // range/device even after the user picks a different one and submits.
  const flowdataRef = useRef(flowdata);
  useEffect(() => {
    flowdataRef.current = flowdata;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      flowdataRef.current();
    }, 2 * 60000);

    return () => clearInterval(interval);
  }, []);

  // const onClick = (event) => {
  //   setChartLabel(chartRef?.current._metasets);
  // };
  const daydata = () => {
    let labels = XAxisdata;
    let deviceOne = DeviceData?.data?.[0]?.flow_data.map((ele) => {
      return ele;
    });
    let deviceTwo = DeviceData?.data?.[1]?.flow_data.map((ele) => {
      return ele;
    });
    let finalarr = [deviceOne, deviceTwo];
    var finalArray = [[], []];
    labels.map((ele, ind) => {
      let count = 0;
      finalarr.map((elem) => {
        let findData = elem?.find((item) => item.date === ele);
        if (findData) {
          finalArray[count].push(findData?.tot_consumption);
          count = count + 1;
          return findData.tot_consumption;
        } else {
          finalArray[count].push(0);
          count = count + 1;
          return 0;
        }
      });
    });
    return finalArray;
  };
  daydata();
  const checkinsData = {
    labels: XAxisdata,
    datasets: datasetList
    // [
    //   {
    //     label: DeviceData?.data?.[0]?.device_dt?.device_name,
    //     value: 300,
    //     backgroundColor: "rgba(255,99,50,0.5)",
    //     borderColor: "#333",
    //     borderWidth: 0.1,
    //     lineTension: 0.1,
    //     barThickness: 70,
    //     fill: true,
    //     data: daydata()?.[0],
    //   },
    //   {
    //     label: DeviceData?.data?.[1]?.device_dt?.device_name,
    //     backgroundColor: "rgba(255,99,150,0.5)",
    //     borderColor: "#000",
    //     borderWidth: 0.1,
    //     lineTension: 0.1,
    //     barThickness: 70,
    //     fill: true,
    //     value: 20,
    //     labels: 20,
    //     data: daydata()?.[1],
    //   },
    // ],
  };
  const SingleDevice = {
    labels: XAxisdata,
    datasets: [
      {
        label: DeviceData?.data?.[0]?.device_dt?.device_name,
        value: 300,
        backgroundColor: "rgba(255,99,50,0.5)",
        borderColor: "#333",
        borderWidth: 0.1,
        lineTension: 0.1,
        barThickness: 70,
        fill: true,
        data: daydata()?.[0]
      }
    ]
  };
  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };

  return (
    <>
      <Loader isLoader={loader} />

      {XAxisdata && YAxisdata ? (
        <div className={chartstyle.chartbackground}>
          <div className={chartstyle.chartdivflex}>
            <div className={chartstyle.date_div}>
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
            </div>
            <button
              type="submit"
              className={chartstyle.submitbuttom}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
          <Bar
            ref={chartRef}
            // data={checkinsData}
            data={
              DeviceData?.data?.[1]?.device_dt?.device_name !== undefined
                ? checkinsData
                : SingleDevice
            }
            options={{
              responsive: true,
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
                legend: {
                  display: true,
                  position: "top" // optional
                },
                title: {
                  display: true,
                  text: "Flow Chart",
                  font: {
                    size: 20
                  }
                  // color: "black" // optional
                }
              },
              scales: {
                x: {
                  // stacked: true,
                  // grid: { display: true },
                  title: {
                    display: true,
                    text: "Date",
                    font: { size: 20 },
                    color: "green"
                  }
                },
                y: {
                  // grid: { display: true },
                  // stacked: true,
                  title: {
                    display: true,
                    text: "Flow Consumption",
                    font: { size: 20 },
                    color: "green"
                  }
                }
              }
            }}
            // onClick={onClick}
            // ref={chartRef}
            // onClick={onClick}
            // data={{
            //   labels: XAxisdata,
            //   datasets: YAxisdata,
            // }}
            // options={{
            //   responsive: true,
            //   plugins: {
            //     legend: {
            //       display: true,
            //       // position: 'top',
            //     },
            //     title: {
            //       display: true,
            //       text: "Flow Device",
            //       font: { size: 20 },
            //     },
            //   },

            //   scales: {
            //     x: {
            //       stacked: true,
            //       grid: { display: true },
            //       title: {
            //         display: true,
            //         text: "Date",
            //         font: { size: 20 },
            //       },
            //     },
            //     y: {
            //       grid: { display: true },
            //       stacked: true,
            //       title: {
            //         display: true,
            //         text: "Flow Consumption",
            //         font: { size: 20 },
            //       },
            //     },
            //   },
            // }}
          />
        </div>
      ) : null}
    </>
  );
}
