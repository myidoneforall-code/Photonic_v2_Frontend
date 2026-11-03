import React, { useState, useEffect } from "react";
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

export default function VoltLineChart({
  onPressData,
  data,
  title,
  controllerDropDown
}) {
  const [timeRange, setTimeRange] = useState("week");
  // const [controllerDropDown, setControllerDropDown] = useState([]);
  const { LoginUserData } = useSelector((state) => state);
  const [loader, setLoader] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const token = JSON.parse(getCookie("cookiedata"))?.access_token;

  const { values, setFieldValue } = useFormik({
    initialValues: { device_id: null }
  });

  // const handleButtonClick = (range, period_type) => {
  //   setTimeRange(range);
  //   onPressData(period_type, values?.device_id);
  // };

  const handleControllerDropDown = () => {
    setLoader(true);
    const formdata = new FormData();
    formdata.append("controller_type", 1);
    formdata.append("report_for", 5);

    controllerdropdown(formdata)
      .then((res) => {
        // if (res?.data) setControllerDropDown(res.data || []);
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setLoader(false));
  };

  // useEffect(() => {
  //   if (token) handleControllerDropDown(LoginUserData);
  // }, [token]);
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

  const periods =
    data?.aggregated_data?.map((d) => shortenWeekday(d.period)) || [];

  const getSeries = () => [
    {
      name: "R Volt",
      type: "column",
      data:
        selectedColor && selectedColor !== "r"
          ? periods.map(() => 0)
          : data?.aggregated_data?.map((d) => d.r_sum) || []
    },
    {
      name: "Y Volt",
      type: "column",
      data:
        selectedColor && selectedColor !== "y"
          ? periods.map(() => 0)
          : data?.aggregated_data?.map((d) => d.y_sum) || []
    },
    {
      name: "B Volt",
      type: "column",
      data:
        selectedColor && selectedColor !== "b"
          ? periods.map(() => 0)
          : data?.aggregated_data?.map((d) => d.b_sum) || []
    }
  ];

  const chartOptions = {
    chart: {
      stacked: false,
      type: "bar",
      height: 400,
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true
      },
      toolbar: {
        show: false
        // tools: {
        //   download: true,
        //   zoom: true,
        //   zoomin: true,
        //   zoomout: true,
        //   pan: true,
        //   reset: true
        // }
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const seriesIndex = config.seriesIndex;
          const colorMap = ["r", "y", "b"];
          const clickedColor = colorMap[seriesIndex];
          setSelectedColor(
            selectedColor === clickedColor ? null : clickedColor
          );
        }
      }
    },
    plotOptions: {
      bar: {
        columnWidth: "75%", // wider bars
        borderRadius: 1
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    colors: ["#FF4C4C", "#FFD93D", "#4C6FFF"],
    xaxis: {
      categories: periods,
      labels: {
        rotate: -45,
        style: { colors: "#555", fontSize: "12px", fontWeight: 500 }
      },
      tickPlacement: "on",
      scrollbar: {
        enabled: true,
        height: 8,
        track: {
          background: "#f1f1f1"
        },
        thumb: {
          background: "#2C67BA",
          opacity: 0.9
        },
        offsetY: 10
      }
    },
    yaxis: {
      labels: { style: { colors: "#666", fontSize: "12px", fontWeight: 500 } },
      title: { text: "Voltage (V)" }
    },
    tooltip: {
      shared: false,
      theme: "light",
      y: {
        formatter: (val) => `${val.toFixed(0)} V`,
        title: {
          formatter: (seriesName) => `${seriesName}:`
        }
      }
    },
    noData: {
      text: "No Data Found",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#999",
        fontSize: "16px",
        fontWeight: "600",
        fontFamily: "Helvetica, Arial, sans-serif"
      }
    },
    legend: {
      show: true,
      fontSize: "13px",
      fontWeight: 600,
      labels: { colors: "#333" },
      itemMargin: { horizontal: 10 }
    },
    grid: {
      borderColor: "#eee",
      row: { colors: ["#fafafa", "transparent"] }
    }
  };
  const getButtonStyle = (key) => ({
    backgroundColor: timeRange === key ? "#2C67BA" : "#fff",
    color: timeRange === key ? "#fff" : "#000",
    border: "1px solid #ccc",
    padding: "4px 10px",
    borderRadius: "4px",
    marginLeft: "4px",
    cursor: "pointer"
  });
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
  const handleButtonClick = (range, period_type) => {
    if (values?.device_id) {
      setTimeRange(range);

      onPressData(period_type, values?.device_id);
    } else {
      toast.error("Please select device");
    }
  };
  const timeRangeButtons = [
    // { id: 4, key: "yearly", label: "Yearly" },
    { id: 1, key: "daily", label: "Day" },
    { id: 3, key: "monthly", label: "Month" },
    { id: 2, key: "weekly", label: "Week" }
  ];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 3px 12px rgba(0,0,0,0.08)"
      }}
    >
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <p style={{ fontSize: "20px", margin: 0 }}>{title}</p>
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            Monitor Voltage Line Chart
          </p>
        </Col>

        <Col md={4}>
          {/* <div role="group" className="text-end">
            <button
              type="button"
              style={getButtonStyle("day")}
              onClick={() => handleButtonClick("day", 1)}
            >
              Day
            </button>
            <button
              type="button"
              style={getButtonStyle("week")}
              onClick={() => handleButtonClick("week", 2)}
            >
              Week
            </button>
            <button
              type="button"
              style={getButtonStyle("month")}
              onClick={() => handleButtonClick("month", 3)}
            >
              Month
            </button>
          </div> */}
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
        </Col>
      </Row>

      <ReactApexChart
        options={chartOptions}
        series={getSeries()}
        type="bar"
        height={352}
      />
    </div>
  );
}
