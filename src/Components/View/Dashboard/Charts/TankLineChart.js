import React, { useEffect, useState } from "react";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { devicechart } from "../../../../Service/ApiService";
import chartstyle from "../Charts/Chart.module.css";
import moment from "moment";
import * as Yup from "yup";
import { useFormik } from "formik";
import Loader from "../../../Loader";
import { toast } from "react-hot-toast";
import CommonDateTimePicker from "../../../CommonComponents/CommonDatePicker";
import CommonSelect from "../../../CommonComponents/CommonSelect";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

const validate = Yup.object().shape({
  startDate: Yup.date().default(() => new Date()),
  endDate: Yup.date().min(
    Yup.ref("startDate"),
    "End date can't be before Start date"
  )
});

export default function TankLineChart({ tankchart, flowList }) {
  const [YAxisdata, setYAxisdata] = useState();
  const [XAxisdata, setXAxisdata] = useState([]);
  const [dataId, setDataID] = useState([]);
  const [datasetList, setDatasetList] = useState([]);
  const [dubdata, setdubdata] = useState();
  let [loader, setloader] = useState(false);
  const [DeviceData, setDeviceData] = useState([]);
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
        tankdata();
      }
    });

  useEffect(() => {
    if (flowList?.[0]?.device_id) {
      setFieldValue("device_id", flowList[0].device_id);
    }
  }, [flowList, setFieldValue]);

  useEffect(() => {
    if (values?.device_id) {
      tankdata();
    }
  }, [values.device_id]);

  // useEffect(() => {
  //   console.log(values, "values123");
  //   const interval = setInterval(() => {
  //     tankdata();

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
    console.log(values, "values123");

    const interval = setInterval(() => {
      tankdata();

      setValues({
        startDate: values?.startDate
          ? values.startDate
          : moment().subtract(7, "d").startOf("day").toDate().toISOString(),
        endDate: values?.endDate ? values.endDate : new Date().toISOString()
      });
    }, 2 * 60000);

    return () => clearInterval(interval);
  }, []);

  const tankdata = () => {
    setloader(true);
    let TankformData = new FormData();
    TankformData.append("controller_id", tankchart);
    TankformData.append("device_id", values?.device_id ?? "");
    TankformData.append(
      "from_date",
      moment(values.startDate).format("YYYY-MM-DD HH:mm:ss")
        ? moment(values.startDate).format("YYYY-MM-DD HH:mm:ss")
        : BeforeSevenDays
    );
    TankformData.append(
      "to_date",
      moment(values.endDate).format("YYYY-MM-DD HH:mm:ss")
        ? moment(values.endDate).format("YYYY-MM-DD HH:mm:ss")
        : CurrentDate
    );
    TankformData.append("device_type", 1);
    devicechart(TankformData)
      .then(({ data }) => {
        setDeviceData(data);

        if (data && data?.data?.length > 0) {
          let XAxis = data?.data?.map((xdata) => {
            let dataTwo = xdata?.tank_data?.map((k) => {
              return k.datetime;
            });
            return dataTwo;
          });
          let dataId = data?.data?.map((xdata) => {
            let dataIdTwo = xdata?.tank_data?.map((k) => {
              return k.data_id;
            });
            return dataIdTwo;
          });
          if (dataId?.length > 0) {
            setDataID(dataId.flat());
          } else {
            setDataID(dataId);
          }

          // setXAxisdata(XAxis?.flat());
          if (XAxis?.length > 0) {
            setXAxisdata(XAxis.flat());
          } else {
            setXAxisdata(XAxis);
          }
          setdubdata(data);
          let YAxis = data?.data?.map((ydata, index) => {
            let dataOne = ydata?.tank_data?.map((tlevel) => {
              return tlevel?.tank_level;
            });
            return {
              data: dataOne,
              label: ydata?.device_dt?.device_name,
              borderColor:
                index < 10
                  ? `rgba(255, 99, ${index}9${index},0.8)`
                  : `rgba(${index}2, ${index} , ${index}9,0.8)`,

              backgroundColor:
                index < 10
                  ? `rgb(${index}${index}${index} 5 58 / 50%)`
                  : `rgb(${index}2 5 58 / 50%)`,
              // borderWidth: 4,
              pointRadius: 3,
              pointHoverRadius: 7
              // borderColor: `#a8${index}cc${index}`,
              // backgroundColor: `#${index}af10${index}`,
            };
          });
          setYAxisdata(YAxis);
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

  useEffect(() => {
    if (DeviceData && DeviceData?.data?.length > 0) {
      setDatasetList(
        DeviceData?.data?.map((ele, ind) => {
          return {
            label: ele?.device_dt?.device_name,
            value: 300,
            backgroundColor: "transparent",
            borderColor: `rgba(${ind * 100},99,150,0.5)`,
            borderWidth: 2,
            lineTension: 0.1,
            fill: true,
            // data: [20, 30, 40, 70, 100],
            data: handleDeviceData()?.[ind]
          };
        })
      );
    } else {
      setDatasetList([]);
    }
  }, [DeviceData]);

  const handleDeviceData = () => {
    let labels = XAxisdata;
    let FirstDevice = DeviceData?.data?.[0]?.tank_data?.map((ele) => {
      return ele;
    });
    let SecondDevice = DeviceData?.data?.[1]?.tank_data?.map((ele) => {
      return ele;
    });
    let finalarr = [FirstDevice, SecondDevice];

    var finalArray = [[], []];
    dataId.map((ele) => {
      let count = 0;
      finalarr.map((element, index) => {
        // let findData = element?.find((item) => item.datetime === ele);
        let findData = element?.find((item) => item?.data_id === ele);

        if (findData) {
          finalArray[count].push(findData?.tank_level);
          count = count + 1;
          return findData?.tank_level;
        } else {
          finalArray[count].push(0);
          count = count + 1;
          return 0;
        }
      });
    });

    return finalArray;
  };

  const checkinsData = {
    labels: XAxisdata,
    datasets: datasetList
    // [
    //   {
    //     label: DeviceData?.data?.[0]?.device_dt?.device_name,
    //     value: 300,
    //     backgroundColor: "transparent",
    //     borderColor: "rgba(255,99,150,0.5)",
    //     borderWidth: 2,
    //     lineTension: 0.1,

    //     fill: true,
    //     // data: [20, 30, 40, 70, 100],
    //     data: handleDeviceData()?.[0],
    //   },
    //   {
    //     label: DeviceData?.data?.[1]?.device_dt?.device_name,
    //     backgroundColor: "transparent",
    //     borderColor: "rgba(77,99,150,0.5)",
    //     borderWidth: 2,
    //     fill: true,
    //     value: 20,
    //     labels: 20,
    //     // data: [60, 40],
    //     data: handleDeviceData()?.[1],
    //   },
    // ],
  };

  const singledevice = {
    labels: XAxisdata,
    datasets: [
      {
        label: DeviceData?.data?.[0]?.device_dt?.device_name,
        value: 300,
        backgroundColor: "transparent",
        borderColor: "rgba(255,99,150,0.5)",
        borderWidth: 2,
        lineTension: 0.1,
        fill: true,
        data: handleDeviceData()?.[0]
      }
      // {
      //   label: "High Limit",
      //   data: new Array(DeviceData?.data?.[0]?.tank_data.length)
      //     .fill(null)
      //     .map((ele, ind) =>
      //       ind === 0
      //         ? DeviceData?.data?.[0]?.tank_data?.[0]?.high_limit
      //         : ind === DeviceData?.data?.[0]?.tank_data.length - 1
      //         ? DeviceData?.data?.[0]?.tank_data?.pop()?.high_limit
      //         : null
      //     ),
      //   borderColor: "#D32F2F",
      //   borderWidth: 2,
      //   fill: false,
      //   spanGaps: true, // Draws a straight line between first and last point
      // },
      // {
      //   label: "Low Limit",
      //   data: new Array(DeviceData?.data?.[0]?.tank_data.length)
      //     .fill(null)
      //     .map((ele, ind) =>
      //       ind === 0
      //         ? DeviceData?.data?.[0]?.tank_data?.[0]?.low_limit
      //         : ind === DeviceData?.data?.[0]?.tank_data.length - 1
      //         ? DeviceData?.data?.[0]?.tank_data?.pop()?.low_limit
      //         : null
      //     ),
      //   borderColor: "#81C784",
      //   borderWidth: 2,
      //   fill: false,
      //   spanGaps: true, // Draws a straight line between first and last point
      // },
    ]
  };

  const avoidletters = (letters) => {
    var ch = String.fromCharCode(letters.which);
    if (!/[0-9]/.test(ch)) {
      letters.preventDefault();
    }
  };
  // Extract limits from DeviceData (you can adjust the index if needed)
  const highLimit = DeviceData?.data?.[0]?.overall_high_limit ?? null;
  const lowLimit = DeviceData?.data?.[0]?.overall_low_limit ?? null;

  // Prepare High Limit dataset
  const highLimitDataset =
    highLimit !== null
      ? {
          label: "Overall High Limit",
          data: checkinsData.labels.map(() => highLimit),
          borderColor: "rgba(255, 0, 0, 0.8)", // Red
          borderWidth: 3,
          // borderDash: [8, 4], // Dashed line
          pointRadius: 0,
          fill: false
        }
      : null;

  // Prepare Low Limit dataset
  const lowLimitDataset =
    lowLimit !== null
      ? {
          label: "Overall Low Limit",
          data: checkinsData.labels.map(() => lowLimit),
          borderColor: "rgba(0, 128, 0, 0.8)",
          borderWidth: 3,
          // borderDash: [8, 4], // Dashed line
          pointRadius: 0,
          fill: false
        }
      : null;

  // Combine all datasets
  const finalDatasets = [
    ...checkinsData.datasets,
    ...(highLimitDataset ? [highLimitDataset] : []),
    ...(lowLimitDataset ? [lowLimitDataset] : [])
  ];

  // Final data object to pass to chart
  const finalData = {
    labels: checkinsData.labels,
    datasets: finalDatasets
  };

  console.log(values, tankchart, flowList, "dataid12341");

  return (
    <>
      <Loader isLoader={loader} />
      {XAxisdata && YAxisdata ? (
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
          <Line
            // data={{
            //   labels: XAxisdata,
            //   datasets: YAxisdata,
            // }}

            data={
              DeviceData?.data?.length > 0
                ? // ? DeviceData?.data?.[1]?.device_dt?.device_name !== undefined
                  finalData
                : // : singledevice
                  []
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
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      let dataset = context.dataset;
                      let index = context.dataIndex;
                      let value = dataset.data[index];

                      // Extract High & Low limits
                      let highLimit =
                        DeviceData?.data?.[0]?.tank_data?.[index]?.high_limit;
                      let lowLimit =
                        DeviceData?.data?.[0]?.tank_data?.[index]?.low_limit;

                      let labels = [`${dataset.label}: ${value}`];

                      // Add high & low limits as separate lines
                      // if (highLimit !== undefined && lowLimit !== undefined) {
                      //   labels.push(`High Limit: ${highLimit}`);
                      //   labels.push(`Low Limit: ${lowLimit}`);
                      // }

                      return labels;
                    },
                    labelColor: function (context) {
                      return {
                        borderColor: context.dataset.borderColor,
                        backgroundColor: context.dataset.borderColor // Tooltip color matches dataset color
                      };
                    }
                  }
                },
                legend: {
                  display: true,
                  position: "top"
                  // align: "left",
                },
                title: {
                  display: true,
                  text: "Tank Device Level",
                  font: { size: 20 }
                }
              },
              scales: {
                x: {
                  grid: { display: true },

                  title: {
                    display: true,
                    text: "Date and Time",
                    font: { size: 20 },
                    color: "green"
                  }
                },
                y: {
                  grid: { display: true },

                  title: {
                    display: true,
                    text: "Tank Level",
                    font: { size: 20 },
                    color: "green"
                  }
                }
              }
            }}
          />
        </div>
      ) : null}
    </>
  );
}
