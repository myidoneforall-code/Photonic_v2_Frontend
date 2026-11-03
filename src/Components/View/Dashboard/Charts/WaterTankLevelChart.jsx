import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Col, Row } from "reactstrap";
import {
  controllerdropdown,
  WaterTankChart
} from "../../../../Service/ApiService";
import { getCatchMsg } from "../../../../Utilities/Methods";
import CommonSelect from "../../../CommonComponents/CommonSelect";
import { useFormik } from "formik";
import { GetSessionStorage } from "../../../../Utilities/Storage";
import { useSelector } from "react-redux";
import { getCookie } from "../../../../Utilities/Cookie";

const WaterTankLevelChart = ({ title, controllerDropDown }) => {
  const [timeRange, setTimeRange] = useState("week");
  // const [controllerDropDown, setControllerDropDown] = useState([]);
  const [waterTankLevel, setWaterTankLevel] = useState({});
  const token = JSON.parse(getCookie("cookiedata"))?.access_token;
  const [loader, setLoader] = useState(false);

  const formik = useFormik({
    initialValues: {
      device_id: null
    }
  });

  const user = GetSessionStorage("mainUserId");
  console.log(user, "uss");
  const { LoginUserData } = useSelector((state) => state);
  console.log(LoginUserData, "uss");

  // useEffect(() => {
  //   if (token) {
  //     handleControllerDropDown(LoginUserData);
  //   }
  // }, [token]);

  // 🔹 Fetch dropdown list
  const handleControllerDropDown = () => {
    setLoader(true);
    const formdata = new FormData();
    formdata.append("controller_type", 1);
    formdata.append("report_for", 4);

    controllerdropdown(formdata)
      .then((res) => {
        if (res?.data) {
          // setControllerDropDown(res.data || []);
        }
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setLoader(false));
  };

  // 🔹 Fetch chart data
  const handleWaterTankChart = (period_type, controller_id) => {
    setLoader(true);
    const formdata = new FormData();
    formdata.append("period_type", period_type || "1");
    formdata.append("device_type", 1);
    if (controller_id) {
      formdata.append("controller_id", controller_id || "");
    }
    formdata.append("report_for", 4);
    formdata.append("controller_type", 1);

    WaterTankChart(formdata)
      .then((res) => {
        const tankResponse = res?.data?.tank_data?.[0];
        setWaterTankLevel(tankResponse || {});
      })
      .catch((err) => getCatchMsg(err))
      .finally(() => setLoader(false));
  };

  // 🔹 Convert API response into chart format
  const chartData = useMemo(() => {
    if (!waterTankLevel?.tank_data?.length) {
      return {
        series: [{ name: "Water Level", data: [] }],
        categories: []
      };
    }

    return {
      series: [
        {
          name: "Water Level",
          data: waterTankLevel.tank_data.map((item) =>
            Math.round(item.tank_level)
          )
        }
      ],
      categories: waterTankLevel.tank_data.map((item) => item.period)
    };
  }, [waterTankLevel]);

  // 🔹 Chart options with dynamic limits
  const chartOptions = {
    chart: { type: "bar", height: 300, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "90%" } },
    colors: ["#84D6F7"],
    fill: {
      type: "gradient",
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
      labels: { style: { fontSize: "11px", colors: "#666" } }
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        formatter: (val) => `${Math.round(val)}%`,
        style: { fontSize: "11px", colors: "#666" }
      },
      title: {
        text: "Water Level (%)",
        style: { fontSize: "12px", fontWeight: "normal", color: "#666" }
      }
    },
    grid: {
      borderColor: "#e0e0e0",
      strokeDashArray: 3,
      padding: { top: 20, right: 10, bottom: 10, left: 10 }
    },
    annotations: {
      yaxis: [
        {
          y: waterTankLevel?.overall_high_limit,
          borderColor: "#FF6B6B",
          label: {
            text: "Overflow detected",
            style: { background: "#FF6B6B", color: "#fff", fontSize: "11px" }
          }
        },
        {
          y: waterTankLevel?.overall_low_limit,
          borderColor: "#FFA726",
          label: {
            text: "Low Level Threshold",
            style: { background: "#FFA726", color: "#fff", fontSize: "11px" }
          }
        }
      ]
    },
    noData: {
      text: "No Data Found",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#999",
        fontSize: "14px"
      }
    }
  };

  return (
    <div className="water-tank-chart" style={{ padding: 18 }}>
      <Row className="align-items-center justifyContent-center mb-3 chart-card">
        <Col md={8} className="chart-card-left-sec">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h5 className="mb-1">{title}</h5>
              <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                Monitor tank levels, identify trends and review critical events
              </p>
            </div>
          </div>
        </Col>
        <Col md={4} className="">
          <div className="btn-group text-end chart-card-right-sec" role="group">
            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: timeRange === "day" ? "#176BA0" : "#fff",
                color: timeRange === "day" ? "#fff" : "#000",
                border: "1px solid #176BA0",
                marginRight: "5px"
              }}
              onClick={() => {
                setTimeRange("day");
                handleWaterTankChart(1, formik.values?.device_id);
              }}
            >
              Day
            </button>

            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: timeRange === "week" ? "#176BA0" : "#fff",
                color: timeRange === "week" ? "#fff" : "#000",
                border: "1px solid #176BA0",
                marginRight: "5px"
              }}
              onClick={() => {
                setTimeRange("week");
                handleWaterTankChart(2, formik.values?.device_id);
              }}
            >
              Week
            </button>

            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: timeRange === "month" ? "#176BA0" : "#fff",
                color: timeRange === "month" ? "#fff" : "#000",
                border: "1px solid #176BA0"
              }}
              onClick={() => {
                setTimeRange("month");
                handleWaterTankChart(3, formik.values?.device_id);
              }}
            >
              Month
            </button>
          </div>
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end"
            }}
          >
            <div className="from_to_date">
              <CommonSelect
                styles={{ height: "30px" }}
                onChange={(data) => {
                  formik.setFieldValue("device_id", data);
                }}
                value={formik.values.device_id}
                options={controllerDropDown?.map((ele) => ({
                  ...ele,
                  label: ele?.controller_name,
                  value: ele?.controller_id
                }))}
                placeholder={"Select Device"}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Chart */}
      <div>
        <ReactApexChart
          options={chartOptions}
          series={chartData.series}
          type="bar"
          height={300}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 d-flex justify-content-center gap-4">
        <div className="d-flex align-items-center">
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#176BA0",
              borderRadius: "3px",
              marginRight: "8px"
            }}
          ></div>
          <span style={{ fontSize: "12px" }}>Water Level</span>
        </div>
      </div>
    </div>
  );
};

export default WaterTankLevelChart;
