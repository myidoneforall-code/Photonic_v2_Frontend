import React, { useState, useMemo, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Col, Row } from "reactstrap";
import CommonSelect from "../../../CommonComponents/CommonSelect";
import { useFormik } from "formik";
import { controllerdropdown } from "../../../../Service/ApiService";
import { getCatchMsg } from "../../../../Utilities/Methods";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getCookie } from "../../../../Utilities/Cookie";

const PumpRuntimeChart = ({ onPressData, data, title, controllerDropDown }) => {
  const [timeRange, setTimeRange] = useState("week");
  const token = JSON.parse(getCookie("cookiedata"))?.access_token;
  // const [controllerDropDown, setControllerDropDown] = useState([]);
  const { LoginUserData } = useSelector((state) => state);
  const [loader, setLoader] = useState(false);
  const { values, setFieldValue } = useFormik({
    initialValues: {
      device_id: null
    }
  });
  const handleButtonClick = (range, period_type) => {
    console.log(values?.device_id, "sdfdsf");
    if (values?.device_id) {
      setTimeRange(range);
      onPressData(period_type, values?.device_id);
    } else {
      toast.error("Please select device");
    }
  };

  console.log(data, "Sdfsdfdsfs");

  // 🔹 Transform API data into ApexChart format
  // const chartData = useMemo(() => {
  //   if (!data?.aggregated_data) return { series: [], categories: [] };

  //   return {
  //     series: [
  //       {
  //         name: "Runtime (Hours)",
  //         type: "column",
  //         data: data.aggregated_data.map((item) =>
  //           (item.runtime_hours / 3600).toFixed(2)
  //         ),
  //       },
  //       {
  //         name: "Cycles",
  //         type: "line",
  //         data: data.aggregated_data.map((item) => item.cycles),
  //       },
  //     ],
  //     categories: data.aggregated_data.map((item) => item.period),
  //   };
  // }, [data]);
  const shortenWeekday = (day) => {
    const map = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun"
    };
    return map[day] || day;
  };

  const chartData = useMemo(() => {
    if (!data?.aggregated_data) return { series: [], categories: [] };

    return {
      series: [
        {
          name: `${
            timeRange === "daily" ? "Runtime (Minutes)" : "Runtime (Hours)"
          }`,
          type: "column",
          data: data.aggregated_data.map((item) =>
            Number(item.runtime_hours).toFixed(2)
          )
        },
        {
          name: "Cycles",
          type: "line",
          data: data.aggregated_data.map((item) => item.cycles)
        }
      ],
      categories: data.aggregated_data.map((item) =>
        shortenWeekday(item.period)
      )
    };
  }, [data]);

  const chartOptions = {
    chart: {
      height: 350,
      toolbar: { show: false },
      animations: { enabled: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "60%",
        dataLabels: { position: "top" }
      }
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0], // only show labels on the bar series (runtime)
      formatter(val) {
        return `${val} ${timeRange === "daily" ? "m" : "h"}`;
      },
      offsetY: -20,
      style: { fontSize: "11px", colors: ["#304758"] }
    },
    stroke: { width: [0, 3] }, // 0 for bar, 3 for line
    series: chartData.series,
    colors: ["#84D6F7", "#FAA0A0"], // first (bar) = blue, second (line) = red
    fill: {
      type: ["gradient", "solid"], // gradient for bar, solid for line
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: ["#C8F1FF"],
        inverseColors: false,
        opacityFrom: 0.9,
        opacityTo: 0.4,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: chartData.categories,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: { style: { fontSize: "11px", colors: "#14B0F0" } },
      title: {
        text:
          timeRange === "daily"
            ? "Time"
            : timeRange === "week"
            ? "Days (Weekly)"
            : "Days (Monthly)",
        style: { fontSize: "12px", fontWeight: "bold", color: "#333" }
      }
    },
    yaxis: [
      {
        seriesName: `${
          timeRange === "daily" ? "Runtime (Minutes)" : "Runtime (Hours)"
        }`,
        min: 0,
        tickAmount: 5,
        title: {
          text: `${
            timeRange === "daily" ? "Runtime (Minutes)" : "Runtime (Hours)"
          }`,
          style: { fontSize: "12px", fontWeight: "bold", color: "#176BA0" }
        },
        labels: {
          formatter(val) {
            return `${val} ${timeRange === "daily" ? "m" : "h"}`;
          },
          style: { colors: "#176BA0" }
        }
      },
      {
        seriesName: "Cycles",
        opposite: true,
        min: 0,
        tickAmount: 5,
        title: {
          text: "Cycles",
          style: { fontSize: "12px", fontWeight: "bold", color: "#FF4D4D" }
        },
        labels: {
          style: { colors: "#FF4D4D" }
        }
      }
    ],
    grid: {
      borderColor: "#e0e0e0",
      strokeDashArray: 3,
      padding: { top: 20, right: 10, bottom: 10, left: 10 }
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      markers: { radius: 12 }
    }
  };

  // 🔹 Common inline style for buttons
  const getButtonStyle = (key) => ({
    backgroundColor: timeRange === key ? "#2C67BA" : "#fff",
    color: timeRange === key ? "#fff" : "#000",
    border: "1px solid #ccc",
    padding: "4px 10px",
    borderRadius: "4px",
    marginLeft: "4px",
    cursor: "pointer"
  });
  // useEffect(() => {
  //   if (token) {
  //     handleControllerDropDown(LoginUserData);
  //   }
  // }, [token]);
  const handleControllerDropDown = () => {
    setLoader(true);
    const formdata = new FormData();
    formdata.append("controller_type", 1);
    formdata.append("report_for", 5);

    controllerdropdown(formdata)
      .then((res) => {
        if (res?.data) {
          // setControllerDropDown(res.data || []);
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setLoader(false));
  };
  const onFetchConsumptionChart = (id, device_id, action) => {
    let newFromDate, newToDate;

    if (timeRange === "monthly") {
      // Get current from_date or today if not available
      let current = data?.from_date
        ? dayjs(data.from_date)
        : dayjs().startOf("month");

      if (action === "previous") {
        newFromDate = current.subtract(1, "month").startOf("month");
        newToDate = current.subtract(1, "month").endOf("month");
      } else if (action === "next") {
        newFromDate = current.add(1, "month").startOf("month");
        newToDate = current.add(1, "month").endOf("month");
      } else {
        newFromDate = current.startOf("month");
        newToDate = current.endOf("month");
      }
    }

    // weekly/daily/yearly can stay your existing logic
    else if (timeRange === "weekly") {
      let currentFrom = dayjs(data?.from_date);
      let currentTo = dayjs(data?.to_date);

      if (action === "previous") {
        newFromDate = currentFrom.subtract(7, "day");
        newToDate = currentTo.subtract(7, "day");
      } else if (action === "next") {
        newFromDate = currentFrom.add(7, "day");
        newToDate = currentTo.add(7, "day");
      } else {
        newFromDate = currentFrom;
        newToDate = currentTo;
      }
    }

    // Call API with newFromDate and newToDate
    if (onPressData) {
      onPressData(
        id,
        device_id,
        newFromDate.format("YYYY-MM-DD"),
        newToDate.format("YYYY-MM-DD")
      );
    }
  };

  const timeRangeButtons = [
    // { id: 4, key: "yearly", label: "Yearly" },
    { id: 1, key: "daily", label: "Day" },
    { id: 3, key: "monthly", label: "Month" },
    { id: 2, key: "weekly", label: "Week" }
  ];
  return (
    <div className="pump-runtime-chart" style={{ padding: 8 }}>
      <Row className="align-items-center mb-3 chart-card">
        <Col md={8}>
          <h5 className="mb-1" style={{ fontWeight: "900" }}>
            {title}
          </h5>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                Monitor daily pump activity and cycling efficiency
              </p>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              gap: 5,
              flexDirection: "column"
            }}
          >
            <div style={{ display: "flex", gap: "2px" }}>
              {timeRangeButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => handleButtonClick(btn.key, btn.id)}
                  style={{
                    fontWeight: "400",
                    padding: "6px 10px",
                    fontSize: "15px",
                    borderRadius: "4px",
                    border:
                      timeRange === btn.key
                        ? "1px solid #176BA0"
                        : "1px solid #ccc",
                    backgroundColor:
                      timeRange === btn.key ? "#2C67BA" : "white",
                    color: timeRange == btn.key ? "white" : "black",
                    cursor: "pointer"
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div>
              <div
                className="from_to_date"
                style={{
                  paddingLeft: "10px",
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <CommonSelect
                  styles={{ height: "30px" }}
                  onChange={(data) => {
                    setFieldValue("device_id", data);
                  }}
                  value={values.device_id}
                  options={controllerDropDown?.map((ele) => ({
                    ...ele,
                    label: ele?.controller_name,
                    value: ele?.controller_id
                  }))}
                  placeholder={"Select Device"}
                />
                <div>
                  {timeRange === "weekly" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "140px"
                      }}
                    >
                      {/* Previous Week */}
                      <span
                        onClick={() =>
                          onFetchConsumptionChart(
                            timeRangeButtons?.find(
                              (ele) => ele?.key === timeRange
                            )?.id,
                            values?.device_id,
                            "previous"
                          )
                        }
                        style={{ cursor: "pointer", fontWeight: "bold" }}
                      >
                        {"<"}
                      </span>

                      {/* Current week range */}
                      <span>
                        {`${dayjs(data?.from_date)?.format("DD-MM")} - ${dayjs(
                          data?.to_date
                        )?.format("DD-MM")}`}
                      </span>

                      {/* Next Week (disabled if to_date >= today) */}
                      {(() => {
                        const toDate = dayjs(data?.to_date);
                        const today = dayjs();

                        const isFutureDisabled = toDate.isAfter(today, "day"); // disable if next week exceeds today

                        return (
                          <span
                            onClick={() => {
                              if (!isFutureDisabled) {
                                onFetchConsumptionChart(
                                  timeRangeButtons?.find(
                                    (ele) => ele?.key === timeRange
                                  )?.id,
                                  values?.device_id,
                                  "next"
                                );
                              }
                            }}
                            style={{
                              cursor: isFutureDisabled
                                ? "not-allowed"
                                : "pointer",
                              fontWeight: "bold",
                              opacity: isFutureDisabled ? 0.4 : 1,
                              color: isFutureDisabled ? "#999" : "black"
                            }}
                          >
                            {">"}
                          </span>
                        );
                      })()}
                    </div>
                  )}

                  {timeRange === "monthly" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "140px"
                      }}
                    >
                      {/* Previous Week */}
                      <span
                        onClick={() =>
                          onFetchConsumptionChart(
                            timeRangeButtons?.find(
                              (ele) => ele?.key === timeRange
                            )?.id,
                            values?.device_id,
                            "previous"
                          )
                        }
                        style={{ cursor: "pointer", fontWeight: "bold" }}
                      >
                        {"<"}
                      </span>

                      {/* Current week range */}
                      <span>
                        {`${dayjs(data?.from_date)?.format("DD-MM-YYYY")}`}
                      </span>

                      {/* Next Week (disabled if to_date >= today) */}
                      {(() => {
                        const toDate = dayjs(data?.from_date);
                        const today = dayjs();

                        const isFutureDisabled = toDate.isAfter(today, "month"); // disable if next week exceeds today

                        return (
                          <span
                            onClick={() => {
                              if (!isFutureDisabled) {
                                onFetchConsumptionChart(
                                  timeRangeButtons?.find(
                                    (ele) => ele?.key === timeRange
                                  )?.id,
                                  values?.device_id,
                                  "next"
                                );
                              }
                            }}
                            style={{
                              cursor: isFutureDisabled
                                ? "not-allowed"
                                : "pointer",
                              fontWeight: "bold",
                              opacity: isFutureDisabled ? 0.4 : 1,
                              color: isFutureDisabled ? "#999" : "black"
                            }}
                          >
                            {">"}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <ReactApexChart
        options={chartOptions}
        series={chartData.series}
        type="line"
        height={370}
      />
    </div>
  );
};

export default PumpRuntimeChart;
